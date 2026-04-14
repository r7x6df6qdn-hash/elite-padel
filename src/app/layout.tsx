import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELITE PADEL | The Editorial Athlete",
  description:
    "Buche deinen Padel Court online. 4 Doppel Courts und 2 Einzel Courts. Eine kuratierte Umgebung für moderne Padel-Exzellenz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* TopNavBar */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl">
          <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-screen-2xl mx-auto">
            {/* Left Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
              >
                Home
              </a>
              <a
                href="/booking"
                className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
              >
                Booking
              </a>
            </div>

            {/* Centered Brand */}
            <a
              href="/"
              className="text-2xl font-headline italic tracking-tighter text-stone-900"
            >
              ELITE PADEL
            </a>

            {/* Right Navigation */}
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#"
                  className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
                >
                  Training
                </a>
                <a
                  href="#"
                  className="text-stone-600 hover:text-stone-900 transition-colors font-label text-xs tracking-widest uppercase"
                >
                  Community
                </a>
              </div>
              <a href="/booking" className="btn-primary">
                Book Now
              </a>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-stone-100 w-full py-20 px-6 md:px-12 border-t border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end max-w-screen-2xl mx-auto">
            <div className="space-y-12">
              <div className="text-lg font-headline italic text-stone-900">
                ELITE PADEL CLUB
              </div>
              <div className="space-y-4">
                <p className="text-stone-500 font-body text-sm font-light tracking-wide max-w-xs leading-relaxed">
                  Dein Premium Padel Center.
                  <br />
                  4 Doppel Courts &amp; 2 Einzel Courts.
                </p>
                <p className="text-stone-500 font-body text-sm font-light tracking-wide">
                  concierge@elitepadel.club
                </p>
              </div>
              <div className="flex gap-10">
                <a
                  href="#"
                  className="text-stone-400 hover:text-primary transition-colors font-label text-[10px] tracking-widest uppercase"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-stone-400 hover:text-primary transition-colors font-label text-[10px] tracking-widest uppercase"
                >
                  Concierge Portal
                </a>
              </div>
            </div>
            <div className="flex flex-col md:items-end space-y-12">
              <div className="flex flex-wrap md:justify-end gap-x-12 gap-y-6">
                <a
                  href="#"
                  className="text-stone-500 hover:text-stone-900 font-light text-sm tracking-wide transition-all hover:-translate-y-0.5"
                >
                  Datenschutz
                </a>
                <a
                  href="#"
                  className="text-stone-500 hover:text-stone-900 font-light text-sm tracking-wide transition-all hover:-translate-y-0.5"
                >
                  AGB
                </a>
                <a
                  href="#"
                  className="text-stone-500 hover:text-stone-900 font-light text-sm tracking-wide transition-all hover:-translate-y-0.5"
                >
                  Impressum
                </a>
              </div>
              <div className="w-full max-w-sm">
                <p className="text-[10px] text-stone-400 mb-4 uppercase font-label tracking-widest">
                  Newsletter
                </p>
                <div className="flex gap-2">
                  <input
                    className="bg-white border border-stone-200 rounded-lg text-xs w-full p-4 focus:ring-1 focus:ring-primary outline-none"
                    placeholder="E-Mail Adresse"
                    type="email"
                  />
                  <button className="bg-stone-900 text-white px-6 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      north_east
                    </span>
                  </button>
                </div>
              </div>
              <div className="text-stone-400 font-label text-[10px] tracking-[0.3em] uppercase">
                &copy; {new Date().getFullYear()} ELITE PADEL CLUB. THE
                EDITORIAL ATHLETE.
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile FAB */}
        <div className="fixed bottom-8 right-8 z-50 md:hidden">
          <a
            href="/booking"
            className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center editorial-shadow transition-transform active:scale-95"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_today
            </span>
          </a>
        </div>
      </body>
    </html>
  );
}
