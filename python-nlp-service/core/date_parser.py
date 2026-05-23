import re
from typing import Optional

# ---------------------------------------------------------------------------
# Regex building blocks
# ---------------------------------------------------------------------------

_dsep = r"\s*[/\-]\s*"

# MM/DD/YYYY or DD/MM/YYYY (ambiguous — see extract_date docstring)
DATE_V1 = rf"\b(\d{{1,2}}){_dsep}(\d{{1,2}}){_dsep}(\d{{4}})\b"

# YYYY-MM-DD (ISO 8601 — common in EHR exports)
DATE_V2 = rf"\b(\d{{4}}){_dsep}(\d{{1,2}}){_dsep}(\d{{1,2}})\b"

# "January 5, 2023" / "Jan 5 2023" / "Jan. 5, 2023"
DATE_V3 = (
    r"\b(?:January|February|March|April|May|June|July|August|September|"
    r"October|November|December|"
    r"Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?"
    r"\s+\d{1,2}\s*,?\s*\d{4}\b"
)

# Keywords that signal a clinically relevant date — ordered by specificity
_KW = (
    r"(?:Date\s+of\s+(?:Birth|Admission|Discharge|Procedure|Service|Visit)|"
    r"DOB|"
    r"Admission\s+Date|Discharge\s+Date|"
    r"(?:Procedure|Consultation|Referral|Follow[- ]?[Uu]p|Prescribed)\s+Date)"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize_date(raw: str) -> str:
    """Collapse separator-adjacent whitespace; flag two-digit years."""
    raw = raw.strip()
    if re.match(r"\d", raw):
        normalized = re.sub(r"\s*/\s*", "/", re.sub(r"\s*-\s*", "-", raw))
        # Warn about ambiguous two-digit years by appending a marker
        if re.search(r"[/\-]\d{2}$", normalized):
            normalized += " [year ambiguous]"
        return normalized
    cleaned = re.sub(r"\s+", " ", raw)
    cleaned = re.sub(r"\s+,", ",", cleaned)
    return cleaned


def _find_all_dates(text: str) -> list[str]:
    """Return all date strings found in text, in order of appearance."""
    combined = rf"(?:{DATE_V3}|{DATE_V2}|{DATE_V1})"
    return [
        _normalize_date(match.group(0))
        for match in re.finditer(combined, text, re.IGNORECASE)
    ]


def _find_keyword_dates(text: str) -> list[str]:
    """Return dates that are immediately preceded by a clinical keyword."""
    results = []
    combined_date = rf"(?:{DATE_V3}|{DATE_V2}|{DATE_V1})"
    pattern = rf"{_KW}\s*:?\s*({combined_date})"
    for m in re.finditer(pattern, text, re.IGNORECASE):
        results.append(_normalize_date(m.group(1)))
    return results


def _strip_watermarks(text: str) -> str:
    """Remove known publisher watermark lines without over-consuming text."""
    # Match only to end of line — avoids greedy cross-paragraph consumption
    text = re.sub(
        r"Downloaded from[^\n]*Wiley Online Library[^\n]*",
        "",
        text,
        flags=re.IGNORECASE,
    )
    return text


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_date(text: str, scope: int = 2000) -> Optional[str]:
    """
    Extract the single most clinically relevant date from document text.

    Priority:
      1. Keyword-prefixed dates (Admission Date, DOB, Discharge Date, etc.)
         found within the first `scope` characters.
      2. First date-like string found within the first `scope` characters.

    Note on DD/MM vs MM/DD ambiguity:
      DATE_V1 matches both formats. No automatic resolution is attempted —
      pass ``dayfirst=True/False`` context to your chronology layer if needed.

    Returns a normalized date string, or None if nothing is found.
    """
    cleaned = _strip_watermarks(text)
    header = cleaned[:scope]

    keyword_dates = _find_keyword_dates(header)
    if keyword_dates:
        return keyword_dates[0]

    all_dates = _find_all_dates(header)
    if all_dates:
        return all_dates[0]

    return None


def extract_all_dates(text: str, scope: int = 2000) -> dict:
    """
    Extract all dates from document text, split by source.

    Returns a dict:
        {
            "keyword_dates": [(keyword_context, date_string), ...],
            "all_dates":     [date_string, ...],
        }

    Use this for chronology reconstruction — ``extract_date`` gives you
    only the most prominent hit, which isn't enough to build a timeline.
    """
    cleaned = _strip_watermarks(text)
    header = cleaned[:scope]

    combined_date = rf"(?:{DATE_V3}|{DATE_V2}|{DATE_V1})"
    kw_pattern = rf"({_KW})\s*:?\s*({combined_date})"

    keyword_hits = [
        (m.group(1).strip(), _normalize_date(m.group(2)))
        for m in re.finditer(kw_pattern, header, re.IGNORECASE)
    ]

    return {
        "keyword_dates": keyword_hits,
        "all_dates": _find_all_dates(header),
    }