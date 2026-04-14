import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    from: "Elite Padel <booking@elitepadel.club>",
    to: data.customerEmail,
    subject: `Buchungsbestätigung – ${data.courtName}, ${formatDate(data.date)}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1b1c1a; margin: 0; padding: 0; background: #faf9f6; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #69251b; padding: 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; letter-spacing: 0.15em; margin: 0; font-weight: 300; }
    .content { padding: 40px 32px; }
    .greeting { font-size: 18px; margin-bottom: 24px; }
    .details { background: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e6e3; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
    .detail-value { font-weight: 600; font-size: 15px; }
    .access-box { background: #69251b; color: #ffffff; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0; }
    .access-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.8; margin-bottom: 8px; }
    .access-code { font-size: 36px; font-weight: 700; letter-spacing: 0.3em; margin: 12px 0; }
    .access-note { font-size: 12px; opacity: 0.7; }
    .price-box { background: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .price-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b6b6b; }
    .price { font-size: 32px; font-weight: 700; color: #69251b; margin: 8px 0; }
    .price-tax { font-size: 12px; color: #6b6b6b; }
    .info { background: #f5f0eb; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .info h3 { font-size: 14px; margin: 0 0 12px 0; }
    .info p { font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6; }
    .footer { padding: 32px; text-align: center; color: #6b6b6b; font-size: 11px; border-top: 1px solid #e8e6e3; }
    .booking-id { font-size: 11px; color: #6b6b6b; text-align: center; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ELITE PADEL</h1>
    </div>
    <div class="content">
      <p class="greeting">Hallo ${data.customerName},</p>
      <p>deine Buchung wurde erfolgreich bestätigt. Hier sind deine Details:</p>

      <div class="details">
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

      <div class="access-box">
        <div class="access-label">Zugangscode Halle</div>
        <div class="access-code">${data.accessCode}</div>
        <div class="access-note">Gültig am ${formatDate(data.date)} • Bitte Code nicht weitergeben</div>
      </div>

      <div class="price-box">
        <div class="price-label">Gesamtbetrag</div>
        <div class="price">${formatPrice(data.totalPrice)}</div>
        <div class="price-tax">inkl. ${formatPrice(data.totalPrice * 0.19)} MwSt. (19%)</div>
      </div>

      <div class="info">
        <h3>📍 Wegweiser zum Court</h3>
        <p><strong>${data.courtName}</strong></p>
        <p>Nach Eingabe des Zugangscodes erreichst du deinen Court über den Haupteingang. Folge der Beschilderung zu den ${data.courtType === "double" ? "Doppel Courts (linker Hallenbereich)" : "Einzel Courts (rechter Hallenbereich)"}.</p>
        <p>Bitte sei 10 Minuten vor deiner Buchung da, damit du pünktlich starten kannst.</p>
      </div>

      <p class="booking-id">Buchungs-ID: ${data.bookingId}</p>
    </div>
    <div class="footer">
      <p>ELITE PADEL CLUB</p>
      <p>concierge@elitepadel.club</p>
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
