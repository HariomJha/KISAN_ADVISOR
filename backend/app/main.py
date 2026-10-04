import os
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine, get_db
from .models import Crop
from .recommend import recommend
from .seed import seed_if_empty

DISCLAIMER = ("Estimates use sample data for a pilot. Confirm with a local "
              "agriculture expert before investing.")


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


app = FastAPI(title="Kisan Advisor API", version="0.1.0", lifespan=lifespan)
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_methods=["*"], allow_headers=["*"])


class RecommendIn(BaseModel):
    state: str = Field(min_length=2)
    season: Literal["kharif", "rabi", "zaid"]
    water_source: Literal["rainfed", "borewell", "canal"]
    area: float = Field(gt=0, le=10000)
    unit: Literal["acre", "hectare"] = "acre"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/crops")
def crops(db: Session = Depends(get_db)):
    return [c.as_dict() for c in db.scalars(select(Crop))]


@app.post("/recommend")
def recommend_crops(body: RecommendIn, db: Session = Depends(get_db)):
    rows = [c.as_dict() for c in db.scalars(select(Crop))]
    results = recommend(rows, body.state, body.season, body.water_source,
                        body.area, body.unit)
    return {"results": results, "disclaimer": DISCLAIMER}
