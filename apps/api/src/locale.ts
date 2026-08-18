import { z } from "zod";

export const LocaleSchema = z.enum(["zh-CN", "en"]);
export type Locale = z.infer<typeof LocaleSchema>;
export const supportedLocales = ["zh-CN", "en"] as const;

export interface LocaleResolution {
  requestedLocale: Locale;
  fallbackLocale: Locale;
}

/** Validate the requested locale and declare the only permitted fallback. */
export function resolveLocale(input: unknown): LocaleResolution {
  const requestedLocale = LocaleSchema.parse(input ?? "zh-CN");
  return { requestedLocale, fallbackLocale: requestedLocale === "zh-CN" ? "en" : "zh-CN" };
}

