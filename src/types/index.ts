export interface Court {
  id: string;
  name: string;
  type: "standard" | "double";
  pricePerHour: number;
  description: string | null;
}

export interface Booking {
  id: string;
  courtId: string;
  date: string;
  startTime: number;
  endTime: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  stripePaymentId: string | null;
  easybillInvoiceId: string | null;
}

export interface BookingSlot {
  courtId: string;
  courtName: string;
  courtType: string;
  date: string;
  startTime: number;
  endTime: number;
  pricePerHour: number;
  totalPrice: number;
  available: boolean;
}

export interface CheckoutData {
  courtId: string;
  courtName: string;
  courtType: string;
  date: string;
  startTime: number;
  endTime: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}
