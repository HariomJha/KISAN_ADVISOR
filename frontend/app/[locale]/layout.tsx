import type { Metadata, Viewport } from "next";
import {
  Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Bengali, Noto_Sans_Tamil,
  Noto_Sans_Telugu, Noto_Sans_Kannada, Noto_Sans_Gujarati, Noto_Sans_Malayalam, Noto_Sans_Oriya,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import "../globals.css";

// One font stack covers every script; the browser downloads only the scripts a page actually uses.
// Assamese uses the Bengali script; Nepali uses Devanagari.
const latin = Noto_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--f-latin", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600", "700"], variable: "--f-deva", display: "swap", preload: false });
const beng = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "600", "700"], variable: "--f-beng", display: "swap", preload: false });
const taml = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "600", "700"], variable: "--f-taml", display: "swap", preload: false });
const gujr = Noto_Sans_Gujarati({ subsets: ["gujarati"], weight: ["400", "600", "700"], variable: "--f-gujr", display: "swap", preload: false });
const telu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "600", "700"], variable: "--f-telu", display: "swap", preload: false });
const knda = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400", "600", "700"], variable: "--f-knda", display: "swap", preload: false });
const mlym = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: ["400", "600", "700"], variable: "--f-mlym", display: "swap", preload: false });
const orya = Noto_Sans_Oriya({ subsets: ["oriya"], weight: ["400", "600", "700"], variable: "--f-orya", display: "swap", preload: false });

const fontVars = [latin, deva, beng, gujr, taml, telu, knda, mlym, orya].map((f) => f.variable).join(" ");

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("title"), manifest: "/manifest.json" };
}

export const viewport: Viewport = { themeColor: "#1F5E3B", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as never)) notFound();
  const messages = await getMessages();
  const tf = await getTranslations({ locale, namespace: "footer" });
  return (
    <html lang={locale}>
      <body className={fontVars}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <footer className="ftr">{tf("note")}</footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
