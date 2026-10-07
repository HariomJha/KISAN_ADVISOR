import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../messages/en.json";

type Msg = { [key: string]: string | Msg };

// Any text missing in a language falls back to English.
function merge(base: Msg, over: Msg): Msg {
  const out: Msg = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] = typeof v === "object" && typeof b === "object" ? merge(b as Msg, v as Msg) : v;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as never)) locale = routing.defaultLocale;
  const msgs = (await import(`../messages/${locale}.json`)).default as Msg;
  return { locale, messages: merge(en as Msg, msgs) };
});
