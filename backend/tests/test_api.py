from fastapi.testclient import TestClient

from app.main import app
from app.recommend import recommend

CROPS = [
    {"name": "A", "name_hi": "ए", "seasons": ["kharif"], "states": ["ALL"],
     "water_sources": ["rainfed"], "cost_per_acre": 100, "yield_qtl_per_acre": 10,
     "price_per_qtl": 50, "duration_days": 90, "risk": "low"},
    {"name": "B", "name_hi": "बी", "seasons": ["rabi"], "states": ["Punjab"],
     "water_sources": ["canal"], "cost_per_acre": 100, "yield_qtl_per_acre": 10,
     "price_per_qtl": 50, "duration_days": 90, "risk": "low"},
]

BASE = {"state": "Madhya Pradesh", "season": "kharif",
        "water_source": "rainfed", "area": 5}


def test_filters_by_season_state_and_water():
    r = recommend(CROPS, "Bihar", "kharif", "rainfed", 1)
    assert [x["name"] for x in r] == ["A"]
    assert recommend(CROPS, "Bihar", "rabi", "canal", 1) == []


def test_profit_math_and_hectare_conversion():
    r = recommend(CROPS, "Bihar", "kharif", "rainfed", 2)[0]
    assert (r["investment"], r["revenue"], r["profit"]) == (200, 1000, 800)
    h = recommend(CROPS, "Bihar", "kharif", "rainfed", 1, unit="hectare")[0]
    assert h["investment"] == round(100 * 2.471)


def test_api_recommend():
    with TestClient(app) as c:
        assert c.get("/health").json() == {"status": "ok"}
        r = c.post("/recommend", json=BASE)
        assert r.status_code == 200
        body = r.json()
        assert 1 <= len(body["results"]) <= 3 and "disclaimer" in body
        bad = c.post("/recommend", json={**BASE, "area": 0})
        assert bad.status_code == 422


def test_states_and_districts():
    with TestClient(app) as c:
        assert "Madhya Pradesh" in c.get("/states").json()
        d = c.get("/districts", params={"state": "Madhya Pradesh"}).json()
        assert "Bhopal" in d
        assert c.get("/districts", params={"state": "Nowhere"}).json() == []


def test_recommend_echoes_location_and_validates_coordinates():
    with TestClient(app) as c:
        r = c.post("/recommend", json={**BASE, "district": "Bhopal",
                                       "lat": 23.25, "lon": 77.4})
        assert r.json()["location"]["district"] == "Bhopal"
        assert c.post("/recommend", json={**BASE, "lat": 200}).status_code == 422
