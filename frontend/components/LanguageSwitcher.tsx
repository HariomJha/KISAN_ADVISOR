"use client";
import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";

const NAMES: Record<string, string> = {
  en: "English", hi: "हिंदी", bn: "বাংলা", mr: "मराठी", kn: "ಕನ್ನಡ", te: "తెలుగు",
  ta: "தமிழ்", gu: "ગુજરાતી", or: "ଓଡ଼ିଆ", ne: "नेपाली", as: "অসমীয়া", ml: "മലയാളം",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      className="lang-select"
      aria-label={t("language")}
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value as (typeof routing.locales)[number] })}
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>{NAMES[l]}</option>
      ))}
    </select>
  );
}
