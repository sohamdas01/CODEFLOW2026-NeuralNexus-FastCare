import logging

logger = logging.getLogger(__name__)


def _page_needs_ocr(page) -> bool:
    """Quick check: does a page need OCR fallback? (<50 chars of digital text)."""
    try:
        text = page.extract_text(layout=True) or ""
    except Exception:
        # If extraction itself fails, treat as needing OCR
        return True
    return len(text.strip()) < 50


def extract_text_from_page(page, page_num: int, filename: str, images: list) -> str:
    """
    Extract text from a single PDF page.

    Attempts digital extraction via pdfplumber first. If the result is
    under 50 characters and ``images`` has a matching entry, falls back
    to Tesseract OCR (requires ``pytesseract`` and a system Tesseract
    installation).

    Returns the extracted text (may be empty if both methods fail).
    """
    try:
        page_text = page.extract_text(layout=True) or ""
    except Exception:
        logger.warning(
            "Digital extraction failed for page %d of %s; will attempt OCR.",
            page_num, filename,
        )
        page_text = ""

    if len(page_text.strip()) < 50 and images and page_num <= len(images):
        logger.debug(
            "Page %d of %s has low text content (%d chars). Applying OCR fallback.",
            page_num, filename, len(page_text.strip()),
        )
        try:
            import pytesseract

            page_text = pytesseract.image_to_string(images[page_num - 1])
        except ImportError:
            logger.warning(
                "pytesseract is not installed. OCR fallback unavailable for page %d of %s.",
                page_num, filename,
            )
        except Exception:
            logger.exception(
                "OCR fallback failed for page %d of %s. Returning digital text (if any).",
                page_num, filename,
            )

    return page_text
