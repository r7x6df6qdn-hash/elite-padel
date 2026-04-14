"use client";

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDateStr = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const monthNames = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
  ];

  return (
    <div>
      <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-4">
        Calendar Date
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {dates.map((date) => {
          const dateStr = formatDateStr(date);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === formatDateStr(today);

          return (
            <button
              key={dateStr}
              onClick={() => onDateChange(dateStr)}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all min-w-[72px] ${
                isSelected
                  ? "bg-primary text-on-primary shadow-md"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface"
              }`}
            >
              <span
                className={`text-[10px] font-label tracking-widest uppercase ${
                  isSelected ? "text-on-primary/70" : "text-stone-400"
                }`}
              >
                {dayNames[date.getDay()]}
              </span>
              <span className="text-xl font-headline italic mt-1">
                {date.getDate()}
              </span>
              <span
                className={`text-[10px] font-label tracking-widest ${
                  isSelected ? "text-on-primary/70" : "text-stone-400"
                }`}
              >
                {monthNames[date.getMonth()]}
              </span>
              {isToday && (
                <span
                  className={`text-[9px] font-label tracking-widest uppercase mt-1 ${
                    isSelected ? "text-on-primary" : "text-primary"
                  }`}
                >
                  Heute
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
