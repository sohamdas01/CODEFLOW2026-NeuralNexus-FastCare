"""
tests/test_main.py
------------------
Automated tests for main.py (no NLP pipeline).
Requires: pytest pytest-asyncio httpx reportlab

    pip install pytest pytest-asyncio httpx reportlab
    pytest tests/test_main.py -v
"""

import io
import json

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from main import app, _process_single_pdf, MAX_FILE_BYTES

pytestmark = pytest.mark.asyncio

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_pdf(text: str) -> bytes:
    """Create a minimal single-page text PDF using reportlab."""
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    y = 750
    for line in text.splitlines():
        c.drawString(50, y, line[:100])   # cap line length to avoid overflow
        y -= 15
        if y < 50:
            c.showPage()
            y = 750
    c.save()
    return buf.getvalue()


def _make_multi_page_pdf(pages: list[str]) -> bytes:
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    for page_text in pages:
        y = 750
        for line in page_text.splitlines():
            c.drawString(50, y, line[:100])
            y -= 15
        c.showPage()
    c.save()
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def clinical_pdf():
    return _make_pdf(
        "Admission Date: 03/15/2023\n"
        "Patient: John Doe\n"
        "Diagnosis: Type 2 diabetes mellitus\n"
        "Prescribed: Metformin 500mg\n"
    )


@pytest.fixture
def blank_pdf():
    return _make_pdf("")


@pytest.fixture
def multi_page_pdf():
    return _make_multi_page_pdf([
        "Admission Date: 01/10/2023\nDiagnosis: hypertension",
        "Discharge Date: 01/20/2023\nFollow-up in 4 weeks",
    ])


@pytest.fixture
def patient_form():
    return {
        "patient_name": "Jane Doe",
        "patient_details": json.dumps({"dob": "1980-01-01", "id": "P001"}),
    }


async def _post(client, form_data, files):
    return await client.post("/process-documents", data=form_data, files=files)


# ---------------------------------------------------------------------------
# /health
# ---------------------------------------------------------------------------

async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "healthy"}


# ---------------------------------------------------------------------------
# _process_single_pdf (unit level — no HTTP)
# ---------------------------------------------------------------------------

def test_process_single_pdf_returns_record(clinical_pdf):
    record = _process_single_pdf(clinical_pdf, "test.pdf")
    assert record.filename == "test.pdf"
    assert isinstance(record.raw_text, str)
    assert len(record.raw_text) > 0


def test_process_single_pdf_extracts_date(clinical_pdf):
    record = _process_single_pdf(clinical_pdf, "test.pdf")
    assert record.date == "03/15/2023"


def test_process_single_pdf_blank_has_no_text(blank_pdf):
    record = _process_single_pdf(blank_pdf, "blank.pdf")
    assert record.raw_text.strip() == ""
    assert record.date is None


def test_process_single_pdf_provenance_markers(clinical_pdf):
    """raw_text should contain source/page markers for LLM provenance."""
    record = _process_single_pdf(clinical_pdf, "test.pdf")
    assert "[SOURCE: test.pdf | PAGE: 1]" in record.raw_text
    assert "[END: test.pdf | PAGE: 1]" in record.raw_text


def test_process_single_pdf_multi_page(multi_page_pdf):
    record = _process_single_pdf(multi_page_pdf, "multi.pdf")
    assert "[PAGE: 1]" in record.raw_text
    assert "[PAGE: 2]" in record.raw_text
    # Date from page 1 wins
    assert record.date == "01/10/2023"


def test_process_single_pdf_raises_on_corrupt_bytes():
    with pytest.raises(ValueError, match="Cannot open"):
        _process_single_pdf(b"not a pdf at all", "corrupt.pdf")


def test_process_single_pdf_text_capped(monkeypatch):
    """raw_text should be truncated when MAX_TEXT_CHARS is exceeded."""
    monkeypatch.setattr("main.MAX_TEXT_CHARS", 50)
    pdf = _make_pdf("A" * 5000)
    record = _process_single_pdf(pdf, "big.pdf")
    # raw_text includes markers so check the actual text portion is capped
    assert len(record.raw_text) <= 50 + 200   # 200 slack for marker overhead


# ---------------------------------------------------------------------------
# /process-documents — happy path
# ---------------------------------------------------------------------------

async def test_endpoint_happy_path(clinical_pdf, patient_form):
    files = [("files", ("record.pdf", io.BytesIO(clinical_pdf), "application/pdf"))]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    assert r.status_code == 200
    body = r.json()
    assert body["patient"]["name"] == "Jane Doe"
    assert body["patient"]["details"]["id"] == "P001"
    assert len(body["records"]) == 1
    assert body["records"][0]["filename"] == "record.pdf"
    assert body["records"][0]["date"] == "03/15/2023"


async def test_endpoint_multiple_pdfs(patient_form):
    pdf1 = _make_pdf("Admission Date: 01/01/2023\nDiagnosis: asthma")
    pdf2 = _make_pdf("Discharge Date: 02/01/2023\nDiagnosis: pneumonia")
    files = [
        ("files", ("a.pdf", io.BytesIO(pdf1), "application/pdf")),
        ("files", ("b.pdf", io.BytesIO(pdf2), "application/pdf")),
    ]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    assert r.status_code == 200
    assert len(r.json()["records"]) == 2


async def test_endpoint_raw_text_contains_markers(clinical_pdf, patient_form):
    files = [("files", ("r.pdf", io.BytesIO(clinical_pdf), "application/pdf"))]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    raw = r.json()["records"][0]["raw_text"]
    assert "[SOURCE:" in raw
    assert "[END:" in raw


# ---------------------------------------------------------------------------
# /process-documents — edge cases
# ---------------------------------------------------------------------------

async def test_unsupported_file_type_skipped(patient_form):
    files = [("files", ("notes.txt", io.BytesIO(b"hello"), "text/plain"))]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    assert r.status_code == 200
    assert r.json()["records"] == []


async def test_malformed_pdf_skipped_not_500(patient_form):
    files = [("files", ("bad.pdf", io.BytesIO(b"not a pdf"), "application/pdf"))]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    assert r.status_code == 200
    assert r.json()["records"] == []


async def test_invalid_patient_details_stored_as_raw_string(clinical_pdf):
    form = {"patient_name": "John", "patient_details": "not {{ valid json"}
    files = [("files", ("r.pdf", io.BytesIO(clinical_pdf), "application/pdf"))]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, form, files)
    assert r.status_code == 200
    assert "raw_details" in r.json()["patient"]["details"]


async def test_oversized_file_skipped(patient_form, monkeypatch):
    monkeypatch.setattr("main.MAX_FILE_BYTES", 10)
    pdf = _make_pdf("Admission Date: 01/01/2023")
    files = [("files", ("big.pdf", io.BytesIO(pdf), "application/pdf"))]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    assert r.status_code == 200
    assert r.json()["records"] == []


async def test_mixed_valid_and_invalid_files(patient_form, clinical_pdf):
    """Valid PDF should still be processed even when accompanied by bad files."""
    files = [
        ("files", ("bad.pdf",    io.BytesIO(b"garbage"),    "application/pdf")),
        ("files", ("good.pdf",   io.BytesIO(clinical_pdf),  "application/pdf")),
        ("files", ("notes.txt",  io.BytesIO(b"text file"),  "text/plain")),
    ]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, files)
    assert r.status_code == 200
    records = r.json()["records"]
    assert len(records) == 1
    assert records[0]["filename"] == "good.pdf"


async def test_no_files_returns_empty_records(patient_form):
    """Sending no files should return 200 with an empty records list."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await _post(c, patient_form, [])
    assert r.status_code == 200
    assert r.json()["records"] == []