import logging
import os

logger = logging.getLogger(__name__)

NER_MODEL_NAME = os.getenv("NER_MODEL_NAME", "en_ner_bionlp13cg_md")
PHYSIOLOGICAL_LABELS = set(
    os.getenv("PHYSIOLOGICAL_LABELS", "DISEASE_OR_SYNDROME,PATHOLOGICAL_FORMATION").split(",")
)
CHEMICAL_LABELS = set(
    os.getenv("CHEMICAL_LABELS", "SIMPLE_CHEMICAL").split(",")
)

# ---------------------------------------------------------------------------
# Lazy-loaded spaCy model — module import stays cheap; model loads on first use.
# ---------------------------------------------------------------------------
_nlp = None
_load_attempted = False


def _get_nlp():
    """Return the loaded spaCy model, or None if loading failed."""
    global _nlp, _load_attempted

    if _load_attempted:
        return _nlp

    _load_attempted = True

    try:
        import spacy
    except ImportError:
        logger.warning(
            "spaCy is not installed. NER processing will be skipped. "
            "Install with: pip install spacy"
        )
        return None

    logger.info("Loading NLP model: %s", NER_MODEL_NAME)
    try:
        _nlp = spacy.load(NER_MODEL_NAME)
        logger.info("NLP model loaded successfully.")
    except OSError:
        logger.exception(
            "Failed to load NLP model '%s'. NER processing will be skipped. "
            "Install it with: python -m spacy download %s",
            NER_MODEL_NAME, NER_MODEL_NAME,
        )
        _nlp = None

    return _nlp


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def is_ner_available() -> bool:
    """Return True if the NLP model is loaded and ready for entity extraction."""
    return _get_nlp() is not None


def deduplicate_entities(entities: list) -> list:
    """
    Remove duplicate entities.

    Expects a list of tuples: (entity_text, source_filename, page_number).
    Deduplication key is (entity_text, page_number) — same entity on the same
    page of the same file is collapsed.  Callers that process multiple files
    should deduplicate per-file to avoid cross-file collisions.
    """
    seen = set()
    unique = []
    for entry in entities:
        key = (entry[0], entry[2])  # entity_text, page
        if key not in seen:
            unique.append(entry)
            seen.add(key)
    return unique


def extract_entities(text: str, source: str, page_num: int):
    """
    Run biomedical NER over *text* and return three lists of tuples:

        physiological_conditions, allergies, regular_medicines

    Each tuple is (entity_text, source_filename, page_number).

    CHEMICAL_LABELS entities are added to **both** allergies and regular
    medicines — the downstream LLM is responsible for disambiguation.
    """
    physiological = []
    allergies = []
    regular_meds = []

    nlp = _get_nlp()
    if nlp is None:
        return physiological, allergies, regular_meds

    doc = nlp(text)
    for ent in doc.ents:
        entry = (ent.text, source, page_num)
        if ent.label_ in PHYSIOLOGICAL_LABELS:
            physiological.append(entry)
        elif ent.label_ in CHEMICAL_LABELS:
            allergies.append(entry)
            regular_meds.append(entry)

    return physiological, allergies, regular_meds
