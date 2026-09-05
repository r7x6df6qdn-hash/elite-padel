import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing, Link } from "@/i18n/routing";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NewsletterForm from "@/components/NewsletterForm";
import { SITE_URL } from "@/lib/brand";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "de" ? SITE_URL : `${SITE_URL}/${locale}`,
      languages: {
        de: SITE_URL,
        en: `${SITE_URL}/en`,
        "x-default": SITE_URL,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "de" | "en")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "nav" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* Correct <html lang> for the active locale. Root layout defaults to
          lang="de" because it must contain <html> statically (Next.js
          requirement) and has no access to the URL. Non-JS crawlers get the
          right signal via hreflang + sitemap; JS-enabled clients (incl.
          Googlebot) see the updated attribute on first paint. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)};`,
        }}
      />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl">
        <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-screen-2xl mx-auto">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
            >
              {t("home")}
            </Link>
            <Link
              href="/booking"
              className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
            >
              {t("booking")}
            </Link>
          </div>

          {/* Centered Brand */}
          <Link href="/" className="block">
            <img src="/logo.png" alt="Rückwand" className="h-6 md:h-7 w-auto" />
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#training"
                className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
              >
                {t("training")}
              </Link>
              <Link
                href="/#community"
                className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
              >
                {t("community")}
              </Link>
            </div>
            <LanguageSwitcher />
            <Link href="/booking" className="btn-primary hidden md:inline-flex">
              {t("bookNow")}
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-stone-100 w-full py-20 px-6 md:px-12 border-t border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end max-w-screen-2xl mx-auto">
          <div className="space-y-12">
            <div>
              <img src="/logo.png" alt="Rückwand" className="h-7 w-auto" />
            </div>
            <div className="space-y-4">
              <p className="text-stone-500 font-body text-sm font-light tracking-wide max-w-xs leading-relaxed">
                {tFooter("tagline")}
                <br />
                {tFooter("courts")}
              </p>
              <p className="text-stone-500 font-body text-sm font-light tracking-wide">
                {tFooter("email")}
              </p>
            </div>
            <div className="flex gap-10">
              <a
                href="https://www.instagram.com/rueckwand.club/"
                target="_blank"
                rel="noopener"
                className="text-stone-400 hover:text-primary transition-colors font-label text-[10px] tracking-widest uppercase"
              >
                {tFooter("instagram")}
              </a>
              <span className="text-stone-400 font-label text-[10px] tracking-widest uppercase cursor-default">
                {tFooter("concierge")}
              </span>
            </div>
          </div>
          <div className="flex flex-col md:items-end space-y-12">
            <div className="flex flex-wrap md:justify-end gap-x-12 gap-y-6">
              <a
                href="/datenschutz"
                className="text-stone-500 hover:text-stone-900 font-light text-sm tracking-wide transition-all hover:-translate-y-0.5"
              >
                {tFooter("privacy")}
              </a>
              <span className="text-stone-400 font-light text-sm tracking-wide cursor-default">
                {tFooter("terms")}
              </span>
              <a
                href="/impressum"
                className="text-stone-500 hover:text-stone-900 font-light text-sm tracking-wide transition-all hover:-translate-y-0.5"
              >
                {tFooter("imprint")}
              </a>
            </div>
            <div className="w-full max-w-sm">
              <p className="text-[10px] text-stone-400 mb-4 uppercase font-label tracking-widest">
                {tFooter("newsletter")}
              </p>
              <NewsletterForm
                variant="footer"
                placeholder={tFooter("emailPlaceholder")}
                buttonLabel={tFooter("newsletter")}
              />
            </div>
            <div className="text-stone-400 font-label text-[10px] tracking-[0.3em] uppercase">
              {tFooter("copyright", { year: new Date().getFullYear() })}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile FAB */}
      <div className="fixed bottom-8 right-8 z-50 md:hidden">
        <Link
          href="/booking"
          className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center editorial-shadow transition-transform active:scale-95"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            calendar_today
          </span>
        </Link>
      </div>
    </NextIntlClientProvider>
  );
}
