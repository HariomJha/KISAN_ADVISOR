"""Show how complete each language file is.  Usage: python scripts/check_translations.py [--list]"""
import json
import sys
from pathlib import Path

MSGS = Path(__file__).resolve().parent.parent / "frontend" / "messages"


def flat(d, prefix=""):
    for k, v in d.items():
        if isinstance(v, dict):
            yield from flat(v, f"{prefix}{k}.")
        else:
            yield f"{prefix}{k}"


def load(p):
    return set(flat(json.loads(p.read_text(encoding="utf-8"))))


en = load(MSGS / "en.json")
for f in sorted(MSGS.glob("*.json")):
    if f.stem == "en":
        continue
    have = load(f)
    missing = sorted(en - have)
    print(f"{f.stem}: {len(have & en)}/{len(en)} keys translated")
    if "--list" in sys.argv and missing:
        print("  missing:", ", ".join(missing))
