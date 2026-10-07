from sqlalchemy import JSON, Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    name_hi: Mapped[str] = mapped_column(String(80))
    seasons: Mapped[list] = mapped_column(JSON)        # kharif / rabi / zaid
    states: Mapped[list] = mapped_column(JSON)         # state names or ["ALL"]
    water_sources: Mapped[list] = mapped_column(JSON)  # rainfed / borewell / canal
    cost_per_acre: Mapped[float] = mapped_column(Float)
    yield_qtl_per_acre: Mapped[float] = mapped_column(Float)
    price_per_qtl: Mapped[float] = mapped_column(Float)
    duration_days: Mapped[int] = mapped_column(Integer)
    risk: Mapped[str] = mapped_column(String(10))      # low / medium / high

    def as_dict(self) -> dict:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class District(Base):
    __tablename__ = "districts"
    __table_args__ = (UniqueConstraint("state", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    state: Mapped[str] = mapped_column(String(80), index=True)
    name: Mapped[str] = mapped_column(String(80))
