"use client";

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-headline italic tracking-tight mb-1">
            Live Availability
          </h2>
          <p className="text-on-surface-variant font-light text-sm">
            Echtzeit-Verfügbarkeit deiner Courts.
          </p>
        </div>
        <div className="flex gap-6">
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

      <div className="overflow-x-auto">
        <div className="min-w-[700px] space-y-6">
          {/* Court Rows */}
          {courts.map((court) => (
            <div key={court.id} className="flex items-center gap-6">
              <span className="w-24 text-[10px] font-label tracking-[0.2em] text-stone-400 uppercase shrink-0">
                {court.name}
              </span>
              <div className="flex-1 grid grid-cols-16 gap-1.5" style={{ gridTemplateColumns: `repeat(${TIME_SLOTS.length}, 1fr)` }}>
                {TIME_SLOTS.map((hour) => {
                  const booked = isBooked(court.id, hour);
                  const past = isPast(hour);
                  const selected = isSelected(court.id, hour);
                  const disabled = booked || past;

                  return (
                    <button
                      key={hour}
                      disabled={disabled}
                      onClick={() => onSlotSelect(court.id, hour)}
                      className={`h-14 rounded transition-all ${
                        selected
                          ? "bg-primary cursor-pointer"
                          : booked
                          ? "bg-stone-300 cursor-not-allowed"
                          : past
                          ? "bg-stone-100 cursor-not-allowed"
                          : "bg-primary-container cursor-pointer hover:opacity-80"
                      }`}
                      title={
                        booked
                          ? "Belegt"
                          : past
                          ? "Vergangen"
                          : `${formatTime(hour)} - ${formatPrice(getPriceForHour(court.type, hour))}/h`
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Time Labels */}
          <div
            className="flex items-center gap-6"
          >
            <span className="w-24 shrink-0" />
            <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${TIME_SLOTS.length}, 1fr)` }}>
              {TIME_SLOTS.map((hour) => (
                <span
                  key={hour}
                  className="text-[10px] font-label text-stone-400 tracking-widest uppercase text-center"
                >
                  {formatTime(hour)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
