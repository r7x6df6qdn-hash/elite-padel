"use client";

import { formatTime, formatPrice, COURT_TYPES, calculateTotalPrice, getPriceForHour, PEAK_HOUR } from "@/lib/constants";

interface BookingSummaryProps {
  court: {
    id: string;
    name: string;
    type: string;
    pricePerHour: number;
  } | null;
  date: string;
  startTime: number | null;
  endTime: number | null;
  onProceedToCheckout: () => void;
}

export default function BookingSummary({
  court,
  date,
  startTime,
  endTime,
  onProceedToCheckout,
}: BookingSummaryProps) {
  if (!court || startTime === null || endTime === null) {
    return (
      <div className="bg-surface-container-highest rounded-xl p-10 editorial-shadow border border-white/20">
        <h3 className="text-3xl font-headline italic tracking-tight mb-6">
          Secure Court
        </h3>
        <p className="text-on-surface-variant font-light text-sm">
          Wähle einen Court und Zeitslot aus, um fortzufahren.
        </p>
        <div className="mt-8 bg-white/50 rounded-lg p-8 border border-white text-center">
          <span className="material-symbols-outlined text-4xl text-stone-300">
            calendar_today
          </span>
          <p className="text-stone-400 text-sm mt-3 font-light">
            Kein Slot ausgewählt
          </p>
        </div>
      </div>
    );
  }

  const hours = endTime - startTime;
  const totalPrice = calculateTotalPrice(court.type, startTime, endTime);
  const typeInfo = COURT_TYPES[court.type as keyof typeof COURT_TYPES];

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-surface-container-highest rounded-xl p-10 editorial-shadow border border-white/20">
      <h3 className="text-3xl font-headline italic tracking-tight mb-10">
        Secure Court
      </h3>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">
            Court
          </label>
          <p className="font-body font-medium">{court.name}</p>
          <p className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant">
            {typeInfo?.label}
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">
            Datum
          </label>
          <p className="font-body font-medium">{formattedDate}</p>
        </div>

        <div>
          <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">
            Zeitfenster
          </label>
          <p className="font-body font-medium">
            {formatTime(startTime)} &ndash; {formatTime(endTime)} ({hours}h)
          </p>
        </div>
      </div>

      <div className="bg-white/50 rounded-lg p-5 space-y-3 border border-white">
        <div className="flex justify-between items-baseline text-sm font-light gap-2">
          <span className="text-on-surface-variant whitespace-nowrap">
            Court Rental ({hours}h)
          </span>
          <span className="font-body font-bold whitespace-nowrap">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between items-baseline text-sm font-light gap-2">
          <span className="text-on-surface-variant whitespace-nowrap">inkl. MwSt. (19%)</span>
          <span className="font-body font-bold whitespace-nowrap">
            {formatPrice(totalPrice * 0.19)}
          </span>
        </div>
        <div className="pt-4 border-t border-stone-200 flex flex-col items-center gap-1">
          <span className="font-headline italic text-base text-on-surface-variant">Investment</span>
          <span className="text-3xl font-headline italic text-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      <button
        onClick={onProceedToCheckout}
        className="w-full kinetic-gradient text-on-primary py-6 rounded-lg font-label text-xs tracking-[0.3em] uppercase editorial-shadow hover:scale-[1.01] active:scale-[0.99] transition-all mt-8"
      >
        CONFIRM RESERVATION
      </button>

      <p className="text-center text-[10px] text-stone-400 font-label uppercase tracking-widest mt-4">
        Concierge Secure Checkout &bull; Encrypted
      </p>
    </div>
  );
}
