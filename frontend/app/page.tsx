"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

const T = {
  hi: { title: "किसान सलाहकार", sub: "अपने खेत के लिए सबसे अच्छी फसल जानें", state: "राज्य", season: "मौसम", water: "पानी का स्रोत", area: "खेत का आकार", unit: "इकाई", go: "फसलें देखें", top: "आपके लिए टॉप फसलें", inv: "निवेश", rev: "आय", profit: "मुनाफ़ा", days: "दिन", none: "इस चयन के लिए कोई फसल नहीं मिली।", err: "सर्वर से जवाब नहीं मिला। फिर कोशिश करें.", other: "English" },
  en: { title: "Kisan Advisor", sub: "Find the best crop for your field", state: "State", season: "Season", water: "Water source", area: "Field size", unit: "Unit", go: "See best crops", top: "Top crops for you", inv: "Investment", rev: "Revenue", profit: "Profit", days: "days", none: "No crops found for this selection.", err: "Could not reach the server. Please try again.", other: "हिंदी" },
};

type Result = { name: string; name_hi: string; investment: number; revenue: number; profit: number; duration_days: number; risk: string };

export default function Home() {
  const [lang, setLang] = useState<"hi" | "en">("hi");
  const [f, setF] = useState({ state: "Madhya Pradesh", season: "kharif", water_source: "rainfed", area: "5", unit: "acre" });
  const [results, setResults] = useState<Result[] | null>(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = T[lang];
  const set = (k: string) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const money = (n: number) => "₹ " + n.toLocaleString("en-IN");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(false);
    try {
      const r = await fetch(`${API}/recommend`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, area: Number(f.area) }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setResults(d.results); setDisclaimer(d.disclaimer);
    } catch { setError(true); setResults(null); }
    setLoading(false);
  }

  return (
    <main>
      <button className="lang" onClick={() => setLang(lang === "hi" ? "en" : "hi")}>{t.other}</button>
      <div><h1>{t.title}</h1><div className="sub">{t.sub}</div></div>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><label htmlFor="state">{t.state}</label>
          <select id="state" value={f.state} onChange={set("state")}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="row">
          <div><label htmlFor="season">{t.season}</label>
            <select id="season" value={f.season} onChange={set("season")}>
              <option value="kharif">Kharif</option><option value="rabi">Rabi</option><option value="zaid">Zaid</option></select></div>
          <div><label htmlFor="water">{t.water}</label>
            <select id="water" value={f.water_source} onChange={set("water_source")}>
              <option value="rainfed">Rain-fed</option><option value="borewell">Borewell</option><option value="canal">Canal</option></select></div>
        </div>
        <div className="row">
          <div><label htmlFor="area">{t.area}</label>
            <input id="area" type="number" min="0.1" step="0.1" required value={f.area} onChange={set("area")} /></div>
          <div><label htmlFor="unit">{t.unit}</label>
            <select id="unit" value={f.unit} onChange={set("unit")}><option value="acre">Acre</option><option value="hectare">Hectare</option></select></div>
        </div>
        <button className="primary" disabled={loading}>{loading ? "..." : t.go}</button>
      </form>
      {error && <div className="err">{t.err}</div>}
      {results && <h2 style={{ margin: 0 }}>{t.top}</h2>}
      {results && results.length === 0 && <div>{t.none}</div>}
      {results?.map((r, i) => (
        <div key={r.name} className={"card" + (i === 0 ? " top" : "")}>
          <h2>{lang === "hi" ? r.name_hi : r.name}<span className={"badge " + r.risk}>{r.risk}</span></h2>
          <div className="grid">
            <div>{t.inv}<b>{money(r.investment)}</b></div>
            <div>{t.rev}<b>{money(r.revenue)}</b></div>
            <div>{t.profit}<b className="profit">{money(r.profit)}</b></div>
            <div>{r.duration_days} {t.days}</div>
          </div>
        </div>
      ))}
      {disclaimer && results && <div className="note">{disclaimer}</div>}
    </main>
  );
}
