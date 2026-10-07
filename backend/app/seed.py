import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Crop, District

HERE = Path(__file__).parent


def seed_if_empty(db: Session) -> None:
    if db.scalars(select(Crop).limit(1)).first():
        return
    data = json.loads((HERE / "seed_data.json").read_text())
    db.add_all(Crop(**c) for c in data["crops"])
    db.commit()


def seed_districts_if_empty(db: Session) -> None:
    if db.scalars(select(District).limit(1)).first():
        return
    data = json.loads((HERE / "districts_seed.json").read_text())
    db.add_all(
        District(state=state, name=name)
        for state, names in data["districts"].items()
        for name in names
    )
    db.commit()
