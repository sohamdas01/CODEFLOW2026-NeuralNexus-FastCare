import asyncio
import json
import logging
import os
import io
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pdfplumber
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

from core.date_parser import extract_date
from core.extractor import parse_medical_page

from dotenv import load_dotenv
load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
APP_TITLE          = os.getenv("APP_TITLE", "FastCare NLP Ingestion Service")
ALLOWED_EXTENSIONS = tuple(os.getenv("ALLOWED_EXTENSIONS", ".pdf").split(","))
HOST               = os.getenv("HOST", "0.0.0.0")
PORT               = int(os.getenv("PORT", "8000"))
LOG_LEVEL          = os.getenv("LOG_LEVEL", "INFO")
MAX_FILE_MB        = int(os.getenv("MAX_FILE_MB", "20"))
MAX_TEXT_CHARS     = int(os.getenv("MAX_TEXT_CHARS", "100000"))
MAX_FILE_BYTES     = MAX_FILE_MB * 1024 * 1024

MONGO_URI          = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB           = os.getenv("MONGO_DB", "fastcare")
MONGO_COLLECTION   = os.getenv("MONGO_COLLECTION", "patient_records")

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

_executor = ThreadPoolExecutor(max_workers=int(os.getenv("WORKER_THREADS", "4")))

# ---------------------------------------------------------------------------
# FastAPI app + MongoDB client
# ---------------------------------------------------------------------------

# Motor client is created once at startup and reused across requests.
# It is intentionally module-level so the connection pool is shared.
_mongo_client: Optional[AsyncIOMotorClient] = None


def _get_collection():
    return _mongo_client[MONGO_DB][MONGO_COLLECTION]


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global _mongo_client
    _mongo_client = AsyncIOMotorClient(MONGO_URI)
    try:
        result = await _mongo_client.admin.command("ping")
        print("Ping result:", result)
        logger.info("Connected to MongoDB at %s (db: %s)", MONGO_URI, MONGO_DB)
    except Exception as exc:
        logger.warning("MongoDB ping failed at startup: %s", exc)

    yield  # app runs here

    # Shutdown
    if _mongo_client:
        _mongo_client.close()
        logger.info("MongoDB connection closed.")

app = FastAPI(title=APP_TITLE, lifespan=lifespan)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class ProcessedRecord(BaseModel):
    filename: str
    date: Optional[str] = None
    raw_text: str


class IngestionResponse(BaseModel):
    patient: Dict[str, Any]
    records: List[ProcessedRecord]
    mongo_id: str   # inserted document _id, useful for downstream reference


# ---------------------------------------------------------------------------
# Core processing
# ---------------------------------------------------------------------------

def _page_dict_to_text(page_data: dict) -> str:
    """
    Merge a parse_medical_page dict into a single plain string.
    Combines flowing prose text and any OCR hits from embedded images.
    Tables are intentionally excluded — structured data adds noise for LLMs.
    """
    parts = []

    text = page_data.get("text")
    if isinstance(text, str) and text.strip():
        parts.append(text)
    elif isinstance(text, (list, tuple)):
        joined = " ".join(str(t) for t in text if t)
        if joined.strip():
            parts.append(joined)

    for ocr_hit in page_data.get("ocr_text", []):
        ocr_text = ocr_hit.get("text", "")
        if isinstance(ocr_text, str) and ocr_text.strip():
            parts.append(f"[OCR IMAGE TEXT]\n{ocr_text}")

    return "\n\n".join(parts)


def _process_single_pdf(contents: bytes, filename: str) -> ProcessedRecord:
    """
    Process one PDF synchronously (runs in a thread pool).

    Raises
    ------
    ValueError — unreadable / malformed PDF
    """
    raw_text_parts: List[str] = []
    doc_date: Optional[str] = None
    total_chars = 0

    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_data = parse_medical_page(page)
                page_num  = page_data["meta"]["page_number"]

                if page_data["meta"]["errors"]:
                    logger.warning(
                        "Page %d of %s had errors: %s",
                        page_num, filename, page_data["meta"]["errors"],
                    )

                page_text = _page_dict_to_text(page_data)

                if not page_text.strip():
                    logger.debug("Page %d of %s: no extractable text.", page_num, filename)
                    continue

                if doc_date is None:
                    doc_date = extract_date(page_text)

                if total_chars < MAX_TEXT_CHARS:
                    marker_open  = f"\n--- [SOURCE: {filename} | PAGE: {page_num}] ---\n"
                    marker_close = f"\n--- [END: {filename} | PAGE: {page_num}] ---\n"
                    available    = MAX_TEXT_CHARS - total_chars
                    chunk        = page_text[:available]
                    raw_text_parts.append(f"{marker_open}{chunk}{marker_close}")
                    total_chars += len(chunk)

                    if total_chars >= MAX_TEXT_CHARS:
                        logger.warning(
                            "%s: raw_text truncated at %d chars (MAX_TEXT_CHARS reached).",
                            filename, MAX_TEXT_CHARS,
                        )

    except Exception as exc:
        raise ValueError(f"Cannot process '{filename}': {exc}") from exc

    return ProcessedRecord(
        filename=filename,
        date=doc_date,
        raw_text="".join(raw_text_parts),
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Liveness / readiness probe. Also checks MongoDB connectivity."""
    try:
        await _mongo_client.admin.command("ping")
        mongo_status = "healthy"
    except Exception as exc:
        logger.error("MongoDB ping failed: %s", exc)
        mongo_status = "unavailable"
    return {"status": "healthy", "mongo": mongo_status}


# ---------------------------------------------------------------------------
# Main ingestion endpoint
# ---------------------------------------------------------------------------

@app.post(
    "/process-documents",
    response_model=IngestionResponse,
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "patient_name":    {"type": "string"},
                            "patient_details": {"type": "string"},
                            "files": {
                                "type": "array",
                                "items": {"type": "string", "format": "binary"},
                            },
                        },
                        "required": ["patient_name", "patient_details", "files"],
                    }
                }
            }
        }
    },
)
async def process_documents(
    patient_name:    str              = Form(...),
    patient_details: str              = Form(...),
    files:           List[UploadFile] = File(...),
):
    """
    Accept patient demographics and one or more PDF files.
    Extracts text, writes the full result to MongoDB, and returns it.
    """
    # Parse patient details
    try:
        details = json.loads(patient_details)
    except json.JSONDecodeError:
        logger.warning("patient_details is not valid JSON; storing as raw string.")
        details = {"raw_details": patient_details}

    processed_records: List[ProcessedRecord] = []

    for file in files:
        if not file.filename or not file.filename.endswith(ALLOWED_EXTENSIONS):
            logger.info("Skipping unsupported file: %s", file.filename)
            continue

        contents = await file.read()

        if len(contents) > MAX_FILE_BYTES:
            logger.warning(
                "Skipping '%s': %d MB exceeds the %d MB limit.",
                file.filename,
                len(contents) // (1024 * 1024),
                MAX_FILE_MB,
            )
            continue

        logger.info("Processing: %s (%d bytes)", file.filename, len(contents))

        try:
            loop   = asyncio.get_event_loop()
            record = await loop.run_in_executor(
                _executor, _process_single_pdf, contents, file.filename
            )
            processed_records.append(record)
            logger.info("Successfully processed %s.", file.filename)

        except ValueError as exc:
            logger.error("Skipping malformed PDF '%s': %s", file.filename, exc)
            continue

        except Exception:
            logger.exception("Unexpected error processing %s.", file.filename)
            raise HTTPException(
                status_code=500,
                detail=f"Internal error while processing {file.filename}.",
            )

    # ── Write to MongoDB ──
    document = {
        "patient": {"name": patient_name, "details": details},
        "records": [r.model_dump() for r in processed_records],
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        result    = await _get_collection().insert_one(document)
        mongo_id  = str(result.inserted_id)
        logger.info("Saved ingestion result to MongoDB with _id: %s", mongo_id)
    except Exception:
        logger.exception("Failed to write ingestion result to MongoDB.")
        raise HTTPException(
            status_code=500,
            detail="Processed successfully but failed to persist to database.",
        )

    return IngestionResponse(
        patient={"name": patient_name, "details": details},
        records=processed_records,
        mongo_id=mongo_id,
    )


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting %s on %s:%s", APP_TITLE, HOST, PORT)
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)