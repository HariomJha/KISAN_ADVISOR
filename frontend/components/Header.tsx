"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close the Services menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  const soon = (label: string) => (
    <span className="dd-item off" aria-disabled="true">{label} · {t("services.soon")}</span>
  );

  return (
    <header className="hdr">
      <Link href="/" className="brand">{t("meta.title")}</Link>
      <nav className="nav">
        <Link href="/">{t("nav.home")}</Link>
        <div className="dd">
          <button className="dd-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
            {t("nav.services")} ▾
          </button>
          {open && (
            <div className="dd-menu">
              <Link href="/services">{t("services.title")}</Link>
              <Link href="/services/best-crop">{t("services.bestCrop")}</Link>
              {soon(t("services.seeds"))}
              {soon(t("services.pesticides"))}
              {soon(t("services.sell"))}
              {soon(t("services.equipment"))}
            </div>
          )}
        </div>
        <Link href="/about">{t("nav.about")}</Link>
        <Link href="/contact">{t("nav.contact")}</Link>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
