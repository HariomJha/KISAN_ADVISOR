import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Skip API routes, Next.js internals and files with an extension (manifest.json, icons)
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] };
