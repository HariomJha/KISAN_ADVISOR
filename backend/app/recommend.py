"""Rule-based crop scoring: filter by suitability, rank by risk-adjusted profit."""

RISK_FACTOR = {"low": 1.0, "medium": 0.85, "high": 0.7}
UNIT_TO_ACRE = {"acre": 1.0, "hectare": 2.471}


def recommend(crops, state, season, water_source, area, unit="acre", top=3):
    acres = area * UNIT_TO_ACRE[unit]
    results = []
    for c in crops:
        if season not in c["seasons"] or water_source not in c["water_sources"]:
            continue
        if "ALL" not in c["states"] and state not in c["states"]:
            continue
        investment = c["cost_per_acre"] * acres
        revenue = c["yield_qtl_per_acre"] * c["price_per_qtl"] * acres
        results.append({
            "name": c["name"],
            "name_hi": c["name_hi"],
            "investment": round(investment),
            "revenue": round(revenue),
            "profit": round(revenue - investment),
            "duration_days": c["duration_days"],
            "risk": c["risk"],
            "score": round(revenue * RISK_FACTOR[c["risk"]] - investment),
        })
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:top]
