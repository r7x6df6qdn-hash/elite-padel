"use client";

import { formatTime, formatPrice, COURT_TYPES, calculateTotalPrice } from "@/lib/constants";
import type { Selection } from "@/components/TimeSlotGrid";
import { useLocale, useTranslations } from "next-intl";

interface BookingSummaryProps {
  selections: Selection[];
  date: string;
  onRemoveSelection: (courtId: string) => void;
  onProceedToCheckout: () => void;
}

export default function BookingSummary({
  selections,
  date,
  onRemoveSelection,
  onProceedToCheckout,
}: BookingSummaryProps) {
  const t = useTranslations("booking.summary");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-GB" : "de-DE";

  if (selections.length === 0) {
    return (
      <div className="bg-surface-container-highest rounded-xl p-10 editorial-shadow border border-white/20">
        <h3 className="text-3xl font-headline italic tracking-tight mb-6">
          {t("emptyTitle")}
        </h3>
        <p className="text-on-surface-variant font-light text-sm">
          {t("emptyDescription")}
        </p>
        <div className="mt-8 bg-surface-container-lowest/60 rounded-lg p-8 border border-surface-container-lowest text-center">
          <span className="material-symbols-outlined text-4xl text-stone-300">
            calendar_today
          </span>
          <p className="text-stone-400 text-sm mt-3 font-light">
            {t("emptyState")}
          </p>
        </div>
      </div>
    );
  }

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalPrice = selections.reduce(
    (sum, s) => sum + calculateTotalPrice(s.courtType, s.startTime, s.endTime),
    0
  );

  return (
    <div className="bg-surface-container-highest rounded-xl p-10 editorial-shadow border border-white/20">
      <h3 className="text-3xl font-headline italic tracking-tight mb-6">
        {selections.length > 1 ? t("titlePlural") : t("title")}
      </h3>

      <div className="mb-4">
        <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">
          {t("dateLabel")}
        </label>
        <p className="font-body font-medium">{formattedDate}</p>
      </div>

      <div className="space-y-4 mb-8">
        {selections.map((sel) => {
          const hours = sel.endTime - sel.startTime;
          const price = calculateTotalPrice(sel.courtType, sel.startTime, sel.endTime);
          const typeInfo = COURT_TYPES[sel.courtType as keyof typeof COURT_TYPES];

          return (
            <div key={sel.courtId} className="bg-surface-container-lowest/60 rounded-lg p-4 border border-surface-container-lowest relative">
              <button
                onClick={() => onRemoveSelection(sel.courtId)}
                className="absolute top-3 right-3 text-stone-400 hover:text-error transition-colors"
                title={t("remove")}
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
              <div className="mb-2">
                <p className="font-body font-medium">{sel.courtName}</p>
                <p className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant">
                  {typeInfo?.label}
                </p>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-on-surface-variant font-light">
                  {formatTime(sel.startTime)} – {formatTime(sel.endTime)} ({hours}{t("hours")})
                </span>
                <span className="font-body font-bold text-sm">{formatPrice(price)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-container-lowest/60 rounded-lg p-5 space-y-3 border border-surface-container-lowest">
        <div className="flex justify-between items-baseline text-sm font-light gap-2">
          <span className="text-on-surface-variant whitespace-nowrap">
            {t("courtLabel", { count: selections.length })}
          </span>
          <span className="font-body font-bold whitespace-nowrap">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between items-baseline text-sm font-light gap-2">
          <span className="text-on-surface-variant whitespace-nowrap">{t("vat")}</span>
          <span className="font-body font-bold whitespace-nowrap">
            {formatPrice(totalPrice * 0.19)}
          </span>
        </div>
        <div className="pt-4 border-t border-stone-200 flex flex-col items-center gap-1">
          <span className="font-headline italic text-base text-on-surface-variant">{t("investment")}</span>
          <span className="text-3xl font-headline italic text-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <button
        onClick={onProceedToCheckout}
        className="w-full kinetic-gradient text-on-primary py-6 rounded-lg font-label text-xs tracking-[0.3em] uppercase editorial-shadow hover:scale-[1.01] active:scale-[0.99] transition-all mt-8"
      >
        {t("confirmButton")}
      </button>

      <p className="text-center text-[10px] text-stone-400 font-label uppercase tracking-widest mt-4">
        {t("secureNote")}
      </p>
    </div>
  );
}
