import Link from "next/link";
import { SITE_NAME, VENUE_ADDRESS } from "@/lib/brand";

export const metadata = {
  title: `Impressum | ${SITE_NAME}`,
};

const LEGAL_EMAIL = "rueckwand@gmail.com";

export default function ImpressumPage() {
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
        <h1 className="text-4xl font-headline italic tracking-tighter mb-12">Impressum</h1>

        <div className="space-y-10 text-sm font-body font-light text-on-surface leading-relaxed">
          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              Elite Padel GmbH
              <br />
              {VENUE_ADDRESS.street}
              <br />
              {VENUE_ADDRESS.zip} {VENUE_ADDRESS.city}
              <br />
              {VENUE_ADDRESS.country}
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Vertreten durch
            </h2>
            <p>Lovis Löhn</p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Kontakt
            </h2>
            <p>E-Mail: {LEGAL_EMAIL}</p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p>
              Lovis Löhn
              <br />
              {VENUE_ADDRESS.street}
              <br />
              {VENUE_ADDRESS.zip} {VENUE_ADDRESS.city}
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              EU-Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit, abrufbar unter{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener"
                className="underline hover:text-primary"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Verbraucherstreitbeilegung
            </h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen
              Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
              als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
              Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant mb-3">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung
              und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
