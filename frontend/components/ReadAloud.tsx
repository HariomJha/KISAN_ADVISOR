"use client";
import { useEffect, useState } from "react";
const LANG: Record<string, string> = { hi: "hi-IN", en: "en-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN",
  kn: "kn-IN", te: "te-IN", ta: "ta-IN", or: "or-IN", ne: "ne-NP", as: "as-IN", ml: "ml-IN" };

export default function ReadAloud({ text, locale, label }: { text: string; locale: string; label: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const prefix = (LANG[locale] || "en").slice(0, 2);
    const check = () => setOk(speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(prefix)));
    check();
    speechSynthesis.addEventListener("voiceschanged", check);
    return () => speechSynthesis.removeEventListener("voiceschanged", check);
  }, [locale]);
  if (!ok) return null;
  const speak = () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG[locale] || "en-IN";
    speechSynthesis.speak(u);
  };
  return <button type="button" className="ghost" onClick={speak}>▶ {label}</button>;
}