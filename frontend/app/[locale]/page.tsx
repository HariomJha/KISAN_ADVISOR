import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("home");
  return (
    <div className="page">
      <section className="hero">
        <h1>{t("title")}</h1>
        <p className="sub">{t("subtitle")}</p>
        <Link className="btn" href="/services/best-crop">{t("cta")}</Link>
      </section>
    </div>
  );
}
