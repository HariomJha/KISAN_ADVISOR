import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const ITEMS = [
  { key: "bestCrop", href: "/services/best-crop" },
  { key: "seeds", href: null },
  { key: "pesticides", href: null },
  { key: "sell", href: null },
  { key: "equipment", href: null },
];

export default function Services() {
  const t = useTranslations("services");
  return (
    <div className="page">
      <h1>{t("title")}</h1>
      <div className="svc-grid">
        {ITEMS.map((i) =>
          i.href ? (
            <Link key={i.key} href={i.href} className="svc-card live">
              {t(i.key)} <span className="pill">{t("open")}</span>
            </Link>
          ) : (
            <div key={i.key} className="svc-card off" aria-disabled="true">
              {t(i.key)} <span className="pill">{t("soon")}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
