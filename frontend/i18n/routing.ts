import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// To add a language: add its code here, create messages/<code>.json,
// add its name in components/LanguageSwitcher.tsx, and a font in app/[locale]/layout.tsx if it is a new script.
export const routing = defineRouting({
  locales: ["hi", "en", "bn", "mr", "gu", "kn", "te", "ta", "or", "ne", "as", "ml"],
  defaultLocale: "hi",
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
