// Student discount: 20% off when EVERY selected slot falls Mo-Fr inside the
// 08:00-12:00 window. All-or-nothing keeps the UI/email copy honest and
// avoids per-slot bookkeeping. The booking always lives on a single date,
// so weekday is computed once.

export const STUDENT_DISCOUNT_PERCENT = 20;
export const STUDENT_VERIFICATION_VALIDITY_DAYS = 365;
export const STUDENT_SLOT_START_HOUR = 8;
export const STUDENT_SLOT_END_HOUR = 12;

interface SlotLike {
  startTime: number;
  endTime: number;
}

// Parse YYYY-MM-DD as UTC midnight to avoid server-TZ flipping the weekday
// across a date boundary. The booking date string is always a calendar
// date, not a wall-clock instant.
export function getWeekdayFromDateString(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).getUTCDay();
}

export function isStudentSlot(weekday: number, slot: SlotLike): boolean {
  const isWeekday = weekday >= 1 && weekday <= 5; // Mon..Fri
  return (
    isWeekday &&
    slot.startTime >= STUDENT_SLOT_START_HOUR &&
    slot.endTime <= STUDENT_SLOT_END_HOUR
  );
}

export function isBookingDiscountEligible(
  dateStr: string,
  slots: SlotLike[]
): boolean {
  if (slots.length === 0) return false;
  const weekday = getWeekdayFromDateString(dateStr);
  return slots.every((s) => isStudentSlot(weekday, s));
}

export function applyStudentDiscount(amount: number): number {
  return Math.round(amount * (1 - STUDENT_DISCOUNT_PERCENT / 100) * 100) / 100;
}
