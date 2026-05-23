"""Test script for medical_pdf_parser.py

Usage:
    python test_medical_parser.py <path_to_pdf> [<path_to_pdf> ...]

Outputs one JSON object per page to stdout.
"""

import sys
import json
from core.extractor import parse_pdf


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_medical_parser.py <path_to_pdf> [<path_to_pdf> ...]")
        sys.exit(1)

    for pdf_path in sys.argv[1:]:
        print(f"\n{'=' * 60}")
        print(f"Processing: {pdf_path}")
        print(f"{'=' * 60}")

        try:
            # parse_pdf() is a generator that yields one dict per page
            pages = list(parse_pdf(pdf_path))
        except Exception as exc:
            print(f"Error opening/processing {pdf_path}: {exc}")
            continue

        for page_data in pages:
            print(json.dumps(page_data, indent=2, default=str))

        print(f"Total pages processed: {len(pages)}")


if __name__ == "__main__":
    main()