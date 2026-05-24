# FastCare Project Context

## Overview

FastCare is a hybrid NLP and Generative AI system designed to process fragmented, multi-year patient records (PDFs) and output a structured, chronological dashboard for emergency room doctors.

## Architectural Topology
- **Next.js Monolith:** Handles frontend UI, backend API routing, database writes (MongoDB), and final LLM processing via an LLM.
- **Python NLP Microservice:** High-performance data ingestion engine handling text extraction, OCR, and local Named Entity Recognition (NER).

## Python NLP Microservice (`/python-nlp-service`)
This microservice acts as the data ingestion pipeline.

### Tech Stack
- **Framework:** FastAPI, Uvicorn (ASGI server)
- **PDF Extraction:** `pdfplumber` (used with `layout=True` to preserve spatial layouts, preventing table columns from bleeding into each other).
- **OCR Engine:** `pytesseract` and `pdf2image` for fallback extraction on scanned or handwritten image-only PDFs.
- **NLP Model:** `spaCy` using the specialized biomedical model `en_ner_bionlp13cg_md`.
- **Validation:** `pydantic`

### Core Capabilities
1. **Batch Processing:** Accepts multiple PDF files alongside frontend-provided patient demographics.
2. **Smart Date Extraction:** Extracts the most relevant document date, prioritizing "Admission Date" or "Discharge Date", handling spaced formats (e.g., `3 / 4 / 2003`), and actively ignoring known publisher watermarks.
3. **Hybrid Text Extraction:** Attempts layout-aware digital text extraction first. If the page yields insufficient text (<50 chars), it falls back to Tesseract OCR.
4. **Medical NER:** Extracts entities and maps them to JSON schema:
   - `DISEASE_OR_SYNDROME` / `PATHOLOGICAL_FORMATION` -> `physiological_conditions`
   - `SIMPLE_CHEMICAL` -> Added to both `allergies` and `regular_medicines` (to be disambiguated later by the LLM).
5. **Page-Level Attribution:** Every extracted medical entity is tagged with its source filename and specific page number.
6. **Production-Ready:** Configured entirely via environment variables (Model Name, Port, Allowed Extensions, Entity Labels) and utilizes standard Python logging.

### Testing
- Live tests can be executed using `test_live_api.py`.
- Usage: `python test_live_api.py samples/*.pdf`
- Outputs individual structured JSON files for each processed PDF.

### DO NOT MAKE ANY CHANGES OUTSIDE OF /python-nlp-service 

### Data Ingestion Pipeline Structure

python-nlp-service/
├── core/
│   ├── __init__.py
│   ├── extractor.py     # Only handles pdfplumber + Tesseract OCR fallback
│   ├── nlp_engine.py    # Only handles spaCy extraction & deduplication
│   └── date_parser.py   # Only handles regex clinical date extraction
├── main.py              # Only handles FastAPI routes, Pydantic schemas, and traffic control
├── requirements.txt
└── test_pipeline.py     # A basic script to test your modules locally without FastAPI
