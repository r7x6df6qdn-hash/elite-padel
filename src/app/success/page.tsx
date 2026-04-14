"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" /></div>}>
      <SuccessPageContent />
    </Suspense>
  );
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/bookings/confirm?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setBooking(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-6 text-on-surface-variant font-light font-label text-xs tracking-widest uppercase">
          Confirming your reservation...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 max-w-2xl mx-auto px-6">
      <div className="bg-surface-container-lowest rounded-xl p-12 md:p-16 editorial-shadow text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-8">
          <span
            className="material-symbols-outlined text-secondary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <span className="section-label">Reservation Confirmed</span>

        <h1 className="text-4xl md:text-5xl font-headline italic tracking-tighter text-on-surface mb-6">
          Welcome to the <span className="text-primary">Court.</span>
        </h1>

        <p className="text-on-surface-variant font-light leading-relaxed mb-10 max-w-md mx-auto">
          Vielen Dank für deine Buchung. Du erhältst in Kürze eine
          Bestätigungsmail mit deiner Rechnung und deinem Zugangscode.
        </p>

        {booking && (
          <>
            {/* Access Code Box */}
            {booking.accessCode && (
              <div className="bg-primary text-on-primary rounded-xl p-8 mb-8">
                <p className="text-[10px] font-label uppercase tracking-[0.3em] opacity-80 mb-2">
                  Zugangscode Halle
                </p>
                <p className="text-4xl font-headline tracking-[0.3em] font-bold">
                  {booking.accessCode}
                </p>
                <p className="text-[10px] opacity-60 mt-3">
                  Gültig am Buchungstag &bull; Bitte Code nicht weitergeben
                </p>
              </div>
            )}

            {/* Booking Details */}
            <div className="bg-surface-container-low rounded-xl p-8 text-left space-y-4 mb-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[10px] font-label uppercase tracking-widest text-stone-500">
                  Buchungsnummer
                </span>
                <span className="font-mono font-medium text-xs">{booking.id}</span>
              </div>
              {booking.courtName && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] font-label uppercase tracking-widest text-stone-500">
                    Court
                  </span>
                  <span className="font-medium">{booking.courtName}</span>
                </div>
              )}
              {booking.timeSlot && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] font-label uppercase tracking-widest text-stone-500">
                    Zeitfenster
                  </span>
                  <span className="font-medium">{booking.timeSlot} Uhr</span>
                </div>
              )}
              {booking.totalPrice && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] font-label uppercase tracking-widest text-stone-500">
                    Bezahlt
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(booking.totalPrice)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-[10px] font-label uppercase tracking-widest text-stone-500">
                  Status
                </span>
                <span className="text-secondary font-label text-[10px] tracking-widest uppercase bg-secondary-container px-3 py-1 rounded">
                  Bestätigt
                </span>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/booking"
            className="bg-primary text-on-primary px-10 py-4 rounded-lg font-label text-xs tracking-widest uppercase transition-all hover:opacity-90"
          >
            Weitere Buchung
          </a>
          <a
            href="/"
            className="bg-surface-container-high text-on-surface px-10 py-4 rounded-lg font-label text-xs tracking-widest uppercase transition-all hover:bg-surface-variant"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
