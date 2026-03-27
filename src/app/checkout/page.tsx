"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatTime, formatPrice, COURT_TYPES } from "@/lib/constants";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courtId = searchParams.get("courtId") || "";
  const courtName = searchParams.get("courtName") || "";
  const courtType = searchParams.get("courtType") || "";
  const date = searchParams.get("date") || "";
  const startTime = parseInt(searchParams.get("startTime") || "0");
  const endTime = parseInt(searchParams.get("endTime") || "0");
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const typeInfo = COURT_TYPES[courtType as keyof typeof COURT_TYPES];
  const hours = endTime - startTime;

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          courtName,
          courtType,
          date,
          startTime,
          endTime,
          totalPrice,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout fehlgeschlagen");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!courtId || !date) {
    return (
      <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">
          event_busy
        </span>
        <h1 className="text-3xl font-headline italic text-on-surface mb-4">
          Keine Buchungsdaten
        </h1>
        <p className="text-on-surface-variant font-light mb-8">
          Bitte wähle zuerst einen Court und Zeitslot aus.
        </p>
        <a href="/booking" className="btn-primary inline-block">
          Zur Buchung
        </a>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-screen-2xl mx-auto px-6 md:px-12">
      {/* Header */}
      <header className="mb-16">
        <button
          onClick={() => router.back()}
          className="text-on-surface-variant font-label text-xs tracking-widest uppercase hover:text-primary transition-colors mb-8 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back
          </span>
          Zurück zur Buchung
        </button>
        <span className="section-label">Secure Checkout</span>
        <h1 className="text-5xl md:text-6xl font-headline italic tracking-tighter">
          Complete Your <span className="text-primary">Reservation.</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Customer Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow space-y-8">
              <h2 className="font-headline text-2xl italic mb-2">
                Personal Details
              </h2>

              <div>
                <label className="label">Vollständiger Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="input"
                />
              </div>

              <div>
                <label className="label">E-Mail Adresse *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Telefon (optional)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+49 123 456 789"
                  className="input"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-6 py-4 rounded-lg text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full kinetic-gradient text-on-primary py-6 rounded-lg font-label text-xs tracking-[0.3em] uppercase editorial-shadow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                <>SECURE PAYMENT &mdash; {formatPrice(totalPrice)}</>
              )}
            </button>

            <p className="text-center text-[10px] text-stone-400 font-label uppercase tracking-widest">
              Concierge Secure Checkout &bull; Stripe Encrypted
            </p>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-5 sticky top-32">
          <div className="bg-surface-container-highest rounded-xl p-10 editorial-shadow border border-white/20">
            <h3 className="text-2xl font-headline italic tracking-tight mb-8">
              Reservation Summary
            </h3>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">
                    Court
                  </label>
                  <p className="font-body font-medium">{courtName}</p>
                </div>
                <span className="text-[10px] font-label tracking-widest uppercase text-primary bg-primary-fixed px-3 py-1 rounded">
                  {typeInfo?.label}
                </span>
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
                  {formatTime(startTime)} &ndash; {formatTime(endTime)} ({hours}
                  h)
                </p>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-8 space-y-4 border border-white">
              <div className="flex justify-between text-sm font-light">
                <span className="text-on-surface-variant">
                  {hours}h &times; {formatPrice(totalPrice / hours)}
                </span>
                <span className="font-body font-bold">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-light">
                <span className="text-on-surface-variant">
                  inkl. MwSt. (19%)
                </span>
                <span className="font-body font-bold">
                  {formatPrice(totalPrice * 0.19)}
                </span>
              </div>
              <div className="pt-6 border-t border-stone-200 flex justify-between items-center">
                <span className="font-headline italic text-xl">Investment</span>
                <span className="text-3xl font-headline italic text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-surface-container-low rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-lg">
                verified_user
              </span>
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                Sichere Zahlung &bull; Rechnung per E-Mail via Easybill
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
