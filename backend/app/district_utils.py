"""Helpers for importing the official district list (LGD CSV) into the database."""
import re

from .locations import STATES


def norm(s: str) -> str:
    s = s.lower().replace("&", " and ")
    s = re.sub(r"[^a-z ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s[4:] if s.startswith("the ") else s


CANON = {norm(s): s for s in STATES}

# Other spellings that appear in official lists
ALIASES = {
    "nct of delhi": "Delhi",
    "national capital territory of delhi": "Delhi",
    "jammu and kashmir": "Jammu and Kashmir",
    "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
    "orissa": "Odisha",
    "pondicherry": "Puducherry",
    "uttaranchal": "Uttarakhand",
    "andaman and nicobar": "Andaman and Nicobar Islands",
}


def canonical_state(raw: str):
    n = norm(raw)
    return CANON.get(n) or ALIASES.get(n)


def clean_name(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    return s.title() if s.isupper() else s


def pick_columns(headers):
    """Find the state-name and district-name columns (LGD files use headers like
    'State Name(In English)' and 'District Name(In English)'; a plain 'state,district' file also works)."""
    h = [x.strip() for x in headers]
    low = [x.lower() for x in h]

    def find(word):
        cands = [i for i, x in enumerate(low) if word in x and "name" in x]
        english = [i for i in cands if "english" in low[i]]
        if english or cands:
            return (english or cands)[0]
        return low.index(word) if word in low else None

    s, d = find("state"), find("district")
    if s is None or d is None:
        raise SystemExit("Could not find state and district columns. Found: " + ", ".join(h))
    return h[s], h[d]
