import { Resend } from "resend";
import { generateBookingToken } from "@/lib/booking-token";
import { getWifi } from "@/lib/settings";
import {
  SITE_URL,
  SITE_NAME,
  CONTACT_EMAIL,
  VENUE_ADDRESS,
  GOOGLE_MAPS_URL,
  APPLE_MAPS_URL,
} from "@/lib/brand";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = SITE_URL;

type Locale = "de" | "en";

// Venue — sourced from @/lib/brand (single source of truth, shared with the
// /coming-soon page). When the address changes: update VENUE_ADDRESS there
// + regenerate public/venue-map.png (see scripts/generate-venue-map.py).
const VENUE = { name: SITE_NAME, ...VENUE_ADDRESS };

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
  locale?: Locale;
}

function formatTime(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatPrice(price: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CONFIRMATION_COPY = {
  de: {
    subjectPrefix: "Buchungsbestätigung",
    greeting: "Hallo",
    intro: "deine Buchung wurde erfolgreich bestätigt. Hier sind deine Details:",
    labelCourt: "Court",
    labelCourtTypeDouble: "Doppel Court",
    labelCourtTypeSingle: "Einzel Court",
    labelDate: "Datum",
    labelTimeSlot: "Zeitfenster",
    timeSuffix: "Uhr",
    accessLabel: "Zugangscode Halle",
    accessValidOn: "Gültig am",
    accessShareWarning: "Bitte Code nicht weitergeben",
    totalLabel: "Gesamtbetrag",
    vat: "inkl.",
    vatSuffix: "MwSt. (19%)",
    directionsTitle: "Wegweiser zum Court",
    directionsIntro1: (courtName: string) => `<strong>${courtName}</strong>`,
    directionsIntro2: (type: string) =>
      `Nach Eingabe des Zugangscodes erreichst du deinen Court über den Haupteingang. Folge der Beschilderung zu den ${
        type === "double" ? "Doppel Courts (linker Hallenbereich)" : "Einzel Court (rechter Hallenbereich)"
      }.`,
    directionsIntro3: "Bitte sei 10 Minuten vor deiner Buchung da, damit du pünktlich starten kannst.",
    venueTitle: "So findest du uns",
    venueAddressLine1: "Adresse",
    venueOpenGoogle: "In Google Maps öffnen",
    venueOpenApple: "In Apple Karten öffnen",
    wifiTitle: "WLAN in der Halle",
    wifiIntro: "Ideal für kurze Pausen zwischen den Spielen oder für Co-Working-Sessions.",
    wifiSsidLabel: "Netzwerk",
    wifiPasswordLabel: "Passwort",
    ctaButton: "Meine Buchungen verwalten",
    ctaHint: "Buchungen ansehen, stornieren & Zugangscodes abrufen",
    bookingIdLabel: "Buchungs-ID",
    footerNote: "Diese E-Mail wurde automatisch generiert. Bei Fragen kontaktiere uns per E-Mail.",
  },
  en: {
    subjectPrefix: "Booking confirmation",
    greeting: "Hello",
    intro: "your booking has been successfully confirmed. Here are your details:",
    labelCourt: "Court",
    labelCourtTypeDouble: "Double Court",
    labelCourtTypeSingle: "Single Court",
    labelDate: "Date",
    labelTimeSlot: "Time slot",
    timeSuffix: "",
    accessLabel: "Facility access code",
    accessValidOn: "Valid on",
    accessShareWarning: "Please don't share this code",
    totalLabel: "Total amount",
    vat: "incl.",
    vatSuffix: "VAT (19%)",
    directionsTitle: "Getting to your court",
    directionsIntro1: (courtName: string) => `<strong>${courtName}</strong>`,
    directionsIntro2: (type: string) =>
      `After entering your access code, reach your court via the main entrance. Follow the signs to the ${
        type === "double" ? "Double Courts (left side of the hall)" : "Single Court (right side of the hall)"
      }.`,
    directionsIntro3: "Please arrive 10 minutes before your booking starts so you can begin on time.",
    venueTitle: "How to find us",
    venueAddressLine1: "Address",
    venueOpenGoogle: "Open in Google Maps",
    venueOpenApple: "Open in Apple Maps",
    wifiTitle: "WiFi at the facility",
    wifiIntro: "Perfect for short breaks between matches or for co-working sessions.",
    wifiSsidLabel: "Network",
    wifiPasswordLabel: "Password",
    ctaButton: "Manage my bookings",
    ctaHint: "View bookings, cancel & retrieve access codes",
    bookingIdLabel: "Booking ID",
    footerNote: "This email was generated automatically. For questions, contact us by email.",
  },
} as const;

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const locale: Locale = data.locale === "en" ? "en" : "de";
  const copy = CONFIRMATION_COPY[locale];
  const courtTypeLabel =
    data.courtType === "double" ? copy.labelCourtTypeDouble : copy.labelCourtTypeSingle;
  const myLink = `${APP_URL}${locale === "en" ? "/en" : ""}/my?email=${encodeURIComponent(
    data.customerEmail
  )}&token=${generateBookingToken(data.customerEmail)}`;

  // Fetch WiFi credentials (falls back to defaults if DB unreachable).
  let wifi: { ssid: string; password: string } | null = null;
  try {
    wifi = await getWifi();
  } catch (e) {
    console.error("Failed to load WiFi settings, omitting from email:", e);
  }

  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
    to: data.customerEmail,
    subject: `${copy.subjectPrefix} – ${data.courtName}, ${formatDate(data.date, locale)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1b1c1a; margin: 0; padding: 0; background-color: #faf9f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #4a1a12; padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 0.15em; margin: 0; font-weight: 300;">${SITE_NAME.toUpperCase()}</h1>
    </div>
    <div style="padding: 40px 32px;">
      <p style="font-size: 18px; margin-bottom: 24px;">${copy.greeting} ${data.customerName},</p>
      <p>${copy.intro}</p>

      <div style="background-color: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelCourt}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${data.courtName}</div>
              <div style="font-size: 12px; color: #6b6b6b;">${courtTypeLabel}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelDate}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatDate(data.date, locale)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelTimeSlot}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}${copy.timeSuffix ? " " + copy.timeSuffix : ""}</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="background-color: #4a1a12; color: #ffffff; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #d4a99a; margin-bottom: 8px;">${copy.accessLabel}</div>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 0.3em; margin: 12px 0; color: #ffffff;">${data.accessCode}</div>
        <div style="font-size: 12px; color: #d4a99a;">${copy.accessValidOn} ${formatDate(data.date, locale)} • ${copy.accessShareWarning}</div>
      </div>

      <div style="background-color: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b6b6b;">${copy.totalLabel}</div>
        <div style="font-size: 32px; font-weight: 700; color: #4a1a12; margin: 8px 0;">${formatPrice(data.totalPrice, locale)}</div>
        <div style="font-size: 12px; color: #6b6b6b;">${copy.vat} ${formatPrice(data.totalPrice * 0.19, locale)} ${copy.vatSuffix}</div>
      </div>

      <div style="background-color: #f5f0eb; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="font-size: 14px; margin: 0 0 12px 0;">${copy.directionsTitle}</h3>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6;">${copy.directionsIntro1(data.courtName)}</p>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6;">${copy.directionsIntro2(data.courtType)}</p>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0; line-height: 1.6;">${copy.directionsIntro3}</p>
      </div>

      <!-- Venue / map card -->
      <div style="margin: 24px 0;">
        <h3 style="font-size: 14px; margin: 0 0 12px 0;">${copy.venueTitle}</h3>
        <a href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener"
           style="display: block; text-decoration: none; color: inherit; border-radius: 12px; overflow: hidden; border: 1px solid #e8e6e3;">
          <!-- Real OSM-rendered map with branded pin -->
          <img src="${APP_URL}/venue-map.png"
               width="600" height="280"
               alt="Karte — ${VENUE.street}, ${VENUE.city}"
               style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" />
          <!-- Address block -->
          <div style="padding: 20px 24px; background-color: #ffffff;">
            <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">${copy.venueAddressLine1}</div>
            <div style="font-weight: 600; font-size: 15px; color: #1b1c1a;">${VENUE.name}</div>
            <div style="font-size: 14px; color: #1b1c1a; margin-top: 2px;">${VENUE.street}</div>
            <div style="font-size: 14px; color: #1b1c1a;">${VENUE.zip} ${VENUE.city}</div>
          </div>
        </a>
        <!-- OSM attribution (required by ODbL) -->
        <div style="font-size: 10px; color: #9b9b9b; margin-top: 6px; text-align: right;">
          © <a href="https://www.openstreetmap.org/copyright" style="color: #9b9b9b; text-decoration: underline;">OpenStreetMap</a>
        </div>
        <!-- Map deep-link buttons -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px;">
          <tr>
            <td width="50%" style="padding-right: 6px;">
              <a href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener"
                 style="display: block; background-color: #ffffff; color: #4a1a12; border: 1px solid #4a1a12; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; font-weight: 600;">
                ${copy.venueOpenGoogle}
              </a>
            </td>
            <td width="50%" style="padding-left: 6px;">
              <a href="${APPLE_MAPS_URL}" target="_blank" rel="noopener"
                 style="display: block; background-color: #ffffff; color: #4a1a12; border: 1px solid #4a1a12; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; font-weight: 600;">
                ${copy.venueOpenApple}
              </a>
            </td>
          </tr>
        </table>
      </div>

      ${
        wifi
          ? `<!-- WiFi block -->
      <div style="background-color: #faf9f6; border: 1px solid #e8e6e3; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="font-size: 14px; margin: 0 0 6px 0;">${copy.wifiTitle}</h3>
        <p style="font-size: 12px; color: #6b6b6b; margin: 0 0 16px 0; line-height: 1.5;">${copy.wifiIntro}</p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e8e6e3;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;">${copy.wifiSsidLabel}</div>
              <div style="font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 15px; font-weight: 600; color: #1b1c1a; margin-top: 4px; letter-spacing: 0.02em;">${wifi.ssid}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px;">
              <div style="color: #6b6b6b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;">${copy.wifiPasswordLabel}</div>
              <div style="font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 15px; font-weight: 600; color: #4a1a12; margin-top: 4px; letter-spacing: 0.02em;">${wifi.password}</div>
            </td>
          </tr>
        </table>
      </div>`
          : ""
      }

      <div style="text-align: center; margin: 32px 0;">
        <a href="${myLink}"
           style="display: inline-block; background-color: #4a1a12; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          ${copy.ctaButton}
        </a>
        <p style="font-size: 11px; color: #6b6b6b; margin-top: 12px;">${copy.ctaHint}</p>
      </div>

      <p style="font-size: 11px; color: #6b6b6b; text-align: center; margin-top: 8px;">${copy.bookingIdLabel}: ${data.bookingId}</p>
    </div>
    <div style="padding: 32px; text-align: center; color: #6b6b6b; font-size: 11px; border-top: 1px solid #e8e6e3;">
      <p>${SITE_NAME.toUpperCase()}</p>
      <p>${CONTACT_EMAIL}</p>
      <p>${copy.footerNote}</p>
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
  locale?: Locale;
}

const CANCELLATION_COPY = {
  de: {
    subjectPrefix: "Stornierung",
    greeting: "Hallo",
    intro: "deine Buchung wurde storniert. Hier die Details der stornierten Buchung:",
    labelCourt: "Court",
    labelDate: "Datum",
    labelTimeSlot: "Zeitfenster",
    timeSuffix: "Uhr",
    labelStatus: "Status",
    statusCancelled: "Storniert",
    refundText: (amount: string) =>
      `Der Betrag von <strong>${amount}</strong> wird dir in den nächsten Tagen erstattet. Bei Fragen kontaktiere uns gerne per E-Mail.`,
    ctaButton: "Meine Buchungen ansehen",
    bookingIdLabel: "Buchungs-ID",
  },
  en: {
    subjectPrefix: "Booking cancelled",
    greeting: "Hello",
    intro: "your booking has been cancelled. Here are the details of the cancelled booking:",
    labelCourt: "Court",
    labelDate: "Date",
    labelTimeSlot: "Time slot",
    timeSuffix: "",
    labelStatus: "Status",
    statusCancelled: "Cancelled",
    refundText: (amount: string) =>
      `The amount of <strong>${amount}</strong> will be refunded within the next few days. For questions, please contact us by email.`,
    ctaButton: "View my bookings",
    bookingIdLabel: "Booking ID",
  },
} as const;

export async function sendCancellationEmail(data: CancellationData) {
  const locale: Locale = data.locale === "en" ? "en" : "de";
  const copy = CANCELLATION_COPY[locale];
  const myLink = `${APP_URL}${locale === "en" ? "/en" : ""}/my?email=${encodeURIComponent(
    data.customerEmail
  )}&token=${generateBookingToken(data.customerEmail)}`;

  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <${CONTACT_EMAIL}>`,
    to: data.customerEmail,
    subject: `${copy.subjectPrefix} – ${data.courtName}, ${formatDate(data.date, locale)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1b1c1a; margin: 0; padding: 0; background-color: #faf9f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #4a1a12; padding: 40px 32px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; letter-spacing: 0.15em; margin: 0; font-weight: 300;">${SITE_NAME.toUpperCase()}</h1>
    </div>
    <div style="padding: 40px 32px;">
      <p style="font-size: 18px; margin-bottom: 24px;">${copy.greeting} ${data.customerName},</p>
      <p>${copy.intro}</p>

      <div style="background-color: #faf9f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelCourt}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${data.courtName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelDate}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatDate(data.date, locale)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e8e6e3;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelTimeSlot}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}${copy.timeSuffix ? " " + copy.timeSuffix : ""}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <div style="color: #6b6b6b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">${copy.labelStatus}</div>
              <div style="font-weight: 600; font-size: 15px; margin-top: 4px; color: #ba1a1a;">${copy.statusCancelled}</div>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #6b6b6b; line-height: 1.6;">
        ${copy.refundText(formatPrice(data.totalPrice, locale))}
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${myLink}"
           style="display: inline-block; background-color: #4a1a12; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
          ${copy.ctaButton}
        </a>
      </div>

      <p style="font-size: 11px; color: #6b6b6b; text-align: center; margin-top: 16px;">
        ${copy.bookingIdLabel}: ${data.bookingId}
      </p>
    </div>
    <div style="padding: 32px; text-align: center; color: #6b6b6b; font-size: 11px; border-top: 1px solid #e8e6e3;">
      <p>${SITE_NAME.toUpperCase()}</p>
      <p>${CONTACT_EMAIL}</p>
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
