import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("about");
  return (
    <div className="page">
      <h1>{t("title")}</h1>
      <p>{t("body")}</p>
    </div>
  );
}
