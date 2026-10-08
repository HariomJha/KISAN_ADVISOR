import { useTranslations } from "next-intl";
import HomeClient, { type HomeCopy } from "./HomeClient";

const serviceIds = ["advice", "disease", "inputs", "schemes"] as const;

export default function Home() {
  const t = useTranslations("home");

  // All text is translated here (server side) and passed to the client
  // component as plain strings, so the animated parts need no extra setup.
  const copy: HomeCopy = {
    title: t("title"),
    subtitle: t("subtitle"),
    cta: t("cta"),
    ctaSecondary: t("ctaSecondary"),
    points: [t("points.location"), t("points.size"), t("points.plain")],
    chips: { location: t("chips.location"), size: t("chips.size") },
    services: {
      title: t("services.title"),
      subtitle: t("services.subtitle"),
      featured: {
        title: t("services.featured.title"),
        body: t("services.featured.body"),
        cta: t("services.featured.cta"),
      },
      items: serviceIds.map((id) => ({
        id,
        title: t(`services.${id}.title`),
        body: t(`services.${id}.body`),
        cta: t(`services.${id}.cta`),
      })),
    },
    how: {
      title: t("how.title"),
      subtitle: t("how.subtitle"),
      pause: t("how.pause"),
      play: t("how.play"),
      steps: [1, 2, 3].map((n) => ({
        title: t(`how.step${n}.title`),
        body: t(`how.step${n}.body`),
      })),
      placeholder: t("how.step1.placeholder"),
      sizeLabel: t("how.step2.label"),
      unit: t("how.step2.unit"),
      ranks: [t("how.step3.rank1"), t("how.step3.rank2"), t("how.step3.rank3")],
      note: t("how.step3.note"),
    },
    final: { title: t("final.title"), body: t("final.body") },
  };

  return <HomeClient copy={copy} />;
}
