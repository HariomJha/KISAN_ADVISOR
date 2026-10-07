import { useTranslations } from "next-intl";

export default function Contact() {
  const t = useTranslations("contact");
  return (
    <div className="page">
      <h1>{t("title")}</h1>
      <p>{t("body")}</p>
      {/* Replace these placeholders with your real details. A contact form that saves to the database comes in Phase 2. */}
      <p>Email: [your-email@example.com]</p>
      <p>WhatsApp / Phone: [your number]</p>
    </div>
  );
}
