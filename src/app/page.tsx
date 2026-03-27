import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import { COURT_TYPES } from "@/lib/constants";

async function getCourts() {
  return prisma.court.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export default async function HomePage() {
  const courts = await getCourts();

  return (
    <div>
      {/* Hero Section: Cinematic & Immersive */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Premium Padel Court"
            className="w-full h-full object-cover grayscale-[20%] contrast-[110%]"
            src="/hero.png"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-transparent to-background" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="font-label text-xs tracking-[0.4em] uppercase text-white mb-6 block">
            The Editorial Athlete
          </span>
          <h1 className="font-headline text-5xl md:text-8xl text-white italic leading-tight mb-10 tracking-tighter">
            A Ritual of <br /> Movement &amp; Stone
          </h1>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <a
              href="/booking"
              className="w-full md:w-auto bg-primary text-on-primary px-10 py-5 rounded-lg font-label text-sm tracking-widest uppercase editorial-shadow transition-all hover:scale-[1.02]"
            >
              Secure Your Court
            </a>
            <a
              href="#courts"
              className="w-full md:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-lg font-label text-sm tracking-widest uppercase transition-all hover:bg-white/20"
            >
              Explore Courts
            </a>
          </div>
        </div>
        <div className="absolute bottom-12 left-12 hidden md:block">
          <p className="font-label text-[10px] tracking-widest text-white/60 uppercase max-w-[200px] leading-relaxed">
            Designed for the discerning competitor. A curated environment for
            modern padel excellence.
          </p>
        </div>
      </section>

      {/* Brief Intro & Social Proof */}
      <section className="py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight italic">
              The intersection of refined lifestyle and athletic precision.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 space-y-8">
            <p className="font-body text-lg text-on-surface-variant leading-relaxed font-light">
              Elite Padel Club ist mehr als eine Anlage &mdash; es ist ein
              Zufluchtsort für alle, die Sport als Kunstform betrachten. Von
              unseren 6 Courts bis zu unserem Buchungssystem ist jedes Detail
              darauf ausgelegt, dein Spiel und dein Wohlbefinden zu steigern.
            </p>
            <div className="flex items-center gap-12 pt-8">
              <div>
                <span className="block font-headline text-3xl italic">6</span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Premium Courts
                </span>
              </div>
              <div>
                <span className="block font-headline text-3xl italic">
                  8&ndash;24h
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Geöffnet
                </span>
              </div>
              <div>
                <span className="block font-headline text-3xl italic">
                  7/7
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Tage / Woche
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
            <h2 className="font-headline text-4xl italic">Court Rental</h2>
            <div className="h-px flex-grow mx-8 bg-outline-variant/30" />
            <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant">
              Doppel &amp; Einzel Courts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Doppel Courts Card (Large) */}
            <div className="md:col-span-7 group relative overflow-hidden rounded-xl bg-surface-container-low p-12 flex flex-col justify-between min-h-[450px]">
              <div className="relative z-10">
                <span className="font-label text-xs tracking-widest uppercase text-secondary mb-2 block">
                  4 Courts verfügbar
                </span>
                <h3 className="font-headline text-5xl mb-6">Doppel Courts</h3>
                <ul className="space-y-3 font-body text-sm text-on-surface-variant mb-8">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                    Extra-große Courts für bis zu 8 Spieler
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                    Professionelle Beleuchtung
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                    Öffnungszeiten 08:00 &ndash; 24:00 Uhr
                  </li>
                </ul>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <span className="font-body text-4xl font-light">
                    ab {formatPrice(38)}
                  </span>
                  <span className="font-label text-xs tracking-widest uppercase ml-2 text-on-surface-variant">
                    / Stunde
                  </span>
                </div>
                <a
                  href="/booking"
                  className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
                >
                  Book Now
                </a>
              </div>
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                <img
                  className="w-full h-full object-cover"
                  src="/cinematic.png"
                  alt="Court background"
                />
              </div>
            </div>

            {/* Einzel Courts Card (Small) */}
            <div className="md:col-span-5 group relative overflow-hidden rounded-xl bg-surface-container-highest p-12 flex flex-col justify-between min-h-[450px]">
              <div className="relative z-10">
                <span className="font-label text-xs tracking-widest uppercase text-primary mb-2 block">
                  2 Courts verfügbar
                </span>
                <h3 className="font-headline text-5xl mb-6">Einzel Courts</h3>
                <p className="font-body text-sm text-on-surface-variant mb-8 leading-relaxed">
                  Perfekt für 4 Spieler. Kompakte Courts mit
                  erstklassiger Ausstattung.
                </p>
              </div>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-baseline">
                  <span className="font-body text-4xl font-light">
                    ab {formatPrice(24)}
                  </span>
                  <span className="font-label text-xs tracking-widest uppercase ml-2 text-on-surface-variant">
                    / Stunde
                  </span>
                </div>
                <a
                  href="/booking"
                  className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity w-full text-center"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Featured Sections */}
      <section className="pb-32 px-6 md:px-12 bg-surface overflow-hidden">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[900px]">
          {/* Courts Card (Large) */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group">
            <img
              alt="Courts"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="/hero.png"
            />
            <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/20 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] mb-2 block">
                Architecture
              </span>
              <h3 className="font-headline text-4xl italic mb-4">The Courts</h3>
              <p className="font-body text-sm font-light max-w-xs opacity-80 mb-6">
                World-class playing surfaces framed by minimalist aesthetics.
              </p>
              <a
                href="/booking"
                className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest border-b border-white/40 pb-1"
              >
                Explore Spaces
              </a>
            </div>
          </div>

          {/* Gym Card */}
          <div className="md:col-span-2 md:row-span-1 relative rounded-xl overflow-hidden group">
            <img
              alt="Gym"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="/cinematic.png"
            />
            <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-stone-900/30 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] mb-2 block">
                Performance
              </span>
              <h3 className="font-headline text-3xl italic mb-4">
                Gym &amp; Fitness
              </h3>
              <a
                href="#"
                className="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest border-b border-white/40 pb-1"
              >
                Explore Gym
              </a>
            </div>
          </div>

          {/* Bistro Card */}
          <div className="md:col-span-1 md:row-span-1 relative rounded-xl overflow-hidden group">
            <img
              alt="Bistro"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="/bistro.png"
            />
            <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="font-headline text-2xl italic mb-2">The Bistro</h3>
              <span className="font-label text-[10px] uppercase tracking-widest border-b border-white/40 self-start">
                Menu
              </span>
            </div>
          </div>

          {/* Academy Card */}
          <div className="md:col-span-1 md:row-span-1 relative rounded-xl overflow-hidden group">
            <img
              alt="Training"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="/hero.png"
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply group-hover:bg-primary/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <h3 className="font-headline text-2xl italic mb-2">Training</h3>
              <span className="font-label text-[10px] uppercase tracking-widest border-b border-white/40 self-start">
                Book Pro
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-screen-md mx-auto px-6 md:px-12 text-center">
          <span className="font-label text-xs tracking-[0.4em] uppercase text-primary mb-6 block">
            Join the Circle
          </span>
          <h2 className="font-headline text-4xl italic mb-8">
            The Editorial Athlete Newsletter
          </h2>
          <p className="font-body text-on-surface-variant mb-12 font-light">
            Kuratierte Einblicke in Turniere, Saisonale Events und exklusive
            Court-Angebote.
          </p>
          <form className="flex flex-col md:flex-row gap-4">
            <input
              className="flex-grow bg-surface-container-lowest border-none px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-stone-400 font-label text-sm"
              placeholder="Deine E-Mail Adresse"
              type="email"
            />
            <button className="bg-primary text-on-primary px-10 py-4 rounded-lg font-label text-xs tracking-widest uppercase transition-all hover:bg-primary-container">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
