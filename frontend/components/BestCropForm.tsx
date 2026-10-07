"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMessages, useTranslations } from "next-intl";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Leaflet needs the browser, so load the map only on the client
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false, loading: () => <div className="map" /> });

type Pin = { lat: number; lon: number } | null;
type Result = { name: string; investment: number; revenue: number; profit: number; duration_days: number; risk: string };

// "Paddy (rice)" -> "paddy_rice": the key used in messages/*.json under "crops"
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export default function BestCropForm() {
  const t = useTranslations("crop");
  const tf = useTranslations("footer");
  const messages = useMessages() as { crops?: Record<string, string> };

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [f, setF] = useState({
    state: "Madhya Pradesh", district: "", village: "",
    season: "kharif", water_source: "rainfed", area: "5", unit: "acre",
  });
  const [pin, setPin] = useState<Pin>(null);
  const [geoErr, setGeoErr] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/states`).then((r) => r.json()).then(setStates).catch(() => setStates([]));
  }, []);

  useEffect(() => {
    setDistricts([]);
    fetch(`${API}/districts?state=${encodeURIComponent(f.state)}`)
      .then((r) => r.json()).then(setDistricts).catch(() => setDistricts([]));
  }, [f.state]);

  const change = (k: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const v = e.target.value;
    setF((p) => ({ ...p, [k]: v, ...(k === "state" ? { district: "" } : {}) }));
  };

  function locate() {
    setGeoErr(false);
    if (!navigator.geolocation) return setGeoErr(true);
    navigator.geolocation.getCurrentPosition(
      (p) => setPin({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setGeoErr(true),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(false);
    try {
      const r = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          district: f.district || null,
          village: f.village || null,
          lat: pin?.lat ?? null,
          lon: pin?.lon ?? null,
          area: Number(f.area),
        }),
      });
      if (!r.ok) throw new Error();
      setResults((await r.json()).results);
    } catch { setError(true); setResults(null); }
    setLoading(false);
  }

  const stateList = states.length ? states : [f.state];
  const money = (n: number) => "₹ " + n.toLocaleString("en-IN");
  const cropName = (name: string) => messages.crops?.[slug(name)] ?? name;

  return (
    <div className="page">
      <div><h1>{t("title")}</h1><div className="sub">{t("subtitle")}</div></div>
      <form onSubmit={submit} className="form">
        <div>
          <label htmlFor="state">{t("state")}</label>
          <select id="state" value={f.state} onChange={change("state")}>
            {stateList.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="district">{t("district")}</label>
          {districts.length ? (
            <select id="district" value={f.district} onChange={change("district")}>
              <option value="">{t("choose")}</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          ) : (
            <input id="district" type="text" value={f.district} onChange={change("district")} />
          )}
        </div>
        <div>
          <label htmlFor="village">{t("village")}</label>
          <input id="village" type="text" value={f.village} onChange={change("village")} />
        </div>
        <div>
          <div className="lbl">{t("mapHint")}</div>
          <MapPicker pin={pin} onPick={setPin} />
          <button type="button" className="ghost" onClick={locate}>{t("useLocation")}</button>
          {pin && <div className="note">{t("located")}: {pin.lat.toFixed(4)}, {pin.lon.toFixed(4)}</div>}
          {geoErr && <div className="err">{t("geoErr")}</div>}
        </div>
        <div className="row">
          <div>
            <label htmlFor="season">{t("season")}</label>
            <select id="season" value={f.season} onChange={change("season")}>
              {["kharif", "rabi", "zaid"].map((s) => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="water">{t("water")}</label>
            <select id="water" value={f.water_source} onChange={change("water_source")}>
              {["rainfed", "borewell", "canal"].map((s) => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label htmlFor="area">{t("area")}</label>
            <input id="area" type="number" min="0.1" step="0.1" required value={f.area} onChange={change("area")} />
          </div>
          <div>
            <label htmlFor="unit">{t("unit")}</label>
            <select id="unit" value={f.unit} onChange={change("unit")}>
              {["acre", "hectare"].map((s) => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </div>
        </div>
        <button className="primary" disabled={loading}>{loading ? "..." : t("go")}</button>
      </form>

      {error && <div className="err">{t("err")}</div>}
      {results && <h2>{t("top")}</h2>}
      {results && results.length === 0 && <div>{t("none")}</div>}
      {results?.map((r, i) => (
        <div key={r.name} className={"card" + (i === 0 ? " top" : "")}>
          <h2>{cropName(r.name)}<span className={"badge " + r.risk}>{t(r.risk)}</span></h2>
          <div className="grid">
            <div>{t("inv")}<b>{money(r.investment)}</b></div>
            <div>{t("rev")}<b>{money(r.revenue)}</b></div>
            <div>{t("profit")}<b className="profit">{money(r.profit)}</b></div>
            <div>{r.duration_days} {t("days")}</div>
          </div>
        </div>
      ))}
      {results && <div className="note">{tf("note")}</div>}
    </div>
  );
}
