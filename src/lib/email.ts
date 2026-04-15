import { Resend } from "resend";
import { generateBookingToken } from "@/lib/booking-token";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://elite-padel.de";

interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
  courtName: string;
  courtType: string;
  date: string;
  startTime: number;
  endTime: number;
  totalPrice: number;
  bookingId: string;
  accessCode: string;
}

function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const courtTypeLabel = data.courtType === "double" ? "Doppel Court" : "Einzel Court";

  const { error } = await resend.emails.send({
    from: "Elite Padel <booking@elite-padel.de>",
    to: data.customerEmail,
    subject: `Buchungsbestätigung – ${data.courtName}, ${formatDate(data.date)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1b1c1a; margin: 0; padding: 0; background-color: #faf9f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #4a1a12; padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 0.15em; margin: 0; font-weight: 300;">ELITE PADEL</h1>
    </div>
    <div style="padding: 40px 32px;">
      <p style="font-size: 18px; margin-bottom: 24px;">Hallo ${data.customerName},</p>
      <p>deine Buchung wurde erfolgreich bestätigt. Hier sind deine Details:</p>

      <div style="background-color: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Court</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${data.courtName}</div>
              <div style="font-size: 12px; color: #6b6b6b;">${courtTypeLabel}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Datum</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatDate(data.date)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Zeitfenster</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatTime(data.startTime)} – ${formatTime(data.endTime)} Uhr</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="background-color: #4a1a12; color: #ffffff; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #d4a99a; margin-bottom: 8px;">Zugangscode Halle</div>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 0.3em; margin: 12px 0; color: #ffffff;">${data.accessCode}</div>
        <div style="font-size: 12px; color: #d4a99a;">Gültig am ${formatDate(data.date)} • Bitte Code nicht weitergeben</div>
      </div>

      <div style="background-color: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b6b6b;">Gesamtbetrag</div>
        <div style="font-size: 32px; font-weight: 700; color: #4a1a12; margin: 8px 0;">${formatPrice(data.totalPrice)}</div>
        <div style="font-size: 12px; color: #6b6b6b;">inkl. ${formatPrice(data.totalPrice * 0.19)} MwSt. (19%)</div>
      </div>

      <div style="background-color: #f5f0eb; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="font-size: 14px; margin: 0 0 12px 0;">Wegweiser zum Court</h3>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6;"><strong>${data.courtName}</strong></p>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6;">Nach Eingabe des Zugangscodes erreichst du deinen Court über den Haupteingang. Folge der Beschilderung zu den ${data.courtType === "double" ? "Doppel Courts (linker Hallenbereich)" : "Einzel Courts (rechter Hallenbereich)"}.</p>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6;">Bitte sei 10 Minuten vor deiner Buchung da, damit du pünktlich starten kannst.</p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${APP_URL}/my?email=${encodeURIComponent(data.customerEmail)}&token=${generateBookingToken(data.customerEmail)}"
           style="display: inline-block; background-color: #4a1a12; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          Meine Buchungen verwalten
        </a>
        <p style="font-size: 11px; color: #6b6b6b; margin-top: 12px;">Buchungen ansehen, stornieren & Zugangscodes abrufen</p>
      </div>

      <p style="font-size: 11px; color: #6b6b6b; text-align: center; margin-top: 8px;">Buchungs-ID: ${data.bookingId}</p>
    </div>
    <div style="padding: 32px; text-align: center; color: #6b6b6b; font-size: 11px; border-top: 1px solid #e8e6e3;">
      <p>ELITE PADEL CLUB</p>
      <p>booking@elite-padel.de</p>
      <p>Diese E-Mail wurde automatisch generiert. Bei Fragen kontaktiere uns per E-Mail.</p>
    </div>
  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("Failed to send booking confirmation email:", error);
    throw error;
  }
}

interface CancellationData {
  customerName: string;
  customerEmail: string;
  courtName: string;
  date: string;
  startTime: number;
  endTime: number;
  totalPrice: number;
  bookingId: string;
}

export async function sendCancellationEmail(data: CancellationData) {
  const { error } = await resend.emails.send({
    from: "Elite Padel <booking@elite-padel.de>",
    to: data.customerEmail,
    subject: `Stornierung – ${data.courtName}, ${formatDate(data.date)}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1b1c1a; margin: 0; padding: 0; background: #faf9f6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #4a1a12; padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 0.15em; margin: 0; font-weight: 300;">ELITE PADEL</h1>
    </div>
    <div style="padding: 40px 32px;">
      <p style="font-size: 18px; margin-bottom: 24px;">Hallo ${data.customerName},</p>
      <p>deine Buchung wurde storniert. Hier die Details der stornierten Buchung:</p>

      <div style="background: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Court</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${data.courtName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Datum</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatDate(data.date)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Zeitfenster</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatTime(data.startTime)} – ${formatTime(data.endTime)} Uhr</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Status</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px; color: #ba1a1a;">Storniert</div>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #6b6b6b; line-height: 1.6;">
        Der Betrag von <strong>${formatPrice(data.totalPrice)}</strong> wird dir in den nächsten Tagen erstattet.
        Bei Fragen kontaktiere uns gerne per E-Mail.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${APP_URL}/my?email=${encodeURIComponent(data.customerEmail)}&token=${generateBookingToken(data.customerEmail)}"
           style="display: inline-block; background: #4a1a12; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          Meine Buchungen ansehen
        </a>
      </div>

      <p style="font-size: 11px; color: #6b6b6b; text-align: center; margin-top: 16px;">
        Buchungs-ID: ${data.bookingId}
      </p>
    </div>
    <div style="padding: 32px; text-align: center; color: #6b6b6b; font-size: 11px; border-top: 1px solid #e8e6e3;">
      <p>ELITE PADEL CLUB</p>
      <p>booking@elite-padel.de</p>
    </div>
  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("Failed to send cancellation email:", error);
    throw error;
  }
}
