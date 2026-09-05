"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const switchTo = (nextLocale: "de" | "en") => {
    if (nextLocale === locale) return;
    startTransition(() => {
      // @ts-expect-error — params type is dynamic
      router.replace({ pathname, params }, { locale: nextLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 text-[11px] font-label tracking-widest uppercase">
      <button
        onClick={() => switchTo("de")}
        disabled={isPending}
        className={`px-2 py-1 transition-colors ${
          locale === "de"
            ? "text-stone-900 font-semibold"
            : "text-stone-400 hover:text-stone-700"
        }`}
        aria-label="Deutsch"
      >
        DE
      </button>
      <span className="text-stone-300">/</span>
      <button
        onClick={() => switchTo("en")}
        disabled={isPending}
        className={`px-2 py-1 transition-colors ${
          locale === "en"
            ? "text-stone-900 font-semibold"
            : "text-stone-400 hover:text-stone-700"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
