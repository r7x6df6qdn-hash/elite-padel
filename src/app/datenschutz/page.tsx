import Link from "next/link";
import { SITE_NAME, VENUE_ADDRESS } from "@/lib/brand";

export const metadata = {
  title: `Datenschutzerklärung | ${SITE_NAME}`,
};

const LEGAL_EMAIL = "rueckwand@gmail.com";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background px-6 md:px-12 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/coming-soon"
          className="text-on-surface-variant font-label text-xs tracking-widest uppercase hover:text-primary transition-colors mb-10 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Zurück
        </Link>

        <img src="/logo.png" alt={SITE_NAME} className="h-6 w-auto mb-10" />

        <span className="section-label">Rechtliches</span>
        <h1 className="text-4xl font-headline italic tracking-tighter mb-12">
          Datenschutzerklärung
        </h1>

        <div className="space-y-10 text-sm font-body font-light text-on-surface leading-relaxed">
          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Verantwortlicher
            </h2>
            <p>
              Elite Padel GmbH
              <br />
              {VENUE_ADDRESS.street}
              <br />
              {VENUE_ADDRESS.zip} {VENUE_ADDRESS.city}
              <br />
              {VENUE_ADDRESS.country}
              <br />
              E-Mail: {LEGAL_EMAIL}
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Hosting & Server-Logfiles
            </h2>
            <p>
              Diese Website wird bei einem externen Dienstleister (Hosting-Provider) gehostet.
              Personenbezogene Daten, die auf dieser Website erfasst werden, werden auf den
              Servern des Hosters gespeichert. Bei jedem Aufruf der Website erfasst der Server
              automatisch sogenannte Server-Logfiles, die Ihr Browser übermittelt (z. B. IP-Adresse,
              Datum und Uhrzeit der Anfrage, Browsertyp, Referrer-URL). Diese Daten dienen
              ausschließlich der technischen Bereitstellung und Absicherung der Website und werden
              nicht mit anderen Datenquellen zusammengeführt. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. f DSGVO (berechtigtes Interesse an einem sicheren und funktionsfähigen Betrieb
              der Website).
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Warteliste / Eröffnungsbenachrichtigung
            </h2>
            <p>
              Wenn Sie sich über unser Formular für die Eröffnungsbenachrichtigung eintragen,
              speichern wir Ihre E-Mail-Adresse sowie die gewählte Sprache, um Sie über den
              Eröffnungstermin und unser Opening Event zu informieren. Der Versand erfolgt über
              unseren E-Mail-Dienstleister Resend. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung). Sie können Ihre Einwilligung jederzeit formlos per E-Mail an{" "}
              {LEGAL_EMAIL} widerrufen; Ihre Daten werden dann gelöscht.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Buchung & Zahlungsabwicklung
            </h2>
            <p>
              Zur Abwicklung von Court-Buchungen verarbeiten wir Name, E-Mail-Adresse, optional
              Telefonnummer sowie die gebuchten Zeiten und Courts. Zahlungen werden über unseren
              Zahlungsdienstleister Stripe abgewickelt; Zahlungsdaten (z. B. Kartendaten) werden
              ausschließlich von Stripe verarbeitet und laufen nicht über unsere eigenen Server.
              Rechnungen werden über unseren Rechnungsdienstleister Easybill erstellt und per
              E-Mail zugestellt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
              Ab Eröffnung erfolgt die Buchung über die Plattform Playtomic; die dortige
              Datenverarbeitung unterliegt der Datenschutzerklärung von Playtomic.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Cookies
            </h2>
            <p>
              Wir setzen ausschließlich technisch notwendige Cookies ein, etwa zur Aufrechterhaltung
              der Anmeldesitzung im internen Admin-Bereich. Diese Cookies enthalten keine
              Trackingfunktion und werden nicht zu Werbe- oder Analysezwecken genutzt.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Ihre Rechte
            </h2>
            <p>
              Sie haben jederzeit das Recht auf Auskunft über Ihre bei uns gespeicherten
              personenbezogenen Daten sowie auf Berichtigung, Löschung, Einschränkung der
              Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung. Wenden Sie
              sich hierzu an {LEGAL_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Beschwerderecht
            </h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die
              Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren. Zuständig ist der
              Landesbeauftragte für den Datenschutz und die Informationsfreiheit
              Baden-Württemberg.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Änderung dieser Datenschutzerklärung
            </h2>
            <p>
              Wir passen diese Datenschutzerklärung an, sobald Änderungen an unserer
              Datenverarbeitung dies erforderlich machen, insbesondere zur Eröffnung des Clubs. Es
              gilt jeweils die aktuell auf dieser Seite veröffentlichte Fassung.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
