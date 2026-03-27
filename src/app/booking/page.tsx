"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import DatePicker from "@/components/DatePicker";
import TimeSlotGrid from "@/components/TimeSlotGrid";
import BookingSummary from "@/components/BookingSummary";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateTotalPrice } from "@/lib/constants";

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

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(
    preselectedCourt
  );
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courtsRes, bookingsRes] = await Promise.all([
        fetch("/api/bookings/courts"),
        fetch(`/api/bookings?date=${selectedDate}`),
      ]);
      const courtsData = await courtsRes.json();
      const bookingsData = await bookingsRes.json();
      setCourts(courtsData);
      setBookedSlots(bookingsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSlotSelect = (courtId: string, hour: number) => {
    if (selectedCourt !== courtId) {
      setSelectedCourt(courtId);
      setSelectedStart(hour);
      setSelectedEnd(hour + 1);
    } else if (selectedStart === null) {
      setSelectedStart(hour);
      setSelectedEnd(hour + 1);
    } else if (selectedEnd !== null && hour === selectedEnd) {
      setSelectedEnd(hour + 1);
    } else if (hour === selectedStart && selectedEnd === selectedStart + 1) {
      setSelectedStart(null);
      setSelectedEnd(null);
    } else {
      setSelectedStart(hour);
      setSelectedEnd(hour + 1);
    }
  };

  const selectedCourtData = courts.find((c) => c.id === selectedCourt) || null;

  const handleProceedToCheckout = () => {
    if (!selectedCourtData || selectedStart === null || selectedEnd === null)
      return;

    const params = new URLSearchParams({
      courtId: selectedCourtData.id,
      courtName: selectedCourtData.name,
      courtType: selectedCourtData.type,
      date: selectedDate,
      startTime: selectedStart.toString(),
      endTime: selectedEnd.toString(),
      totalPrice: calculateTotalPrice(selectedCourtData.type, selectedStart, selectedEnd).toString(),
    });

    router.push(`/checkout?${params.toString()}`);
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
              Reservation
            </span>
            <h1 className="text-5xl md:text-7xl font-headline italic leading-[1.1] mb-8 tracking-tighter">
              The Art of <br />
              <span className="text-primary-fixed">Strategic Value.</span>
            </h1>
            <p className="text-lg text-stone-300 font-body font-light max-w-xl leading-relaxed">
              Wähle Datum, Court und Zeitslot für deine Buchung. Echtzeit-Verfügbarkeit aller 6 Courts.
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
                  setSelectedStart(null);
                  setSelectedEnd(null);
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
                  selectedCourt={selectedCourt}
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  onSlotSelect={handleSlotSelect}
                />
              )}
            </section>
          </div>

          {/* Right Column: Booking Summary */}
          <aside className="lg:col-span-4 sticky top-32">
            <BookingSummary
              court={selectedCourtData}
              date={selectedDate}
              startTime={selectedStart}
              endTime={selectedEnd}
              onProceedToCheckout={handleProceedToCheckout}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
