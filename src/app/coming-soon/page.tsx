"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  SITE_NAME,
  LEGAL_EMAIL,
  OPENING_WINDOW_DE,
  OPENING_WINDOW_EN,
  VENUE_ADDRESS,
  GOOGLE_MAPS_URL,
  APPLE_MAPS_URL,
  WHATSAPP_GROUP_URL,
} from "@/lib/brand";
import Reveal from "@/components/Reveal";
import Logo from "@/components/Logo";

type Locale = "de" | "en";

const COPY = {
  de: {
    badge: "Padel Club Ludwigsburg",
    addressPill: `${VENUE_ADDRESS.street} · ${VENUE_ADDRESS.zip} ${VENUE_ADDRESS.city}`,
    comingSoon: "Coming Soon",
    headline: "Bald ist es soweit.",
    openingLabel: "Geplante Eröffnung",
    subheadline: `${SITE_NAME} eröffnet ${OPENING_WINDOW_DE} in Ludwigsburg.`,
    description: "Ludwigsburg bekommt einen neuen Ort für Padel, Community und Events.",
    scroll: "Scrollen",

    visionLabel: "Unsere Vision",
    visionHeadline: "Padel im Kreis Ludwigsburg, neu gedacht.",
    visionText:
      "In der Maybachstraße entsteht ein Ort, an dem Sport, modernes Design und echte Club-Atmosphäre zusammenkommen — kuratiert bis ins Detail, offen für alle, die mehr wollen als nur eine Buchung.",

    floorplanLabel: "Was entsteht",
    floorplanHeadline: "Mehr als ein Sportcenter.",
    floorplanIntro:
      "3 Doppel- und 1 Einzelcourt, ein eigener Gastro- & Loungebereich und eine Outdoor-Lounge zum Verweilen nach dem Match.",
    amenities: [
      { icon: "sports_tennis", title: "3 Doppel Padel Courts" },
      { icon: "sports_tennis", title: "1 Single Padel Court" },
      { icon: "local_bar", title: "Gastro & Lounge Bereich", text: "Mit Bar & Sitzplätzen" },
      { icon: "checkroom", title: "Umkleiden & Sanitärbereich", text: "Unter der Gastro" },
      { icon: "deck", title: "Outdoor-Lounge", text: "Mit Sitzbereich & Pflanzen" },
      { icon: "emoji_events", title: "Training, Turniere & Events", text: "Für Einsteiger, Ambitionierte und Firmenevents" },
      { icon: "wifi", title: "WLAN & Co-Working", text: "Auch für kurze Pausen oder mobiles Arbeiten" },
      { icon: "smartphone", title: "Digitale Buchung & Zugang", text: "Komplett per App, rund um die Uhr" },
    ],

    loungeLabel: "Community",
    loungeHeadline: "Ankommen. Verweilen. Bleiben.",
    loungeText:
      "Direkter Blick auf die Courts, gemütliche Sitzbereiche und Drinks & Snacks aus der Gastro — die Lounge ist der Ort für Pausen zwischen den Sätzen und Runden danach, die länger dauern als geplant.",

    bookingLabel: "Buchung ab Eröffnung",
    bookingHeadline: "Buchung leicht gemacht.",
    bookingIntro:
      "Ab der Eröffnung reservierst du deinen Court bei uns ganz bequem über Playtomic — direkt vom Sofa aus.",
    bookingSteps: [
      { n: "01", title: "App herunterladen", text: "Playtomic App im App Store oder Google Play laden." },
      { n: "02", title: "Club auswählen", text: `„${SITE_NAME}“ in der Playtomic-Suche eingeben.` },
      { n: "03", title: "Zeit & Court wählen", text: "Freien Slot auf einem unserer Courts sichern." },
      { n: "04", title: "Freunde einladen", text: "Mitspieler einladen und Buchung bestätigen." },
      { n: "05", title: "Zugangscode & losspielen", text: "Persönlicher Code öffnet dir zur gebuchten Zeit die Halle." },
    ],
    bookingFootnote: "Buchung startet mit der Eröffnung — Details folgen in Kürze.",

    locationLabel: "Standort",
    locationHeadline: "So findest du uns.",
    openGoogle: "In Google Maps öffnen",
    openApple: "In Apple Karten öffnen",

    formTitle: "Verpasse nicht unser Opening Event",
    formHint: "Trag dich ein und wir melden uns, sobald der Termin feststeht.",
    orDivider: "oder",
    whatsappCta: "Tritt unserer WhatsApp-Community bei",
    emailPlaceholder: "deine@email.de",
    submit: "Eintragen",
    submitting: "Wird gesendet…",
    successTitle: "Du bist dabei.",
    successText: "Wir melden uns, sobald der Eröffnungstermin feststeht.",
    errorGeneric: "Etwas ist schiefgelaufen. Bitte versuch es erneut.",
    errorInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
    countZero: "Sei die erste Anmeldung auf der Liste.",
    countOne: "1 Person ist schon dabei.",
    countMany: (n: number) => `${n} Personen sind schon dabei.`,

    footerAddressLabel: "Adresse",
    footerContactLabel: "Kontakt",
  },
  en: {
    badge: "Padel Club Ludwigsburg",
    addressPill: `${VENUE_ADDRESS.street} · ${VENUE_ADDRESS.zip} ${VENUE_ADDRESS.city}`,
    comingSoon: "Coming Soon",
    headline: "Coming soon.",
    openingLabel: "Planned opening",
    subheadline: `${SITE_NAME} opens ${OPENING_WINDOW_EN} in Ludwigsburg.`,
    description: "Ludwigsburg is getting a new home for padel, community and events.",
    scroll: "Scroll",

    visionLabel: "Our vision",
    visionHeadline: "Padel near Ludwigsburg, reimagined.",
    visionText:
      "On Maybachstraße, a place is taking shape where sport, modern design and real club atmosphere come together — curated down to the last detail, open to anyone who wants more than just a booking.",

    floorplanLabel: "What's coming",
    floorplanHeadline: "More than a sports center.",
    floorplanIntro:
      "3 double and 1 single court, our own bar & lounge area, and an outdoor lounge to hang out on after the match.",
    amenities: [
      { icon: "sports_tennis", title: "3 double padel courts" },
      { icon: "sports_tennis", title: "1 single padel court" },
      { icon: "local_bar", title: "Bar & lounge area", text: "With seating" },
      { icon: "checkroom", title: "Changing rooms & showers", text: "Below the bar area" },
      { icon: "deck", title: "Outdoor lounge", text: "With seating & plants" },
      { icon: "emoji_events", title: "Training, tournaments & events", text: "For beginners and corporate events" },
      { icon: "wifi", title: "WiFi & co-working", text: "For breaks or working on the go" },
      { icon: "smartphone", title: "Digital booking & access", text: "Entirely via app, around the clock" },
    ],

    loungeLabel: "Community",
    loungeHeadline: "Arrive. Stay. Linger.",
    loungeText:
      "A direct view of the courts, comfortable seating and drinks & snacks from the bar — the lounge is where you take a break between sets, and where the round afterwards runs longer than planned.",

    bookingLabel: "Booking from opening",
    bookingHeadline: "Booking made easy.",
    bookingIntro:
      "From opening day, you'll reserve your court with us via Playtomic — straight from your couch.",
    bookingSteps: [
      { n: "01", title: "Download the app", text: "Get the Playtomic app on the App Store or Google Play." },
      { n: "02", title: "Pick the club", text: `Search for “${SITE_NAME}” in Playtomic.` },
      { n: "03", title: "Choose time & court", text: "Grab a free slot on one of our courts." },
      { n: "04", title: "Invite friends", text: "Invite your playing partners and confirm the booking." },
      { n: "05", title: "Access code & play", text: "Your personal code unlocks the hall at your booked time." },
    ],
    bookingFootnote: "Booking opens with the venue — details coming soon.",

    locationLabel: "Location",
    locationHeadline: "How to find us.",
    openGoogle: "Open in Google Maps",
    openApple: "Open in Apple Maps",

    formTitle: "Don't miss our opening event",
    formHint: "Sign up and we'll let you know as soon as the date is set.",
    orDivider: "or",
    whatsappCta: "Join our WhatsApp community",
    emailPlaceholder: "you@email.com",
    submit: "Sign up",
    submitting: "Sending…",
    successTitle: "You're on the list.",
    successText: "We'll be in touch as soon as the opening date is set.",
    errorGeneric: "Something went wrong. Please try again.",
    errorInvalid: "Please enter a valid email address.",
    countZero: "Be the first one on the list.",
    countOne: "1 person has already signed up.",
    countMany: (n: number) => `${n} people have already signed up.`,

    footerAddressLabel: "Address",
    footerContactLabel: "Contact",
  },
} as const;

function WaitlistForm({ t, locale }: { t: (typeof COPY)[Locale]; locale: Locale }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/waitlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error === "invalid_email" ? t.errorInvalid : t.errorGeneric);
        setStatus("error");
        return;
      }
      setStatus("success");
      // Re-fetch rather than optimistically incrementing — a re-submit of
      // an already-registered email is idempotent server-side and wouldn't
      // actually move the real count.
      fetch("/api/waitlist")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && typeof d.count === "number" && setCount(d.count))
        .catch(() => {});
    } catch {
      setErrorMsg(t.errorGeneric);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Only shown once the real number is credible on its own — a true
          but tiny count reads worse than no count at all. Never fake this
          number; once it's high enough to be worth showing, it shows itself. */}
      {count !== null && count >= 20 && (
        <div className="inline-flex items-center gap-2 mb-6 text-secondary bg-secondary-container/50 px-4 py-2 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse-dot" />
          <span className="text-xs font-label tracking-wide uppercase">
            {t.countMany(count)}
          </span>
        </div>
      )}

      {status === "success" ? (
        <div className="flex flex-col items-center gap-3 text-center text-secondary bg-surface-container-lowest rounded-2xl p-8 md:p-10 editorial-shadow">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
          <div>
            <p className="font-medium text-lg">{t.successTitle}</p>
            <p className="text-sm text-on-surface-variant font-light">{t.successText}</p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest rounded-2xl p-3 editorial-shadow transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary-fixed-dim"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={t.emailPlaceholder}
            className="input flex-1 shadow-none bg-transparent"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary whitespace-nowrap hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === "loading" ? t.submitting : t.submit}
          </button>
        </form>
      )}

      {status === "error" && <p className="mt-3 text-sm text-error">{errorMsg}</p>}
    </div>
  );
}

export default function ComingSoonPage() {
  const [locale, setLocale] = useState<Locale>("de");
  const t = COPY[locale];

  return (
    <div className="min-h-screen bg-background">
      {/* Header — fixed across the whole page (photo hero + cream sections
          below), so the logo and language toggle are always reachable, not
          just buried inside the hero. */}
      <header className="fixed top-0 inset-x-0 z-30 bg-background/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          <Logo className="h-5 md:h-6 w-auto" />
          <div className="flex items-center gap-1 text-[11px] font-label tracking-widest uppercase">
            <button
              onClick={() => setLocale("de")}
              className={`px-2 py-1 transition-colors ${
                locale === "de" ? "text-on-background font-semibold" : "text-on-surface-variant/60 hover:text-on-surface-variant"
              }`}
              aria-label="Deutsch"
            >
              DE
            </button>
            <span className="text-on-surface-variant/40">/</span>
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-1 transition-colors ${
                locale === "en" ? "text-on-background font-semibold" : "text-on-surface-variant/60 hover:text-on-surface-variant"
              }`}
              aria-label="English"
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Hero — real exterior render as full-bleed background. Content sits
          bottom-left, not centered in a card: the photo is dark enough on
          its own now to carry the text directly, and an asymmetric block
          reads as art-directed rather than a stock landing-page layout. */}
      <section className="relative flex flex-col justify-end px-6 md:px-16 pt-32 pb-20 md:pb-24 min-h-[95vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/aussenansicht.jpg"
            alt={`${SITE_NAME} building exterior`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[2%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(23,17,15,0.95)_0%,rgba(23,17,15,0.9)_48%,rgba(23,17,15,0.4)_75%,rgba(23,17,15,0.05)_100%)]" />
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* No second logo mark here — the photo already carries the brand
              (facade lettering, flags, entrance sign) and the header above
              now carries the persistent logo, so a third mark would just
              compete with both. */}
          <span className="sr-only">{SITE_NAME} – Urban Padel Club</span>

          <span className="inline-flex items-center gap-2 text-white/70 mb-6">
            <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
            <span className="font-label text-[11px] tracking-[0.3em] uppercase">
              {t.addressPill}
            </span>
          </span>

          <h1 className="text-5xl md:text-7xl font-headline italic leading-[1.05] tracking-tighter text-white mb-5">
            {t.headline}
          </h1>

          <span className="inline-block font-label text-[11px] tracking-[0.3em] uppercase text-primary-fixed-dim mb-6 pb-1 border-b border-primary-fixed-dim/40">
            {t.comingSoon}
          </span>

          <p className="text-lg font-body font-light text-white mb-3 max-w-lg">
            {t.subheadline}
          </p>

          <p className="text-sm font-body font-light text-stone-300 leading-relaxed max-w-md">
            {t.description}
          </p>
        </div>

        <div className="relative z-10 hidden md:flex mt-14 items-center gap-3 text-white/60 animate-bounce-y">
          <span className="font-label text-[10px] tracking-[0.3em] uppercase">{t.scroll}</span>
          <span className="w-10 h-px bg-white/40" />
        </div>
      </section>

      {/* Waitlist signup — right after the hero, since capturing sign-ups
          before opening is the most important thing this page can do. A
          solid primary-color break (the only one on the page) makes this
          the visual peak of the scroll, not just another cream section. */}
      <section className="px-6 md:px-12 py-20 md:py-28 bg-primary text-on-primary">
        <Reveal className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-4xl mb-5 block text-primary-fixed-dim">
            mail
          </span>
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight mb-4">
            {t.formTitle}
          </h2>
          <p className="text-white/80 font-light leading-relaxed max-w-md mx-auto mb-10">
            {t.formHint}
          </p>
          <WaitlistForm t={t} locale={locale} />

          <div className="flex items-center gap-4 max-w-xs mx-auto my-8">
            <span className="h-px flex-1 bg-white/20" />
            <span className="font-label text-[10px] tracking-[0.3em] uppercase text-white/50">
              {t.orDivider}
            </span>
            <span className="h-px flex-1 bg-white/20" />
          </div>

          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-3 bg-white/10 border border-white/25 text-white px-6 py-3 rounded-lg font-label text-xs tracking-widest uppercase transition-all hover:bg-white/20 hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 4.99L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.25-8.25 8.25a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25zm-4.52 3.83c-.16 0-.42.06-.64.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.35.99 2.51.12.16 1.7 2.6 4.11 3.64 2 .87 2.41.7 2.84.65.43-.04 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.32-.75-1.8-.2-.47-.4-.4-.54-.41-.14-.01-.3-.01-.46-.01z" />
            </svg>
            {t.whatsappCta}
          </a>
        </Reveal>
      </section>

      {/* Vision */}
      <section className="px-6 md:px-12 py-20 bg-surface-container-lowest">
        <Reveal className="max-w-screen-md mx-auto text-center">
          <span className="section-label justify-center inline-block">{t.visionLabel}</span>
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight mb-6">
            {t.visionHeadline}
          </h2>
          <p className="text-on-surface-variant font-light leading-relaxed max-w-xl mx-auto">
            {t.visionText}
          </p>
        </Reveal>
      </section>

      {/* Floor plan */}
      <section className="px-6 md:px-12 py-24 max-w-screen-xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="section-label justify-center inline-block">{t.floorplanLabel}</span>
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight mb-6">
            {t.floorplanHeadline}
          </h2>
          <p className="text-on-surface-variant font-light leading-relaxed max-w-xl mx-auto">
            {t.floorplanIntro}
          </p>
        </Reveal>

        <Reveal delayMs={100} className="rounded-xl overflow-hidden editorial-shadow mb-8">
          <Image
            src="/hallenplan.jpg"
            alt={t.floorplanHeadline}
            width={1536}
            height={1024}
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="w-full h-auto block"
          />
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {t.amenities.map((a, i) => (
            <Reveal key={a.title} delayMs={100 + i * 60}>
              <div className="group h-full bg-surface-container-lowest rounded-xl p-5 md:p-6 editorial-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110">
                  <span className="material-symbols-outlined text-xl">{a.icon}</span>
                </span>
                <p className="font-body text-sm font-medium leading-snug transition-colors duration-300 group-hover:text-primary">
                  {a.title}
                </p>
                {"text" in a && a.text && (
                  <p className="text-xs text-on-surface-variant font-light mt-1">{a.text}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Lounge */}
      <section className="px-6 md:px-12 py-24 max-w-screen-xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="section-label justify-center inline-block">{t.loungeLabel}</span>
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight mb-6">
            {t.loungeHeadline}
          </h2>
          <p className="text-on-surface-variant font-light leading-relaxed max-w-xl mx-auto">
            {t.loungeText}
          </p>
        </Reveal>

        <Reveal delayMs={100} className="rounded-xl overflow-hidden editorial-shadow">
          <Image
            src="/lounge.jpg"
            alt={t.loungeHeadline}
            width={1448}
            height={1086}
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="w-full h-auto block"
          />
        </Reveal>
      </section>

      {/* Booking via Playtomic */}
      <section className="px-6 md:px-12 py-24 bg-stone-900 text-white">
        <div className="max-w-screen-xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="font-label text-xs tracking-[0.3em] uppercase text-primary-container mb-4 block">
              {t.bookingLabel}
            </span>
            <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight mb-6">
              {t.bookingHeadline}
            </h2>
            <p className="text-stone-300 font-light max-w-xl mx-auto leading-relaxed mb-6">
              {t.bookingIntro}
            </p>
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-2 pr-4 py-1.5">
              <img src="/playtomic-icon.svg" alt="" className="h-5 w-5 rounded-[5px]" />
              <span className="font-label text-[11px] tracking-[0.2em] uppercase text-white/80">
                Playtomic
              </span>
            </span>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {t.bookingSteps.map((s, i) => (
              <Reveal key={s.n} delayMs={i * 80}>
                <div className="group transition-transform duration-300 hover:-translate-y-1">
                  <span className="font-headline italic text-2xl text-primary-container mb-3 block">
                    {s.n}
                  </span>
                  <h3 className="font-body font-medium mb-2 transition-colors duration-300 group-hover:text-primary-fixed-dim">
                    {s.title}
                  </h3>
                  <p className="text-sm text-stone-400 font-light leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="text-center text-[10px] font-label uppercase tracking-widest text-stone-500 mt-16">
            {t.bookingFootnote}
          </p>
        </div>
      </section>

      {/* Location */}
      <section className="px-6 md:px-12 py-24 max-w-screen-xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="section-label justify-center inline-block">{t.locationLabel}</span>
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight">
            {t.locationHeadline}
          </h2>
        </Reveal>

        <Reveal className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-stretch">
          {/* Live Google Maps embed — a real, legible, interactive map beats
              a color-treated static screenshot. No API key needed for the
              classic /maps?...&output=embed iframe. */}
          <div className="relative rounded-xl overflow-hidden editorial-shadow min-h-[280px] border border-outline-variant/30">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                `${VENUE_ADDRESS.street}, ${VENUE_ADDRESS.zip} ${VENUE_ADDRESS.city}`
              )}&z=16&output=embed`}
              title={t.addressPill}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow flex flex-col justify-center gap-6">
            <div>
              <span className="material-symbols-outlined text-primary text-2xl mb-3 block">
                location_on
              </span>
              <p className="font-body">
                {VENUE_ADDRESS.street}
                <br />
                {VENUE_ADDRESS.zip} {VENUE_ADDRESS.city}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener"
                className="btn-outline text-[10px] text-center"
              >
                {t.openGoogle}
              </a>
              <a
                href={APPLE_MAPS_URL}
                target="_blank"
                rel="noopener"
                className="btn-outline text-[10px] text-center"
              >
                {t.openApple}
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 text-center border-t border-outline-variant/20">
        <Logo className="h-6 w-auto mx-auto mb-4" />
        <p className="text-[10px] font-label uppercase tracking-widest text-stone-400 leading-relaxed">
          {t.footerAddressLabel}: {VENUE_ADDRESS.street}, {VENUE_ADDRESS.zip} {VENUE_ADDRESS.city}
          <br />
          {t.footerContactLabel}: {LEGAL_EMAIL}
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a
            href="https://www.instagram.com/rueckwand.club/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-[10px] font-label uppercase tracking-widest text-stone-400 hover:text-primary transition-colors underline"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
            </svg>
            Instagram
          </a>
          <span className="text-stone-300">·</span>
          <a
            href="/datenschutz"
            className="text-[10px] font-label uppercase tracking-widest text-stone-400 hover:text-primary transition-colors underline"
          >
            Datenschutz
          </a>
          <span className="text-stone-300">·</span>
          <a
            href="/impressum"
            className="text-[10px] font-label uppercase tracking-widest text-stone-400 hover:text-primary transition-colors underline"
          >
            Impressum
          </a>
        </div>
        <p className="text-stone-300 font-label text-[10px] tracking-[0.3em] uppercase mt-6">
          © {new Date().getFullYear()} {SITE_NAME.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}
