import Image from "next/image";
import { formatPrice } from "@/lib/constants";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import NewsletterForm from "@/components/NewsletterForm";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <div>
      {/* Hero Section: Cinematic & Immersive */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            alt="Premium Padel Court"
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale-[20%] contrast-[110%]"
            src="/hero2.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-transparent to-background" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="font-label text-xs tracking-[0.4em] uppercase text-white mb-6 block">
            {t("hero.badge")}
          </span>
          <h1 className="font-headline text-5xl md:text-8xl text-white italic leading-tight mb-10 tracking-tighter">
            {t("hero.headline")}
          </h1>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href="/booking"
              className="w-full md:w-auto bg-primary text-on-primary px-10 py-5 rounded-lg font-label text-sm tracking-widest uppercase editorial-shadow transition-all hover:scale-[1.02]"
            >
              {t("hero.bookCourt")}
            </Link>
            <a
              href="#courts"
              className="w-full md:w-auto bg-stone-900/50 backdrop-blur-md text-white border border-white/40 px-10 py-5 rounded-lg font-label text-sm tracking-widest uppercase transition-all hover:bg-stone-900/70"
            >
              {t("hero.exploreClub")}
            </a>
          </div>
        </div>
        <div className="absolute bottom-12 left-12 hidden md:block">
          <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase max-w-[220px] leading-relaxed">
            {t("hero.tagline")}
          </p>
        </div>
      </section>

      {/* Brief Intro & Social Proof */}
      <section className="py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <span className="font-label text-xs tracking-[0.3em] uppercase text-primary mb-6 block">
              {t("intro.label")}
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight italic">
              {t("intro.headline")}
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 space-y-8">
            <p className="font-body text-lg text-on-surface-variant leading-relaxed font-light">
              {t("intro.text")}
            </p>
            <div className="flex items-center gap-12 pt-8">
              <div>
                <span className="block font-headline text-3xl italic">4</span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {t("intro.stats.courts")}
                </span>
              </div>
              <div>
                <span className="block font-headline text-3xl italic">
                  8&ndash;24h
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {t("intro.stats.hours")}
                </span>
              </div>
              <div>
                <span className="block font-headline text-3xl italic">
                  7/7
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {t("intro.stats.days")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courts Section */}
      <section id="courts" className="pb-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-headline text-4xl italic">
              {t("courts.title")}
            </h2>
            <div className="h-px flex-grow mx-8 bg-outline-variant/30" />
            <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
              {t("courts.subtitle")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Doppel Courts Card (Large) */}
            <div className="md:col-span-7 group relative overflow-hidden rounded-xl bg-surface-container-low p-12 flex flex-col justify-between min-h-[450px]">
              <div className="relative z-10">
                <span className="font-label text-xs tracking-widest uppercase text-secondary mb-2 block">
                  {t("courts.double.available")}
                </span>
                <h3 className="font-headline text-5xl mb-6">
                  {t("courts.double.title")}
                </h3>
                <ul className="space-y-3 font-body text-sm text-on-surface-variant mb-8">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                    {t("courts.double.feature1")}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                    {t("courts.double.feature2")}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                    {t("courts.double.feature3")}
                  </li>
                </ul>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <span className="font-body text-4xl font-light">
                    {t("courts.double.priceFrom")} {formatPrice(38)}
                  </span>
                  <span className="font-label text-xs tracking-widest uppercase ml-2 text-on-surface-variant">
                    {t("courts.double.perHour")}
                  </span>
                </div>
                <Link
                  href="/booking"
                  className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
                >
                  {t("courts.double.bookNow")}
                </Link>
              </div>
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                <Image
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover"
                  src="/cinematic.png"
                  alt=""
                />
              </div>
            </div>

            {/* Einzel Court Card (Small) */}
            <div className="md:col-span-5 group relative overflow-hidden rounded-xl bg-surface-container-highest p-12 flex flex-col justify-between min-h-[450px]">
              <div className="relative z-10">
                <span className="font-label text-xs tracking-widest uppercase text-primary mb-2 block">
                  {t("courts.single.available")}
                </span>
                <h3 className="font-headline text-5xl mb-6">
                  {t("courts.single.title")}
                </h3>
                <p className="font-body text-sm text-on-surface-variant mb-8 leading-relaxed">
                  {t("courts.single.description")}
                </p>
              </div>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-baseline">
                  <span className="font-body text-4xl font-light">
                    {t("courts.single.priceFrom")} {formatPrice(24)}
                  </span>
                  <span className="font-label text-xs tracking-widest uppercase ml-2 text-on-surface-variant">
                    {t("courts.single.perHour")}
                  </span>
                </div>
                <Link
                  href="/booking"
                  className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity w-full text-center"
                >
                  {t("courts.single.bookNow")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Featured Sections */}
      <section className="pb-32 px-6 md:px-12 bg-surface overflow-hidden">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:h-[900px]">
          {/* Courts Card (Large) */}
          <div className="min-h-[420px] md:min-h-0 md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group">
            <Image
              alt="Courts"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              src="/hero.png"
            />
            <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/20 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] mb-2 block">
                {t("bento.courts.label")}
              </span>
              <h3 className="font-headline text-4xl italic mb-4">
                {t("bento.courts.title")}
              </h3>
              <p className="font-body text-sm font-light max-w-xs opacity-80 mb-6">
                {t("bento.courts.description")}
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest border-b border-white/40 pb-1"
              >
                {t("bento.courts.link")}
              </Link>
            </div>
          </div>

          {/* Lounge Card */}
          <div
            id="community"
            className="scroll-mt-24 min-h-[280px] md:min-h-0 md:col-span-2 md:row-span-1 relative rounded-xl overflow-hidden group"
          >
            <Image
              alt="Lounge"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              src="/lounge.jpg"
            />
            <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-stone-900/30 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] mb-2 block">
                {t("bento.lounge.label")}
              </span>
              <h3 className="font-headline text-3xl italic mb-4">
                {t("bento.lounge.title")}
              </h3>
              <span className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest border-b border-white/40 pb-1">
                {t("bento.lounge.link")}
              </span>
            </div>
          </div>

          {/* Bistro Card */}
          <div className="min-h-[220px] md:min-h-0 md:col-span-1 md:row-span-1 relative rounded-xl overflow-hidden group">
            <Image
              alt="Bistro"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              src="/bistro.png"
            />
            <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="font-headline text-2xl italic mb-2">
                {t("bento.bistro.title")}
              </h3>
              <span className="font-label text-[10px] uppercase tracking-widest border-b border-white/40 self-start">
                {t("bento.bistro.link")}
              </span>
            </div>
          </div>

          {/* Academy Card */}
          <div
            id="training"
            className="scroll-mt-24 min-h-[220px] md:min-h-0 md:col-span-1 md:row-span-1 relative rounded-xl overflow-hidden group"
          >
            <Image
              alt="Training"
              fill
              sizes="(min-width: 768px) 25vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              src="/cinematic.png"
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply group-hover:bg-primary/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="font-headline text-2xl italic mb-2">
                {t("bento.training.title")}
              </h3>
              <span className="font-label text-[10px] uppercase tracking-widest border-b border-white/40 self-start">
                {t("bento.training.link")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-screen-md mx-auto px-6 md:px-12 text-center">
          <span className="font-label text-xs tracking-[0.4em] uppercase text-primary mb-6 block">
            {t("newsletter.badge")}
          </span>
          <h2 className="font-headline text-4xl md:text-5xl italic mb-8">
            {t("newsletter.headline")}
          </h2>
          <p className="font-body text-on-surface-variant mb-12 font-light text-lg leading-relaxed">
            {t("newsletter.description")}
          </p>
          <NewsletterForm
            variant="hero"
            placeholder={t("newsletter.emailPlaceholder")}
            buttonLabel={t("newsletter.button")}
          />
          <p className="font-body text-xs text-on-surface-variant/60 mt-4">
            {t("newsletter.disclaimer")}
          </p>
        </div>
      </section>
    </div>
  );
}
