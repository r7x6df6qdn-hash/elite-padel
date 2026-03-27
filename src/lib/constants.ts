export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 24;

export const TIME_SLOTS = Array.from(
  { length: CLOSING_HOUR - OPENING_HOUR },
  (_, i) => OPENING_HOUR + i
);

export const PEAK_HOUR = 16; // Ab 16 Uhr gelten Peak-Preise

export const COURT_TYPES = {
  standard: {
    label: "Einzel Court",
    maxPlayers: 4,
    priceOffPeak: 24,
    pricePeak: 28,
  },
  double: {
    label: "Doppel Court",
    maxPlayers: 8,
    priceOffPeak: 38,
    pricePeak: 40,
  },
} as const;

export function getPriceForHour(courtType: string, hour: number): number {
  const type = COURT_TYPES[courtType as keyof typeof COURT_TYPES];
  if (!type) return 0;
  return hour < PEAK_HOUR ? type.priceOffPeak : type.pricePeak;
}

export function calculateTotalPrice(courtType: string, startTime: number, endTime: number): number {
  let total = 0;
  for (let h = startTime; h < endTime; h++) {
    total += getPriceForHour(courtType, h);
  }
  return total;
}

export function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}
