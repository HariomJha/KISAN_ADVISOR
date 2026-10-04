import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Crop


def seed_if_empty(db: Session) -> None:
    if db.scalars(select(Crop).limit(1)).first():
        return
    data = json.loads((Path(__file__).parent / "seed_data.json").read_text())
    db.add_all(Crop(**c) for c in data["crops"])
    db.commit()
