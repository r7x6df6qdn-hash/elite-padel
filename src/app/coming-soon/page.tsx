"use client";

import { useEffect, useState } from "react";
import {
  SITE_NAME,
  LEGAL_EMAIL,
  OPENING_WINDOW_DE,
  OPENING_WINDOW_EN,
  VENUE_ADDRESS,
  GOOGLE_MAPS_URL,
  APPLE_MAPS_URL,
} from "@/lib/brand";
import Reveal from "@/components/Reveal";

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

    floorplanLabel: "Unser Grundriss",
    floorplanHeadline: "Modern, großzügig, durchdacht.",
    floorplanIntro:
      "3 Doppel- und 1 Einzelcourt, ein eigener Gastro- & Loungebereich und eine Dachterrasse zum Verweilen nach dem Match.",
    amenities: [
      { icon: "sports_tennis", title: "3 Doppel Padel Courts" },
      { icon: "sports_tennis", title: "1 Single Padel Court" },
      { icon: "local_bar", title: "Gastro & Lounge Bereich", text: "Mit Bar & Sitzplätzen" },
      { icon: "stairs", title: "Zugang zur Dachterrasse" },
      { icon: "checkroom", title: "Umkleiden & Sanitärbereich", text: "Unter der Gastro" },
      { icon: "deck", title: "Outdoor Lounge auf der Dachterrasse", text: "Mit Sitzbereich & Pflanzen" },
    ],

    featuresLabel: "Was entsteht",
    featuresHeadline: "Mehr als ein Sportcenter.",
    features: [
      { n: "01", title: "3 Indoor-Doppelcourts", text: "Hochwertige Courts mit professioneller Beleuchtung, ganzjährig indoor." },
      { n: "02", title: "1 Indoor-Einzelcourt", text: "Für schnelle 1v1-Matches und Training." },
      { n: "03", title: "Lounge & Aufenthaltsbereich", text: "Zum Ankommen, Verweilen und Bleiben nach dem Match." },
      { n: "04", title: "Training, Turniere & Events", text: "Für Einsteiger, Ambitionierte und Firmenevents." },
      { n: "05", title: "WLAN & Co-Working", text: "Auch für kurze Pausen zwischen den Spielen oder mobiles Arbeiten." },
      { n: "06", title: "Digitale Buchung & Zugang", text: "Buchung und Zutritt komplett per App — rund um die Uhr." },
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

    floorplanLabel: "Our floor plan",
    floorplanHeadline: "Modern, spacious, thought through.",
    floorplanIntro:
      "3 double and 1 single court, our own bar & lounge area, and a roof terrace to hang out on after the match.",
    amenities: [
      { icon: "sports_tennis", title: "3 double padel courts" },
      { icon: "sports_tennis", title: "1 single padel court" },
      { icon: "local_bar", title: "Bar & lounge area", text: "With seating" },
      { icon: "stairs", title: "Roof terrace access" },
      { icon: "checkroom", title: "Changing rooms & showers", text: "Below the bar area" },
      { icon: "deck", title: "Outdoor lounge on the roof terrace", text: "With seating & plants" },
    ],

    featuresLabel: "What's coming",
    featuresHeadline: "More than a sports center.",
    features: [
      { n: "01", title: "3 indoor double courts", text: "Premium courts with professional lighting, indoor year-round." },
      { n: "02", title: "1 indoor single court", text: "For quick 1v1 matches and training." },
      { n: "03", title: "Lounge & hangout area", text: "To arrive, stay and linger after the match." },
      { n: "04", title: "Training, tournaments & events", text: "For beginners, ambitious players and corporate events." },
      { n: "05", title: "WiFi & co-working", text: "For short breaks between games or working on the go." },
      { n: "06", title: "Digital booking & access", text: "Booking and entry entirely via app — around the clock." },
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
          className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest rounded-2xl p-3 editorial-shadow"
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
            className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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
          <span
            role="img"
            aria-label={SITE_NAME}
            className="h-5 md:h-6 aspect-[1648/243] bg-primary block"
            style={{
              maskImage: "url('/logo.png')",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "left center",
              WebkitMaskImage: "url('/logo.png')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "left center",
            }}
          />
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

      {/* Hero — real exterior render as full-bleed background */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 min-h-[95vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/aussenansicht.jpg"
            alt={`${SITE_NAME} building exterior`}
            className="w-full h-full object-cover object-[20%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/70 to-stone-900/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,12,0.4)_0%,rgba(20,14,12,0)_65%)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* No second logo mark here — the photo already carries the brand
              (facade lettering, flags, entrance sign) and the header above
              now carries the persistent logo, so a third mark would just
              compete with both. */}
          <span className="sr-only">{SITE_NAME} – Urban Padel Club</span>

          <span className="inline-flex items-center gap-2 text-white/70 mb-8 max-w-[260px] sm:max-w-none">
            <span className="material-symbols-outlined text-sm shrink-0">location_on</span>
            <span className="font-label text-[11px] tracking-[0.3em] uppercase text-left sm:text-center">
              {t.addressPill}
            </span>
          </span>

          <div className="bg-stone-900/40 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-10 md:px-16 md:py-14 flex flex-col items-center editorial-shadow">
            <h1 className="text-5xl md:text-7xl font-headline italic leading-[1.1] tracking-tighter text-white mb-6">
              {t.headline}
            </h1>

            <span className="inline-block bg-primary text-on-primary px-4 py-1.5 rounded-full font-label text-[10px] tracking-[0.2em] uppercase mb-6">
              {t.comingSoon}
            </span>

            <p className="text-lg font-body font-light text-white mb-3 max-w-lg">
              {t.subheadline}
            </p>

            <p className="text-sm font-body font-light text-stone-300 leading-relaxed max-w-md">
              {t.description}
            </p>
          </div>

          <div className="mt-14 flex flex-col items-center gap-3 text-white/70 animate-bounce-y">
            <span className="font-label text-[10px] tracking-[0.3em] uppercase">{t.scroll}</span>
            <span className="w-px h-10 bg-white/40" />
          </div>
        </div>
      </section>

      {/* Waitlist signup — right after the hero, since capturing sign-ups
          before opening is the most important thing this page can do. */}
      <section className="px-6 md:px-12 py-20 md:py-24 bg-surface-container-lowest">
        <Reveal className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight mb-4">
            {t.formTitle}
          </h2>
          <p className="text-on-surface-variant font-light leading-relaxed max-w-md mx-auto mb-10">
            {t.formHint}
          </p>
          <WaitlistForm t={t} locale={locale} />
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

        <Reveal delayMs={100} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="rounded-xl overflow-hidden editorial-shadow">
            <img
              src="/hallenplan.jpg"
              alt={t.floorplanHeadline}
              className="w-full h-auto block"
            />
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow divide-y divide-outline-variant/20">
            {t.amenities.map((a) => (
              <div key={a.title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span className="material-symbols-outlined text-primary text-xl mt-0.5 shrink-0">
                  {a.icon}
                </span>
                <div>
                  <p className="font-body text-sm font-medium leading-snug">{a.title}</p>
                  {"text" in a && a.text && (
                    <p className="text-xs text-on-surface-variant font-light mt-0.5">{a.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-24 max-w-screen-xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="section-label justify-center inline-block">{t.featuresLabel}</span>
          <h2 className="text-3xl md:text-4xl font-headline italic tracking-tight">
            {t.featuresHeadline}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.features.map((f, i) => (
            <Reveal key={f.n} delayMs={i * 80}>
              <div className="group bg-surface-container-lowest rounded-xl p-8 editorial-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <span className="font-headline italic text-2xl text-primary mb-3 block">{f.n}</span>
                <h3 className="font-body font-medium mb-2 transition-colors duration-300 group-hover:text-primary">
                  {f.title}
                </h3>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">{f.text}</p>
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
          <img
            src="/lounge.jpg"
            alt={t.loungeHeadline}
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
        <img src="/logo.png" alt={SITE_NAME} className="h-6 w-auto mx-auto mb-4" />
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
