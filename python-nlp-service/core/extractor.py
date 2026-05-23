"""
medical_pdf_parser.py
---------------------
Robust extraction of tables, clean text, and OCR text from medical PDF pages.
Requires: pdfplumber, opencv-python, pytesseract, Pillow

Install:
    pip install pdfplumber opencv-python pytesseract Pillow
    # Also install Tesseract binary: https://github.com/tesseract-ocr/tesseract
"""

import re
import logging
import traceback
import pdfplumber
import cv2
import pytesseract
import numpy as np
from PIL import Image

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_text(raw: str) -> str:
    """
    Normalize extracted PDF text:
    - Collapse runs of whitespace/blank lines
    - Fix soft-hyphen line breaks (e.g. "diabe-\ntes" → "diabetes")
    - Strip page-number artifacts (lone integers on a line)
    """
    if not raw:
        return ""
    # Re-join soft-hyphenated words across line breaks
    text = re.sub(r"-\n(\S)", r"\1", raw)
    # Remove lines that are just a standalone page number
    text = re.sub(r"(?m)^\s*\d{1,4}\s*$", "", text)
    # Collapse multiple blank lines into one
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _render_page_region_as_image(page, bbox, dpi: int = 300):
    """
    Crop the given bbox from a pdfplumber page and render it at `dpi`.
    Returns a numpy uint8 array (BGR), or None on failure.

    pdfplumber image dicts use (x0, top, x1, bottom) in PDF user-space
    coordinates (origin = bottom-left). page.crop() uses the same space.
    """
    try:
        cropped = page.crop(bbox)
        # to_image() renders via pypdfium2/Pillow; resolution maps to DPI.
        pil_img = cropped.to_image(resolution=dpi).original
        return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as exc:
        logger.warning("Region render failed for bbox %s: %s", bbox, exc)
        return None


def _ocr_image(bgr_img) -> dict:
    """
    Binarize a BGR numpy image and run Tesseract.
    Returns {"text": str, "confidence": float}.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)

    # Adaptive threshold handles uneven illumination common in scanned records
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31,  # neighbourhood size (must be odd)
        C=10,          # constant subtracted from mean
    )

    # Denoise lightly — helps with scan artefacts without blurring text
    denoised = cv2.fastNlMeansDenoising(binary, h=10)

    # Tesseract: psm 6 = assume a uniform block of text (good default for
    # cropped regions). Use psm 3 (auto) for full-page fallback.
    custom_config = r"--oem 3 --psm 6"
    data = pytesseract.image_to_data(
        denoised,
        config=custom_config,
        output_type=pytesseract.Output.DICT,
    )

    words = [
        w for w, conf in zip(data["text"], data["conf"])
        if int(conf) > 0 and w.strip()
    ]
    confidences = [int(c) for c in data["conf"] if int(c) > 0]

    return {
        "text": " ".join(words),
        "confidence": round(sum(confidences) / len(confidences), 1) if confidences else 0.0,
    }


def _bbox_overlaps(obj, table_bboxes):
    """
    Return True if a pdfplumber character/word object overlaps any table bbox.
    All coordinates are in PDF user-space (origin = bottom-left of page).
    """
    ox0, oy0, ox1, oy1 = obj.get("x0"), obj.get("top"), obj.get("x1"), obj.get("bottom")
    if any(v is None for v in (ox0, oy0, ox1, oy1)):
        return False  # object lacks spatial info — keep it
    for (tx0, ty0, tx1, ty1) in table_bboxes:
        if ox0 < tx1 and ox1 > tx0 and oy0 < ty1 and oy1 > ty0:
            return True
    return False


def _infer_table_headers(raw_table: list) -> dict:
    """
    Convert a raw list-of-lists table into a list of dicts using the first
    non-None row as the header.  Falls back to column indices if no header row.
    """
    if not raw_table or not any(raw_table):
        return {"headers": [], "rows": []}

    # Find the first row that has at least one non-empty cell
    header_row_idx = 0
    for i, row in enumerate(raw_table):
        if any(cell is not None and str(cell).strip() for cell in row):
            header_row_idx = i
            break

    headers = [
        str(cell).strip() if cell is not None else f"col_{j}"
        for j, cell in enumerate(raw_table[header_row_idx])
    ]
    # Deduplicate blank/duplicate headers
    seen = {}
    deduped = []
    for h in headers:
        h = h or "col"
        count = seen.get(h, 0)
        deduped.append(h if count == 0 else f"{h}_{count}")
        seen[h] = count + 1
    headers = deduped

    rows = []
    for row in raw_table[header_row_idx + 1:]:
        row_dict = {
            headers[j]: (str(cell).strip() if cell is not None else "")
            for j, cell in enumerate(row)
        }
        rows.append(row_dict)

    return {"headers": headers, "rows": rows}


# ---------------------------------------------------------------------------
# Core parser
# ---------------------------------------------------------------------------

def parse_medical_page(page, ocr_dpi: int = 300, ocr_min_area: int = 5000):
    """
    Extract structured tables, clean flowing text, and OCR text from a
    pdfplumber Page object.

    Parameters
    ----------
    page : pdfplumber.page.Page
    ocr_dpi : int
        Render resolution for image regions sent to Tesseract.
        300 is the minimum recommended for reliable OCR.
    ocr_min_area : int
        Minimum pixel area (at 72 DPI user-space units squared) below which
        an embedded image is skipped — avoids wasting time on tiny icons/logos.

    Returns
    -------
    dict with keys:
        tables   : list[dict]  — each has "headers" and "rows"
        text     : str         — clean, normalised prose text
        ocr_text : list[dict]  — each has "bbox", "text", "confidence"
        meta     : dict        — page_number, image_count, table_count, errors
    """
    result = {
        "tables": [],
        "text": "",
        "ocr_text": [],
        "meta": {
            "page_number": page.page_number,
            "image_count": 0,
            "table_count": 0,
            "errors": [],
        },
    }

    # ------------------------------------------------------------------ #
    # 1. Structured table extraction
    # ------------------------------------------------------------------ #
    table_bboxes = []
    try:
        tables = page.find_tables()
        for table in tables:
            try:
                raw = table.extract()
                result["tables"].append(_infer_table_headers(raw))
                table_bboxes.append(table.bbox)  # (x0, top, x1, bottom)
            except Exception as exc:
                msg = f"Table extract error: {exc}"
                logger.warning("Page %d — %s", page.page_number, msg)
                result["meta"]["errors"].append(msg)
        result["meta"]["table_count"] = len(result["tables"])
    except Exception as exc:
        msg = f"find_tables() failed: {exc}"
        logger.error("Page %d — %s", page.page_number, msg)
        result["meta"]["errors"].append(msg)

    # ------------------------------------------------------------------ #
    # 2. Clean flowing text (exclude table regions)
    # ------------------------------------------------------------------ #
    try:
        if table_bboxes:
            # pdfplumber's filter() operates on individual character objects.
            # pdfplumber uses (x0, top, x1, bottom) for chars — same as table.bbox.
            text_page = page.filter(
                lambda obj: obj.get("object_type") != "char"
                or not _bbox_overlaps(obj, table_bboxes)
            )
            raw_text = text_page.extract_text() or ""
        else:
            raw_text = page.extract_text() or ""
        result["text"] = _clean_text(raw_text)
    except Exception as exc:
        msg = f"Text extraction failed: {exc}"
        logger.error("Page %d — %s", page.page_number, msg)
        result["meta"]["errors"].append(msg)

    # ------------------------------------------------------------------ #
    # 3. OCR for embedded images
    # ------------------------------------------------------------------ #
    images = page.images or []
    result["meta"]["image_count"] = len(images)

    for img in images:
        try:
            # pdfplumber image dicts expose x0, top, x1, bottom
            # (NOT y0/y1 — those are PDF-native coords; "top"/"bottom" are
            # already flipped to pdfplumber's coordinate system)
            x0   = img.get("x0",     0)
            top  = img.get("top",    0)
            x1   = img.get("x1",     0)
            bot  = img.get("bottom", 0)

            # Skip tiny images (icons, bullets, decorative lines)
            area = (x1 - x0) * (bot - top)
            if area < ocr_min_area:
                continue

            bbox = (x0, top, x1, bot)
            bgr_img = _render_page_region_as_image(page, bbox, dpi=ocr_dpi)
            if bgr_img is None:
                continue

            ocr_result = _ocr_image(bgr_img)
            if ocr_result["text"].strip():  # only store non-empty results
                result["ocr_text"].append({
                    "bbox": bbox,
                    **ocr_result,
                })
        except Exception as exc:
            msg = f"OCR failed for image at {img.get('x0')},{img.get('top')}: {exc}"
            logger.warning("Page %d — %s", page.page_number, msg)
            result["meta"]["errors"].append(msg)

    return result


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def parse_pdf(path: str, ocr_dpi: int = 300):
    """
    Parse all pages of a medical PDF. Yields one result dict per page.
    Pages with fatal errors yield a dict with an 'errors' key and partial data.
    """
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            try:
                yield parse_medical_page(page, ocr_dpi=ocr_dpi)
            except Exception:
                yield {
                    "tables": [],
                    "text": "",
                    "ocr_text": [],
                    "meta": {
                        "page_number": page.page_number,
                        "image_count": 0,
                        "table_count": 0,
                        "errors": [traceback.format_exc()],
                    },
                }


if __name__ == "__main__":
    import json
    import sys

    pdf_path = sys.argv[1] if len(sys.argv) > 1 else "medical_record.pdf"
    for page_data in parse_pdf(pdf_path):
        pn = page_data["meta"]["page_number"]
        print(f"\n{'='*60}")
        print(f"  Page {pn}")
        print(f"{'='*60}")
        print(f"  Tables   : {page_data['meta']['table_count']}")
        print(f"  Images   : {page_data['meta']['image_count']}")
        print(f"  OCR hits : {len(page_data['ocr_text'])}")
        if page_data["meta"]["errors"]:
            print(f"  Errors   : {page_data['meta']['errors']}")
        print(json.dumps(page_data, indent=2, default=str))