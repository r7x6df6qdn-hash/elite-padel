"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import DatePicker from "@/components/DatePicker";
import TimeSlotGrid, { type Selection } from "@/components/TimeSlotGrid";
import BookingSummary from "@/components/BookingSummary";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { calculateTotalPrice } from "@/lib/constants";
import { useTranslations } from "next-intl";

interface Court {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  description: string | null;
}

interface BookedSlot {
  courtId: string;
  startTime: number;
  endTime: number;
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" /></div>}>
      <BookingPageContent />
    </Suspense>
  );
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourt = searchParams.get("court");
  const t = useTranslations("booking");

  // Suppress unused warning
  void preselectedCourt;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(today);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile scroll-to-summary helper: the summary sits below the grid on
  // small screens, so a floating pill nudges users down once they've picked
  // a slot. Hidden once the summary is already in view (or on desktop, where
  // it's a sticky sidebar).
  const summaryRef = useRef<HTMLElement>(null);
  const [summaryInView, setSummaryInView] = useState(false);

  useEffect(() => {
    const node = summaryRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setSummaryInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courtsRes, bookingsRes] = await Promise.all([
        fetch("/api/bookings/courts"),
        fetch(`/api/bookings?date=${selectedDate}`),
      ]);
      const courtsData = await courtsRes.json();
      if (Array.isArray(courtsData)) setCourts(courtsData);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        if (Array.isArray(bookingsData)) setBookedSlots(bookingsData);
        else setBookedSlots([]);
      } else {
        setBookedSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSlotSelect = (courtId: string, hour: number) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    setSelections((prev) => {
      const existing = prev.find((s) => s.courtId === courtId);

      if (!existing) {
        return [...prev, {
          courtId,
          courtName: court.name,
          courtType: court.type,
          startTime: hour,
          endTime: hour + 1,
        }];
      }

      if (hour === existing.endTime) {
        return prev.map((s) =>
          s.courtId === courtId ? { ...s, endTime: hour + 1 } : s
        );
      }

      if (hour === existing.startTime && existing.endTime === existing.startTime + 1) {
        return prev.filter((s) => s.courtId !== courtId);
      }

      return prev.map((s) =>
        s.courtId === courtId
          ? { ...s, startTime: hour, endTime: hour + 1 }
          : s
      );
    });
  };

  const handleRemoveSelection = (courtId: string) => {
    setSelections((prev) => prev.filter((s) => s.courtId !== courtId));
  };

  const handleProceedToCheckout = () => {
    if (selections.length === 0) return;

    const checkoutData = {
      date: selectedDate,
      items: selections.map((s) => ({
        courtId: s.courtId,
        courtName: s.courtName,
        courtType: s.courtType,
        startTime: s.startTime,
        endTime: s.endTime,
        totalPrice: calculateTotalPrice(s.courtType, s.startTime, s.endTime),
      })),
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  return (
    <div className="pt-32 pb-24">
      {/* Hero Header */}
      <header className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-16">
        <div className="relative overflow-hidden rounded-xl bg-stone-900 text-white p-12 md:p-24 editorial-shadow min-h-[400px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              alt="Padel Court"
              className="w-full h-full object-cover opacity-30 grayscale"
              src="/cinematic.png"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="font-label text-xs tracking-[0.4em] uppercase text-primary-fixed-dim mb-6 block">
              {t("hero.badge")}
            </span>
            <h1 className="text-5xl md:text-7xl font-headline italic leading-[1.1] mb-8 tracking-tighter">
              {t("hero.headline")} <br />
              <span className="text-primary-fixed">{t("hero.headlineAccent")}</span>
            </h1>
            <p className="text-lg text-stone-300 font-body font-light max-w-xl leading-relaxed">
              {t("hero.description")}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Booking Grid */}
          <div className="lg:col-span-8 space-y-12">
            {/* Date Picker */}
            <section className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setSelections([]);
                }}
              />
            </section>

            {/* Time Slot Grid */}
            <section className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <TimeSlotGrid
                  courts={courts}
                  bookedSlots={bookedSlots}
                  selectedDate={selectedDate}
                  selections={selections}
                  onSlotSelect={handleSlotSelect}
                />
              )}
            </section>
          </div>

          {/* Right Column: Booking Summary */}
          <aside ref={summaryRef} className="lg:col-span-4 sticky top-32">
            <BookingSummary
              selections={selections}
              date={selectedDate}
              onRemoveSelection={handleRemoveSelection}
              onProceedToCheckout={handleProceedToCheckout}
            />
          </aside>
        </div>
      </div>

      {/* Mobile-only floating scroll-to-summary button */}
      {selections.length > 0 && !summaryInView && (
        <button
          type="button"
          onClick={scrollToSummary}
          aria-label={t("scrollHint.label")}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-primary text-on-primary px-5 py-3 editorial-shadow font-label text-xs tracking-[0.2em] uppercase animate-bounce-subtle"
        >
          <span>{t("scrollHint.label")}</span>
          <span className="material-symbols-outlined text-base">arrow_downward</span>
        </button>
      )}
    </div>
  );
}
