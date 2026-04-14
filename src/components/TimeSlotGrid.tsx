"use client";

import { useState } from "react";
import { TIME_SLOTS, formatTime, formatPrice, getPriceForHour } from "@/lib/constants";

interface TimeSlotGridProps {
  courts: Array<{
    id: string;
    name: string;
    type: string;
    pricePerHour: number;
  }>;
  bookedSlots: Array<{
    courtId: string;
    startTime: number;
    endTime: number;
  }>;
  selectedDate: string;
  selectedCourt: string | null;
  selectedStart: number | null;
  selectedEnd: number | null;
  onSlotSelect: (courtId: string, hour: number) => void;
}

export default function TimeSlotGrid({
  courts,
  bookedSlots,
  selectedDate,
  selectedCourt,
  selectedStart,
  selectedEnd,
  onSlotSelect,
}: TimeSlotGridProps) {
  const doppelCourts = courts.filter((c) => c.type === "double");
  const einzelCourts = courts.filter((c) => c.type === "standard");
  const [activeTab, setActiveTab] = useState<"double" | "standard">("double");

  const activeCourts = activeTab === "double" ? doppelCourts : einzelCourts;

  const isBooked = (courtId: string, hour: number) => {
    return bookedSlots.some(
      (slot) =>
        slot.courtId === courtId &&
        hour >= slot.startTime &&
        hour < slot.endTime
    );
  };

  const isPast = (hour: number) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    return selectedDate === today && hour <= now.getHours();
  };

  const isSelected = (courtId: string, hour: number) => {
    if (!selectedCourt || selectedCourt !== courtId) return false;
    if (selectedStart === null) return false;
    if (selectedEnd === null) return hour === selectedStart;
    return hour >= selectedStart && hour < selectedEnd;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-headline italic tracking-tight mb-1">
            Verfügbarkeit
          </h2>
          <p className="text-on-surface-variant font-light text-sm">
            Wähle einen Court und klicke auf die gewünschte Uhrzeit.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
              Frei
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
              Belegt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
              Gewählt
            </span>
          </div>
        </div>
      </div>

      {/* Court Type Tabs */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setActiveTab("double")}
          className={`flex-1 py-4 px-6 rounded-xl font-label text-xs tracking-widest uppercase transition-all ${
            activeTab === "double"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="block font-headline text-lg italic normal-case tracking-normal mb-0.5">
            Doppel Courts
          </span>
          <span className="opacity-70">{doppelCourts.length} Courts &middot; bis zu 4 Spieler</span>
        </button>
        <button
          onClick={() => setActiveTab("standard")}
          className={`flex-1 py-4 px-6 rounded-xl font-label text-xs tracking-widest uppercase transition-all ${
            activeTab === "standard"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="block font-headline text-lg italic normal-case tracking-normal mb-0.5">
            Einzel Courts
          </span>
          <span className="opacity-70">{einzelCourts.length} Courts &middot; bis zu 2 Spieler</span>
        </button>
      </div>

      {/* Court Cards with Time Slots */}
      <div className="space-y-4">
        {activeCourts.map((court) => {
          const isCourtSelected = selectedCourt === court.id;

          return (
            <div
              key={court.id}
              className={`rounded-xl border-2 transition-all ${
                isCourtSelected
                  ? "border-primary bg-primary/[0.03]"
                  : "border-transparent bg-surface-container-low"
              }`}
            >
              {/* Court Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">
                    sports_tennis
                  </span>
                  <div>
                    <h3 className="font-headline text-lg italic">{court.name}</h3>
                    <p className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant">
                      ab {formatPrice(getPriceForHour(court.type, 8))} / Stunde
                    </p>
                  </div>
                </div>
                {isCourtSelected && selectedStart !== null && selectedEnd !== null && (
                  <div className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-label tracking-wider uppercase">
                    {formatTime(selectedStart)} – {formatTime(selectedEnd)}
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-8 gap-1.5">
                  {TIME_SLOTS.map((hour) => {
                    const booked = isBooked(court.id, hour);
                    const past = isPast(hour);
                    const selected = isSelected(court.id, hour);
                    const disabled = booked || past;
                    const price = getPriceForHour(court.type, hour);

                    return (
                      <button
                        key={hour}
                        disabled={disabled}
                        onClick={() => onSlotSelect(court.id, hour)}
                        className={`relative flex flex-col items-center justify-center py-3 px-1 rounded-lg transition-all text-center ${
                          selected
                            ? "bg-primary text-on-primary shadow-md scale-[1.02]"
                            : booked
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                            : past
                            ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                            : "bg-white hover:bg-primary-container/50 hover:shadow-sm cursor-pointer text-on-surface"
                        }`}
                      >
                        <span className={`text-sm font-body font-medium ${selected ? "" : past || booked ? "" : ""}`}>
                          {formatTime(hour)}
                        </span>
                        <span className={`text-[10px] font-label mt-0.5 ${
                          selected ? "text-on-primary/80" : booked ? "line-through" : past ? "" : "text-on-surface-variant"
                        }`}>
                          {booked ? "belegt" : past ? "vorbei" : formatPrice(price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
