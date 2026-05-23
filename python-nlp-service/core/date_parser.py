import re
from typing import Optional

# ---------------------------------------------------------------------------
# Regex building blocks
# ---------------------------------------------------------------------------

# Separator between date components: optional whitespace around a slash or dash
_dsep = r"\s*[/-]\s*"

# Numeric formats
DATE_V1 = rf"\b\d{{1,2}}{_dsep}\d{{1,2}}{_dsep}\d{{2,4}}\b"   # MM/DD/YYYY
DATE_V2 = rf"\b\d{{4}}{_dsep}\d{{1,2}}{_dsep}\d{{1,2}}\b"   # YYYY/MM/DD
DATE_V3 = r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s*,?\s*\d{4}\b"  # Month DD, YYYY

# Keywords that signal a clinically relevant date
_KEYWORDS = r"Admission|Discharge|Service|Visit|Prescribed"


def _normalize_date(raw: str) -> str:
    """Collapse separator-adjacent whitespace but preserve readability."""
    # For numeric dates like "3 / 4 / 2003" → "3/4/2003" or "5-10-2022" → "5-10-2022"
    if re.match(r"\d", raw):
        return re.sub(r"\s*/\s*", "/", re.sub(r"\s*-\s*", "-", raw))
    else:
        # Month-name date: collapse runs of spaces, fix " ," → ","
        cleaned = re.sub(r"\s+", " ", raw).strip()
        cleaned = re.sub(r"\s+,", ",", cleaned)
        return cleaned


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def extract_date(text: str) -> Optional[str]:
    """
    Surgically extract the most clinically relevant date from document text.

    Strategy (in priority order):
      1. Strip known publisher watermarks.
      2. Search the first 2000 characters.
      3. Prefer keyword-prefixed dates (Admission Date, Discharge Date, etc.).
      4. Fall back to the first date-like string found.

    Returns a normalized date string or None.
    """
    # Strip Wiley Online Library watermarks
    cleaned_text = re.sub(
        r"Downloaded from.*Wiley Online Library on.*?\b",
        "",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    header_scope = cleaned_text[:2000]

    # --- Priority 1: keyword-prefixed dates ---
    for date_pattern in (DATE_V1, DATE_V2, DATE_V3):
        full_pattern = rf"(?:{_KEYWORDS})\s*Date[:\s]*({date_pattern})"
        matches = re.findall(full_pattern, header_scope, re.IGNORECASE)
        if matches:
            return _normalize_date(matches[0])

    # --- Priority 2: any date-like string ---
    for date_pattern in (DATE_V1, DATE_V2, DATE_V3):
        matches = re.findall(date_pattern, header_scope, re.IGNORECASE)
        if matches:
            return _normalize_date(matches[0])

    return None
