import asyncio
import json
import logging
import os
import io
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
import pdfplumber

from core.date_parser import extract_date
from core.extractor import parse_medical_page   # we now use the page‑level function directly

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
APP_TITLE          = os.getenv("APP_TITLE", "FastCare NLP Ingestion Service")
ALLOWED_EXTENSIONS = tuple(os.getenv("ALLOWED_EXTENSIONS", ".pdf").split(","))
HOST               = os.getenv("HOST", "0.0.0.0")
PORT               = int(os.getenv("PORT", "8000"))
LOG_LEVEL          = os.getenv("LOG_LEVEL", "INFO")
MAX_FILE_MB        = int(os.getenv("MAX_FILE_MB", "20"))
MAX_TEXT_CHARS     = int(os.getenv("MAX_TEXT_CHARS", "100000"))  # ~25k tokens
MAX_FILE_BYTES     = MAX_FILE_MB * 1024 * 1024

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Thread pool for blocking PDF work — keeps the async event loop free
_executor = ThreadPoolExecutor(max_workers=int(os.getenv("WORKER_THREADS", "4")))

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title=APP_TITLE)

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

# ---------------------------------------------------------------------------
# Core processing
# ---------------------------------------------------------------------------

def _page_dict_to_text(page_data: dict) -> str:
    """
    Merge a parse_medical_page dict into a single plain string.
    Combines flowing prose text and any OCR hits from embedded images.
    Tables are intentionally excluded — they are structured data and
    would add noise when passed as plain text to an LLM.
    """
    parts = []

    text = page_data.get("text")
    if isinstance(text, str) and text.strip():
        parts.append(text)
    elif isinstance(text, (list, tuple)):
        # Defensive: flatten if something upstream returned a sequence
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
    ValueError   — unreadable / malformed PDF
    RuntimeError — processing failed after opening
    """
    raw_text_parts: List[str] = []
    doc_date: Optional[str] = None
    total_chars = 0

    try:
        # Open the PDF from memory – pdfplumber accepts a BytesIO object
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_data = parse_medical_page(page)   # uses default OCR settings
                page_num = page_data["meta"]["page_number"]

                if page_data["meta"]["errors"]:
                    logger.warning(
                        "Page %d of %s had errors: %s",
                        page_num, filename, page_data["meta"]["errors"],
                    )

                page_text = _page_dict_to_text(page_data)

                if not page_text.strip():
                    logger.debug("Page %d of %s: no extractable text.", page_num, filename)
                    continue

                # Date: first hit per document wins
                if doc_date is None:
                    doc_date = extract_date(page_text)

                # Accumulate raw text with provenance markers, up to the char cap
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
    """Liveness / readiness probe."""
    return {"status": "healthy"}

# ---------------------------------------------------------------------------
# Main ingestion endpoint
# ---------------------------------------------------------------------------

@app.post("/process-documents", response_model=IngestionResponse)
async def process_documents(
    patient_name:    str              = Form(...),
    patient_details: str              = Form(...),
    files:           List[UploadFile] = File(...),
):
    """
    Accept patient demographics and one or more PDF files.
    Returns structured provenance-marked text ready to pass to an LLM.
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
            # Malformed PDF — skip and continue with the rest of the batch
            logger.error("Skipping malformed PDF '%s': %s", file.filename, exc)
            continue

        except Exception:
            logger.exception("Unexpected error processing %s.", file.filename)
            raise HTTPException(
                status_code=500,
                detail=f"Internal error while processing {file.filename}.",
            )

    return IngestionResponse(
        patient={"name": patient_name, "details": details},
        records=processed_records,
    )

# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting %s on %s:%s", APP_TITLE, HOST, PORT)
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)