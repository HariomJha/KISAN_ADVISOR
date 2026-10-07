"""Load the full district list from a CSV file.

Works with the official Local Government Directory (LGD) "All Districts of India" CSV,
or any CSV with state and district columns.

Usage (from the backend folder, venv active):
    python -m app.import_districts districts.csv            # add missing districts
    python -m app.import_districts districts.csv --replace  # clear the sample districts first

To load the production database, set DATABASE_URL to its external URL first.
"""
import csv
import sys

from sqlalchemy import delete, select

from .db import Base, SessionLocal, engine
from .district_utils import canonical_state, clean_name, pick_columns
from .models import District


def main(path: str, replace: bool = False) -> None:
    Base.metadata.create_all(engine)
    added = 0
    skipped: dict[str, int] = {}
    with SessionLocal() as db, open(path, newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        s_col, d_col = pick_columns(reader.fieldnames or [])
        if replace:
            db.execute(delete(District))
            db.flush()
        existing = {(d.state, d.name) for d in db.scalars(select(District))}
        for row in reader:
            raw_state = (row.get(s_col) or "").strip()
            raw_district = (row.get(d_col) or "").strip()
            if not raw_state or not raw_district:
                continue
            state = canonical_state(raw_state)
            if not state:
                skipped[raw_state] = skipped.get(raw_state, 0) + 1
                continue
            key = (state, clean_name(raw_district))
            if key not in existing:
                db.add(District(state=key[0], name=key[1]))
                existing.add(key)
                added += 1
        db.commit()
    print(f"added {added} districts")
    if skipped:
        print("skipped rows with unrecognised state names (add them to ALIASES in district_utils.py):")
        for name, n in sorted(skipped.items()):
            print(f"  {name}: {n}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        raise SystemExit(__doc__)
    main(args[0], replace="--replace" in sys.argv)
