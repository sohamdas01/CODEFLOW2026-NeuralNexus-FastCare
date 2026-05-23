import io
import json
import logging
import os
from typing import Any, Dict, List, Optional

import pdfplumber
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pdf2image import convert_from_bytes
from pydantic import BaseModel

from core.date_parser import extract_date
from core.extractor import _page_needs_ocr, extract_text_from_page
from core.nlp_engine import deduplicate_entities, extract_entities

# ---------------------------------------------------------------------------
# Configuration (all via environment variables)
# ---------------------------------------------------------------------------
APP_TITLE = os.getenv("APP_TITLE", "FastCare NLP Ingestion Service")
ALLOWED_EXTENSIONS = tuple(os.getenv("ALLOWED_EXTENSIONS", ".pdf").split(","))
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title=APP_TITLE)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class MedicalEntity(BaseModel):
    entity: str
    source: str
    page: int


class MedicalHistory(BaseModel):
    physiological_conditions: List[MedicalEntity]
    allergies: List[MedicalEntity]
    regular_medicines: List[MedicalEntity]


class ProcessedRecord(BaseModel):
    filename: str
    date: Optional[str] = None
    medical_history: MedicalHistory
    raw_text: str


class IngestionResponse(BaseModel):
    patient: Dict[str, Any]
    records: List[ProcessedRecord]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _raw_entities_to_pydantic(entities_raw: list) -> list[MedicalEntity]:
    """Convert deduplicated raw entities (list of tuples) to Pydantic models."""
    deduped = deduplicate_entities(entities_raw)
    return [MedicalEntity(entity=e[0], source=e[1], page=e[2]) for e in deduped]


def _process_single_pdf(
    contents: bytes, filename: str
) -> ProcessedRecord:
    """
    Process a single PDF file and return a structured ``ProcessedRecord``.

    Raises ``ValueError`` for malformed PDFs and ``RuntimeError`` for
    processing failures that should propagate to the caller.
    """
    raw_text_parts: list[str] = []
    phys_conds_raw: list = []
    allergies_raw: list = []
    reg_meds_raw: list = []
    doc_date: Optional[str] = None

    images: list = []

    try:
        pdf = pdfplumber.open(io.BytesIO(contents))
    except Exception as exc:
        raise ValueError(f"Cannot open PDF '{filename}': {exc}") from exc

    try:
        for page_num, page in enumerate(pdf.pages, start=1):
            # ── OCR trigger: convert all pages to images on first low-text page ──
            if not images and _page_needs_ocr(page):
                logger.info("Triggering OCR image conversion for %s", filename)
                try:
                    images = convert_from_bytes(contents)
                except Exception:
                    logger.exception(
                        "Image conversion failed for %s; OCR fallback will be unavailable.",
                        filename,
                    )
                    # Keep images=[] so OCR is skipped gracefully

            page_text = extract_text_from_page(page, page_num, filename, images)

            if not page_text.strip():
                logger.debug("Page %d of %s: no extractable text.", page_num, filename)
                continue

            # ── Date extraction (first page with text wins) ──
            if doc_date is None:
                doc_date = extract_date(page_text)

            # ── Accumulate raw text with source markers ──
            raw_text_parts.append(
                f"\n--- [START SOURCE: {filename} | PAGE: {page_num}] ---\n"
                f"{page_text}\n"
                f"--- [END SOURCE: {filename} | PAGE: {page_num}] ---\n"
            )

            phys, allg, meds = extract_entities(page_text, filename, page_num)
            phys_conds_raw.extend(phys)
            allergies_raw.extend(allg)
            reg_meds_raw.extend(meds)

    finally:
        pdf.close()

    return ProcessedRecord(
        filename=filename,
        date=doc_date,
        medical_history=MedicalHistory(
            physiological_conditions=_raw_entities_to_pydantic(phys_conds_raw),
            allergies=_raw_entities_to_pydantic(allergies_raw),
            regular_medicines=_raw_entities_to_pydantic(reg_meds_raw),
        ),
        raw_text="".join(raw_text_parts),
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    """Liveness/readiness probe."""
    return {"status": "healthy"}


# ---------------------------------------------------------------------------
# Main ingestion endpoint
# ---------------------------------------------------------------------------
@app.post("/process-documents", response_model=IngestionResponse)
async def process_documents(
    patient_name: str = Form(...),
    patient_details: str = Form(...),
    files: List[UploadFile] = File(...),
):
    """Accept patient demographics + PDFs; return structured medical history."""
    # ── Parse patient details ──
    try:
        details = json.loads(patient_details)
    except json.JSONDecodeError:
        logger.warning(
            "patient_details is not valid JSON; storing as raw string."
        )
        details = {"raw_details": patient_details}

    # ── Process each uploaded PDF ──
    processed_records: list[ProcessedRecord] = []

    for file in files:
        if not file.filename or not file.filename.endswith(ALLOWED_EXTENSIONS):
            logger.info("Skipping unsupported file: %s", file.filename)
            continue

        logger.info("Processing document: %s", file.filename)

        try:
            contents = await file.read()
            record = _process_single_pdf(contents, file.filename)
            processed_records.append(record)
            logger.info("Successfully processed %s.", file.filename)

        except ValueError as exc:
            # Malformed PDF — log and skip instead of failing the whole batch
            logger.error("Skipping malformed PDF '%s': %s", file.filename, exc)
            continue

        except Exception:
            logger.exception("Unexpected error processing %s", file.filename)
            raise HTTPException(
                status_code=500,
                detail=f"Internal error while processing {file.filename}",
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

    logger.info("Starting server on %s:%s", HOST, PORT)
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)