"""Offline pipeline test script — mirrors main.py without the HTTP layer.

Usage:
    python test_pipeline.py <path_to_pdf> [<path_to_pdf> ...]

Outputs one JSON object per PDF to stdout.
"""

import io
import json
import os
import sys

import pdfplumber
from pdf2image import convert_from_bytes

from core.date_parser import extract_date
from core.extractor import _page_needs_ocr, extract_text_from_page
from core.nlp_engine import deduplicate_entities, extract_entities


def process_pdf_file(pdf_path: str) -> dict:
    """Process a single PDF file and return a structured result dict."""
    if not os.path.exists(pdf_path):
        return {"error": f"File not found: {pdf_path}"}

    filename = os.path.basename(pdf_path)

    with open(pdf_path, "rb") as fh:
        contents = fh.read()

    raw_text_parts: list[str] = []
    phys_conds: list = []
    allergies: list = []
    reg_meds: list = []
    doc_date: str | None = None
    images: list = []

    try:
        pdf = pdfplumber.open(io.BytesIO(contents))
    except Exception as exc:
        return {"error": f"Cannot open PDF '{filename}': {exc}"}

    try:
        for page_num, page in enumerate(pdf.pages, start=1):
            # ── OCR trigger on first low-text page ──
            if not images and _page_needs_ocr(page):
                try:
                    images = convert_from_bytes(contents)
                except Exception:
                    # Proceed without OCR
                    pass

            page_text = extract_text_from_page(page, page_num, filename, images)

            if not page_text.strip():
                continue

            if doc_date is None:
                doc_date = extract_date(page_text)

            raw_text_parts.append(
                f"\n--- [START SOURCE: {filename} | PAGE: {page_num}] ---\n"
                f"{page_text}\n"
                f"--- [END SOURCE: {filename} | PAGE: {page_num}] ---\n"
            )

            phys, allg, meds = extract_entities(page_text, filename, page_num)
            phys_conds.extend(phys)
            allergies.extend(allg)
            reg_meds.extend(meds)

    finally:
        pdf.close()

    phys_conds = deduplicate_entities(phys_conds)
    allergies = deduplicate_entities(allergies)
    reg_meds = deduplicate_entities(reg_meds)

    return {
        "filename": filename,
        "date": doc_date,
        "medical_history": {
            "physiological_conditions": [
                {"entity": e[0], "page": e[2]} for e in phys_conds
            ],
            "allergies": [
                {"entity": e[0], "page": e[2]} for e in allergies
            ],
            "regular_medicines": [
                {"entity": e[0], "page": e[2]} for e in reg_meds
            ],
        },
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_pipeline.py <path_to_pdf> [<path_to_pdf> ...]")
        sys.exit(1)

    for pdf_path in sys.argv[1:]:
        print(f"\n{'=' * 60}")
        print(f"Processing: {pdf_path}")
        print(f"{'=' * 60}")
        result = process_pdf_file(pdf_path)
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()