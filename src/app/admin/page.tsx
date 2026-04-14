"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type Booking = {
  id: string;
  courtId: string;
  date: string;
  startTime: number;
  endTime: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalPrice: number;
  status: string;
  accessCode: string | null;
  createdAt: string;
  court: { name: string; type: string };
};

type DashboardData = {
  stats: {
    totalBookings: number;
    todayBookings: number;
    monthRevenue: number;
    totalRevenue: number;
    uniqueCustomers: number;
    todayAccessCode: string;
  };
  bookings: Booking[];
  todaySchedule: Booking[];
};

function formatTime(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLocalDate(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "bookings" | "customers">("dashboard");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [chartRange, setChartRange] = useState<"7" | "30">("7");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/dashboard");
    if (res.ok) {
      setData(await res.json());
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuthenticated(true);
      fetchDashboard();
    } else {
      setError("Falsches Passwort");
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchDashboard();
  };

  // Chart data
  const chartData = useMemo(() => {
    if (!data) return { labels: [], revenue: [], bookings: [] };
    const days = parseInt(chartRange);
    const confirmed = data.bookings.filter((b) => b.status === "confirmed");

    const labels: string[] = [];
    const revenue: number[] = [];
    const bookingCounts: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const dateStr = getLocalDate(d);
      const dayBookings = confirmed.filter((b) => {
        const bDate = new Date(b.date);
        return getLocalDate(bDate) === dateStr;
      });
      labels.push(d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }));
      revenue.push(dayBookings.reduce((sum, b) => sum + b.totalPrice, 0));
      bookingCounts.push(dayBookings.length);
    }

    return { labels, revenue, bookings: bookingCounts };
  }, [data, chartRange]);

  // Customer data with search
  const uniqueCustomers = useMemo(() => {
    if (!data) return [];
    const customers = Object.values(
      data.bookings
        .filter((b) => b.status === "confirmed")
        .reduce((acc, b) => {
          if (!acc[b.customerEmail]) {
            acc[b.customerEmail] = {
              name: b.customerName,
              email: b.customerEmail,
              phone: b.customerPhone,
              bookings: 0,
              totalSpent: 0,
              lastBooking: b.createdAt,
            };
          }
          acc[b.customerEmail].bookings++;
          acc[b.customerEmail].totalSpent += b.totalPrice;
          if (b.createdAt > acc[b.customerEmail].lastBooking) {
            acc[b.customerEmail].lastBooking = b.createdAt;
          }
          return acc;
        }, {} as Record<string, { name: string; email: string; phone: string | null; bookings: number; totalSpent: number; lastBooking: string }>)
    );

    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }, [data, customerSearch]);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-headline italic text-on-surface tracking-tight">ELITE PADEL</h1>
            <p className="text-on-surface-variant font-label text-[10px] tracking-[0.3em] uppercase mt-2">Admin Console</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant block mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-error text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-label text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const filteredBookings = data.bookings.filter(
    (b) => filter === "all" || b.status === filter
  );

  const maxRevenue = Math.max(...chartData.revenue, 1);
  const maxBookings = Math.max(...chartData.bookings, 1);
  const totalChartRevenue = chartData.revenue.reduce((a, b) => a + b, 0);
  const totalChartBookings = chartData.bookings.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-headline italic text-on-surface">ELITE PADEL</h1>
            <span className="text-[10px] font-label tracking-[0.2em] uppercase text-on-surface-variant bg-surface-container px-3 py-1 rounded">Admin</span>
          </div>
          <a href="/" className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant hover:text-on-surface transition-colors">
            Zur Website →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Buchungen Heute" value={data.stats.todayBookings.toString()} />
          <StatCard label="Buchungen Gesamt" value={data.stats.totalBookings.toString()} />
          <StatCard label="Umsatz Monat" value={formatPrice(data.stats.monthRevenue)} />
          <StatCard label="Umsatz Gesamt" value={formatPrice(data.stats.totalRevenue)} />
          <StatCard label="Kunden" value={data.stats.uniqueCustomers.toString()} />
          <StatCard label="Zugangscode Heute" value={data.stats.todayAccessCode} highlight />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container-high rounded-lg p-1 mb-8 w-fit">
          {(["dashboard", "bookings", "customers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-md font-label text-[10px] tracking-widest uppercase transition-all ${
                tab === t
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t === "dashboard" ? "Dashboard" : t === "bookings" ? "Buchungen" : "Kunden"}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="space-y-8">
            {/* Chart Range Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                Umsatz & Buchungen
              </h2>
              <div className="flex gap-1 bg-surface-container-high rounded-lg p-1">
                {(["7", "30"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-4 py-1.5 rounded-md font-label text-[10px] tracking-widest uppercase transition-all ${
                      chartRange === r
                        ? "bg-surface-container-lowest text-on-surface shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {r === "7" ? "7 Tage" : "30 Tage"}
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Umsatz</p>
                    <p className="text-2xl font-headline font-bold text-on-surface mt-1">{formatPrice(totalChartRevenue)}</p>
                  </div>
                  <span className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant">
                    Letzte {chartRange} Tage
                  </span>
                </div>
                <div className="flex items-end gap-1 h-40">
                  {chartData.revenue.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-8 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {chartData.labels[i]}: {formatPrice(val)}
                      </div>
                      <div
                        className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors min-h-[2px]"
                        style={{ height: `${Math.max((val / maxRevenue) * 100, 1.5)}%` }}
                      />
                      {chartRange === "7" && (
                        <span className="text-[9px] text-on-surface-variant">{chartData.labels[i]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bookings Chart */}
              <div className="bg-surface-container-lowest rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Buchungen</p>
                    <p className="text-2xl font-headline font-bold text-on-surface mt-1">{totalChartBookings}</p>
                  </div>
                  <span className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant">
                    Letzte {chartRange} Tage
                  </span>
                </div>
                <div className="flex items-end gap-1 h-40">
                  {chartData.bookings.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-8 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {chartData.labels[i]}: {val} Buchung{val !== 1 ? "en" : ""}
                      </div>
                      <div
                        className="w-full bg-secondary/80 rounded-t hover:bg-secondary transition-colors min-h-[2px]"
                        style={{ height: `${Math.max((val / maxBookings) * 100, 1.5)}%` }}
                      />
                      {chartRange === "7" && (
                        <span className="text-[9px] text-on-surface-variant">{chartData.labels[i]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Court Breakdown */}
            <div className="bg-surface-container-lowest rounded-xl p-6">
              <h3 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
                Auslastung pro Court
              </h3>
              <div className="space-y-3">
                {(() => {
                  const days = parseInt(chartRange);
                  const cutoff = daysAgo(days);
                  const confirmed = data.bookings.filter(
                    (b) => b.status === "confirmed" && new Date(b.date) >= cutoff
                  );
                  const courts = [...new Set(confirmed.map((b) => b.court.name))];
                  const courtData = courts.map((name) => {
                    const cb = confirmed.filter((b) => b.court.name === name);
                    return { name, bookings: cb.length, revenue: cb.reduce((s, b) => s + b.totalPrice, 0) };
                  }).sort((a, b) => b.revenue - a.revenue);
                  const maxCourtRevenue = Math.max(...courtData.map((c) => c.revenue), 1);

                  if (courtData.length === 0) {
                    return <p className="text-on-surface-variant text-sm text-center py-4">Keine Daten für diesen Zeitraum</p>;
                  }

                  return courtData.map((c) => (
                    <div key={c.name} className="flex items-center gap-4">
                      <span className="text-sm w-32 shrink-0">{c.name}</span>
                      <div className="flex-1 bg-surface-container-high rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full flex items-center px-3"
                          style={{ width: `${Math.max((c.revenue / maxCourtRevenue) * 100, 8)}%` }}
                        >
                          <span className="text-[10px] text-on-primary font-label whitespace-nowrap">
                            {c.bookings}× · {formatPrice(c.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Today's Schedule */}
            <div>
              <h2 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
                Heutige Buchungen
              </h2>
              {data.todaySchedule.length === 0 ? (
                <p className="text-on-surface-variant text-sm bg-surface-container-lowest rounded-xl p-8 text-center">
                  Keine Buchungen für heute
                </p>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Zeit</th>
                        <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Court</th>
                        <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Kunde</th>
                        <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Preis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.todaySchedule.map((b) => (
                        <tr key={b.id} className="border-b border-outline-variant/30 last:border-0">
                          <td className="p-4 font-mono text-sm">{formatTime(b.startTime)} – {formatTime(b.endTime)}</td>
                          <td className="p-4 text-sm">{b.court.name}</td>
                          <td className="p-4 text-sm">{b.customerName}</td>
                          <td className="p-4 text-sm text-right">{formatPrice(b.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div>
            <div className="flex gap-2 mb-6">
              {(["all", "confirmed", "pending", "cancelled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md font-label text-[10px] tracking-widest uppercase transition-all ${
                    filter === f
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {f === "all" ? "Alle" : f === "confirmed" ? "Bestätigt" : f === "pending" ? "Ausstehend" : "Storniert"}
                  <span className="ml-1 opacity-70">
                    ({data.bookings.filter((b) => f === "all" || b.status === f).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Datum</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Zeit</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Court</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Kunde</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">E-Mail</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Status</th>
                      <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Preis</th>
                      <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low/50">
                        <td className="p-4 text-sm whitespace-nowrap">{formatDateLong(b.date)}</td>
                        <td className="p-4 font-mono text-sm whitespace-nowrap">{formatTime(b.startTime)}–{formatTime(b.endTime)}</td>
                        <td className="p-4 text-sm">{b.court.name}</td>
                        <td className="p-4 text-sm">{b.customerName}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{b.customerEmail}</td>
                        <td className="p-4"><StatusBadge status={b.status} /></td>
                        <td className="p-4 text-sm text-right font-medium">{formatPrice(b.totalPrice)}</td>
                        <td className="p-4 text-right">
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                              className="text-[10px] font-label tracking-widest uppercase text-error hover:underline"
                            >
                              Stornieren
                            </button>
                          )}
                          {b.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleStatusChange(b.id, "confirmed")}
                                className="text-[10px] font-label tracking-widest uppercase text-secondary hover:underline"
                              >
                                Bestätigen
                              </button>
                              <button
                                onClick={() => handleStatusChange(b.id, "cancelled")}
                                className="text-[10px] font-label tracking-widest uppercase text-error hover:underline"
                              >
                                Stornieren
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBookings.length === 0 && (
                <p className="text-on-surface-variant text-sm p-8 text-center">Keine Buchungen gefunden</p>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {tab === "customers" && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Suche nach Name, E-Mail oder Telefon..."
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
                />
                {customerSearch && (
                  <button
                    onClick={() => setCustomerSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant mt-2">
                {uniqueCustomers.length} Kunde{uniqueCustomers.length !== 1 ? "n" : ""} gefunden
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Name</th>
                    <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">E-Mail</th>
                    <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Telefon</th>
                    <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Buchungen</th>
                    <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Umsatz</th>
                    <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Letzte Buchung</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueCustomers.map((c) => (
                    <tr key={c.email} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low/50">
                      <td className="p-4 text-sm font-medium">{c.name}</td>
                      <td className="p-4 text-sm text-on-surface-variant">{c.email}</td>
                      <td className="p-4 text-sm text-on-surface-variant">{c.phone || "–"}</td>
                      <td className="p-4 text-sm text-right">{c.bookings}</td>
                      <td className="p-4 text-sm text-right font-medium">{formatPrice(c.totalSpent)}</td>
                      <td className="p-4 text-sm text-right text-on-surface-variant">{formatDate(c.lastBooking)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uniqueCustomers.length === 0 && (
                <p className="text-on-surface-variant text-sm p-8 text-center">
                  {customerSearch ? "Keine Kunden gefunden" : "Noch keine Kunden"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-5 ${highlight ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>
      <p className={`text-[10px] font-label uppercase tracking-widest mb-2 ${highlight ? "opacity-80" : "text-on-surface-variant"}`}>
        {label}
      </p>
      <p className={`text-xl font-headline font-bold ${highlight ? "" : "text-on-surface"}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    confirmed: "bg-secondary-container text-secondary",
    pending: "bg-tertiary-fixed text-tertiary",
    cancelled: "bg-error-container text-on-error-container",
  };
  const labels = {
    confirmed: "Bestätigt",
    pending: "Ausstehend",
    cancelled: "Storniert",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded text-[10px] font-label tracking-widest uppercase ${styles[status as keyof typeof styles] || ""}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
