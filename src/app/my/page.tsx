"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";

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

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!email || !token) {
      setError("Ungültiger Link.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/my?email=${encodeURIComponent(email)}&token=${token}`);
      if (!res.ok) {
        setError("Zugriff verweigert. Der Link ist ungültig oder abgelaufen.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBookings(data);
    } catch {
      setError("Fehler beim Laden der Buchungen.");
    }
    setLoading(false);
  }, [email, token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Möchtest du diese Buchung wirklich stornieren?")) return;

    setCancellingId(bookingId);
    setCancelError("");
    setCancelSuccess("");

    try {
      const res = await fetch("/api/my/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, bookingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || "Stornierung fehlgeschlagen.");
      } else {
        setCancelSuccess("Buchung erfolgreich storniert. Du erhältst eine Bestätigung per E-Mail.");
        fetchBookings();
      }
    } catch {
      setCancelError("Fehler bei der Stornierung.");
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
          Buchungen werden geladen...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">lock</span>
        <h1 className="text-3xl font-headline italic text-on-surface mb-4">Zugriff nicht möglich</h1>
        <p className="text-on-surface-variant font-light mb-8">{error}</p>
        <a href="/" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase">
          Zur Startseite
        </a>
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
              Meine Buchungen
            </span>
            <h1 className="text-4xl md:text-5xl font-headline italic leading-[1.1] tracking-tighter mb-4">
              Willkommen zurück.
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
            <h2 className="text-2xl font-headline italic mb-4">Keine aktiven Buchungen</h2>
            <p className="text-on-surface-variant font-light mb-8">Du hast aktuell keine Buchungen.</p>
            <a href="/booking" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase">
              Jetzt buchen
            </a>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
                  Kommende Buchungen ({upcoming.length})
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
                            Heute
                          </span>
                        )}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-headline text-lg italic">{b.court.name}</h3>
                            <p className="text-on-surface-variant text-sm font-light">
                              {formatDate(bookingDate)} &middot; {formatTime(b.startTime)} – {formatTime(b.endTime)} Uhr
                            </p>
                            <p className="text-on-surface font-medium mt-1">{formatPrice(b.totalPrice)}</p>
                          </div>

                          {/* Access Code */}
                          {b.accessCode && isToday && (
                            <div className="bg-primary text-on-primary rounded-xl px-6 py-4 text-center shrink-0">
                              <p className="text-[9px] font-label uppercase tracking-widest opacity-70 mb-1">Zugangscode</p>
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
                              {cancellingId === b.id ? "Wird storniert..." : "Stornieren"}
                            </button>
                          ) : (
                            <span className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant shrink-0">
                              Nicht stornierbar
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-on-surface-variant font-label mt-3">
                          ID: {b.id}
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
                  Vergangene Buchungen ({past.length})
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
                              {formatDate(bookingDate)} &middot; {formatTime(b.startTime)} – {formatTime(b.endTime)} Uhr
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
          <a
            href="/booking"
            className="inline-block bg-primary text-on-primary px-10 py-4 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
          >
            Neue Buchung
          </a>
        </div>
      </div>
    </div>
  );
}
