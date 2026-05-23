"""
local_runner.py
---------------
Exercises the core pipeline directly (no HTTP layer) against real files
in the /samples directory.

Usage:
    python local_runner.py                        # uses ./samples/
    python local_runner.py --samples /path/to/dir
    python local_runner.py --samples ./samples --out ./output
    python local_runner.py --verbose
"""

import argparse
import json
import logging
import os
import sys
from pathlib import Path

# Make sure project root is on the path when running from any directory
sys.path.insert(0, str(Path(__file__).parent))

from main import _process_single_pdf, MAX_FILE_BYTES, MAX_FILE_MB, ALLOWED_EXTENSIONS

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args():
    p = argparse.ArgumentParser(description="Local pipeline runner for /samples")
    p.add_argument(
        "--samples", default="./samples",
        help="Directory containing patient_info.json and PDF files (default: ./samples)",
    )
    p.add_argument(
        "--out", default=None,
        help="Directory to write JSON results (default: print to stdout only)",
    )
    p.add_argument(
        "--verbose", action="store_true",
        help="Set log level to DEBUG",
    )
    return p.parse_args()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_patient_info(samples_dir: Path) -> dict:
    info_path = samples_dir / "patient_info.json"
    if not info_path.exists():
        print(f"[WARN] No patient_info.json found in {samples_dir}. Using empty dict.")
        return {}
    with open(info_path, encoding="utf-8") as f:
        return json.load(f)


def _collect_pdfs(samples_dir: Path) -> list[Path]:
    pdfs = sorted(
        p for p in samples_dir.iterdir()
        if p.is_file() and p.suffix.lower() in ALLOWED_EXTENSIONS
    )
    if not pdfs:
        print(f"[WARN] No PDF files found in {samples_dir}")
    return pdfs


def _print_record_summary(record, index: int):
    """Human-readable summary of a ProcessedRecord for quick visual inspection."""
    bar = "=" * 60
    print(f"\n{bar}")
    print(f"  Record {index}: {record.filename}")
    print(bar)
    print(f"  Date detected : {record.date or '(none found)'}")
    print(f"  Raw text chars: {len(record.raw_text)}")

    # Show first 800 chars of extracted text as a sanity check
    preview = record.raw_text[:800].strip()
    if preview:
        print(f"\n  --- TEXT PREVIEW (first 800 chars) ---")
        print(f"  {preview.replace(chr(10), chr(10) + '  ')}")
        if len(record.raw_text) > 800:
            print(f"  ... [{len(record.raw_text) - 800} more chars]")
    else:
        print("  (no text extracted)")


def _save_result(out_dir: Path, filename: str, record, patient_info: dict):
    """Write the full result for one record to a JSON file."""
    out_dir.mkdir(parents=True, exist_ok=True)
    stem    = Path(filename).stem
    outpath = out_dir / f"{stem}_result.json"
    payload = {
        "patient": patient_info,
        "record": {
            "filename": record.filename,
            "date":     record.date,
            "raw_text": record.raw_text,
        },
    }
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"  Saved → {outpath}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args       = _parse_args()
    log_level  = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    )

    samples_dir = Path(args.samples).resolve()
    out_dir     = Path(args.out).resolve() if args.out else None

    if not samples_dir.exists():
        print(f"[ERROR] Samples directory not found: {samples_dir}")
        sys.exit(1)

    patient_info = _load_patient_info(samples_dir)
    pdfs         = _collect_pdfs(samples_dir)

    print(f"\nSamples dir : {samples_dir}")
    print(f"Patient     : {json.dumps(patient_info, indent=2)}")
    print(f"PDFs found  : {len(pdfs)}")
    if out_dir:
        print(f"Output dir  : {out_dir}")

    success_count = 0
    fail_count    = 0

    for i, pdf_path in enumerate(pdfs, start=1):
        print(f"\n[{i}/{len(pdfs)}] Processing: {pdf_path.name}")

        # File size guard — mirrors main.py behaviour
        size = pdf_path.stat().st_size
        if size > MAX_FILE_BYTES:
            print(
                f"  [SKIP] File is {size // (1024*1024)} MB "
                f"— exceeds {MAX_FILE_MB} MB limit."
            )
            fail_count += 1
            continue

        contents = pdf_path.read_bytes()

        try:
            record = _process_single_pdf(contents, pdf_path.name)
            success_count += 1
            _print_record_summary(record, i)
            if out_dir:
                _save_result(out_dir, pdf_path.name, record, patient_info)

        except ValueError as exc:
            print(f"  [SKIP] Malformed PDF: {exc}")
            fail_count += 1

        except Exception as exc:
            print(f"  [ERROR] Unexpected failure: {exc}")
            fail_count += 1
            if args.verbose:
                import traceback
                traceback.print_exc()

    # Final summary
    print(f"\n{'=' * 60}")
    print(f"  Done.  {success_count} succeeded, {fail_count} failed/skipped.")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()