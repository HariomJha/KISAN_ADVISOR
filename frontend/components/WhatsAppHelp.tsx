"use client";
import { useTranslations } from "next-intl";
const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP; // digits only, with country code
export default function WhatsAppHelp() {
  const t = useTranslations("nav");
  if (!NUMBER) return null;
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent("Hello, I need help with Kisan Advisor")}`;
  return <a className="wa" href={href} target="_blank" rel="noopener noreferrer">{t("help")}</a>;
}