"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface Booking {
  id: string;
  courtId: string;
  date: string;
  startTime: number;
  endTime: number;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: string;
  accessCode: string | null;
  court: { name: string; type: string };
}

function formatTime(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MyPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" /></div>}>
      <MyPageContent />
    </Suspense>
  );
}

function MyPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const t = useTranslations("my");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-GB" : "de-DE";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(dateLocale, { style: "currency", currency: "EUR" }).format(price);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!email || !token) {
      setError(t("errors.invalidLink"));
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/my?email=${encodeURIComponent(email)}&token=${token}`);
      if (!res.ok) {
        setError(t("errors.expired"));
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBookings(data);
    } catch {
      setError(t("errors.loadFailed"));
    }
    setLoading(false);
  }, [email, token, t]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm(t("confirmCancel"))) return;

    setCancellingId(bookingId);
    setCancelError("");
    setCancelSuccess("");

    try {
      const res = await fetch("/api/my/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, bookingId, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || t("errors.cancelFailed"));
      } else {
        setCancelSuccess(t("cancelSuccess"));
        fetchBookings();
      }
    } catch {
      setCancelError(t("errors.cancelError"));
    }
    setCancellingId(null);
  };

  const today = getLocalDate();
  const upcoming = bookings.filter((b) => b.date.split("T")[0] >= today);
  const past = bookings.filter((b) => b.date.split("T")[0] < today);

  if (loading) {
    return (
      <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-6 text-on-surface-variant font-light font-label text-xs tracking-widest uppercase">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">lock</span>
        <h1 className="text-3xl font-headline italic text-on-surface mb-4">{t("errorTitle")}</h1>
        <p className="text-on-surface-variant font-light mb-8">{error}</p>
        <Link href="/" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase">
          {t("homeButton")}
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <header className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-16">
        <div className="relative overflow-hidden rounded-xl bg-stone-900 text-white p-12 md:p-20 editorial-shadow">
          <div className="absolute inset-0 z-0">
            <img alt="Padel Court" className="w-full h-full object-cover opacity-20 grayscale" src="/cinematic.png" />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/60 to-transparent" />
          </div>
          <div className="relative z-10">
            <span className="font-label text-xs tracking-[0.4em] uppercase text-primary-fixed-dim mb-4 block">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-headline italic leading-[1.1] tracking-tighter mb-4">
              {t("hero.headline")}
            </h1>
            <p className="text-stone-300 font-light">{email}</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 md:px-12">
        {cancelSuccess && (
          <div className="bg-secondary-container text-secondary px-6 py-4 rounded-xl text-sm mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {cancelSuccess}
          </div>
        )}
        {cancelError && (
          <div className="bg-error-container text-on-error-container px-6 py-4 rounded-xl text-sm mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {cancelError}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">event_busy</span>
            <h2 className="text-2xl font-headline italic mb-4">{t("emptyTitle")}</h2>
            <p className="text-on-surface-variant font-light mb-8">{t("emptyDescription")}</p>
            <Link href="/booking" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase">
              {t("bookNow")}
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
                  {t("upcoming", { count: upcoming.length })}
                </h2>
                <div className="space-y-4">
                  {upcoming.map((b) => {
                    const bookingDate = b.date.split("T")[0];
                    const isToday = bookingDate === today;
                    const bookingStart = new Date(b.date);
                    bookingStart.setHours(b.startTime);
                    const hoursUntil = (bookingStart.getTime() - Date.now()) / (1000 * 60 * 60);
                    const canCancel = hoursUntil >= 24;

                    return (
                      <div key={b.id} className={`bg-surface-container-lowest rounded-xl p-6 editorial-shadow ${isToday ? "ring-2 ring-primary" : ""}`}>
                        {isToday && (
                          <span className="inline-block bg-primary text-on-primary text-[10px] font-label tracking-widest uppercase px-3 py-1 rounded mb-4">
                            {t("today")}
                          </span>
                        )}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-headline text-lg italic">{b.court.name}</h3>
                            <p className="text-on-surface-variant text-sm font-light">
                              {formatDate(bookingDate)} &middot; {formatTime(b.startTime)} – {formatTime(b.endTime)}
                            </p>
                            <p className="text-on-surface font-medium mt-1">{formatPrice(b.totalPrice)}</p>
                          </div>

                          {/* Access Code */}
                          {b.accessCode && isToday && (
                            <div className="bg-primary text-on-primary rounded-xl px-6 py-4 text-center shrink-0">
                              <p className="text-[9px] font-label uppercase tracking-widest opacity-70 mb-1">{t("accessCode")}</p>
                              <p className="text-2xl font-mono font-bold tracking-[0.2em]">{b.accessCode}</p>
                            </div>
                          )}

                          {/* Cancel Button */}
                          {canCancel ? (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancellingId === b.id}
                              className="text-[10px] font-label tracking-widest uppercase text-error hover:underline disabled:opacity-50 shrink-0"
                            >
                              {cancellingId === b.id ? t("cancelling") : t("cancel")}
                            </button>
                          ) : (
                            <span className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant shrink-0">
                              {t("notCancellable")}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-on-surface-variant font-label mt-3">
                          {t("id")}: {b.id}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
                  {t("past", { count: past.length })}
                </h2>
                <div className="space-y-3">
                  {past.map((b) => {
                    const bookingDate = b.date.split("T")[0];
                    return (
                      <div key={b.id} className="bg-surface-container-low rounded-xl p-5 opacity-60">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-headline text-base italic">{b.court.name}</h3>
                            <p className="text-on-surface-variant text-sm font-light">
                              {formatDate(bookingDate)} &middot; {formatTime(b.startTime)} – {formatTime(b.endTime)}
                            </p>
                          </div>
                          <span className="text-sm font-medium">{formatPrice(b.totalPrice)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* New Booking CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/booking"
            className="inline-block bg-primary text-on-primary px-10 py-4 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            {t("newBooking")}
          </Link>
        </div>
      </div>
    </div>
  );
}
