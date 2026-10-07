import os
from contextlib import asynccontextmanager
from typing import Literal, Optional

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine, get_db
from .locations import STATES
from .models import Crop, District
from .recommend import recommend
from .seed import seed_districts_if_empty, seed_if_empty

DISCLAIMER = ("Estimates use sample data for a pilot. Confirm with a local "
              "agriculture expert before investing.")


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_if_empty(db)
        seed_districts_if_empty(db)
    yield


app = FastAPI(title="Kisan Advisor API", version="0.2.0", lifespan=lifespan)
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_methods=["*"], allow_headers=["*"])


class RecommendIn(BaseModel):
    state: str = Field(min_length=2)
    district: Optional[str] = Field(default=None, max_length=80)
    village: Optional[str] = Field(default=None, max_length=120)
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lon: Optional[float] = Field(default=None, ge=-180, le=180)
    season: Literal["kharif", "rabi", "zaid"]
    water_source: Literal["rainfed", "borewell", "canal"]
    area: float = Field(gt=0, le=10000)
    unit: Literal["acre", "hectare"] = "acre"


@app.get("/")
def root():
    return {"service": "Kisan Advisor API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/states")
def states():
    return STATES


@app.get("/districts")
def districts(state: str, db: Session = Depends(get_db)):
    stmt = select(District.name).where(District.state == state).order_by(District.name)
    return list(db.scalars(stmt))


@app.get("/crops")
def crops(db: Session = Depends(get_db)):
    return [c.as_dict() for c in db.scalars(select(Crop))]


@app.post("/recommend")
def recommend_crops(body: RecommendIn, db: Session = Depends(get_db)):
    rows = [c.as_dict() for c in db.scalars(select(Crop))]
    results = recommend(rows, body.state, body.season, body.water_source,
                        body.area, body.unit)
    # district / village / lat / lon are stored in the response for now;
    # later phases will use them for weather and local mandi prices.
    location = {"state": body.state, "district": body.district,
                "village": body.village, "lat": body.lat, "lon": body.lon}
    return {"results": results, "location": location, "disclaimer": DISCLAIMER}
