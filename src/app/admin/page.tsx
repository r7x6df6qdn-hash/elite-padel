"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "bookings" | "customers">("overview");
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");

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

  const uniqueCustomers = Object.values(
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
          };
        }
        acc[b.customerEmail].bookings++;
        acc[b.customerEmail].totalSpent += b.totalPrice;
        return acc;
      }, {} as Record<string, { name: string; email: string; phone: string | null; bookings: number; totalSpent: number }>)
  );

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
          {(["overview", "bookings", "customers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-md font-label text-[10px] tracking-widest uppercase transition-all ${
                tab === t
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t === "overview" ? "Übersicht" : t === "bookings" ? "Buchungen" : "Kunden"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-8">
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

            {/* Recent Bookings */}
            <div>
              <h2 className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-4">
                Letzte Buchungen
              </h2>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Datum</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Court</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Kunde</th>
                      <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Status</th>
                      <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Preis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings.slice(0, 10).map((b) => (
                      <tr key={b.id} className="border-b border-outline-variant/30 last:border-0">
                        <td className="p-4 text-sm">{formatDate(b.date)}</td>
                        <td className="p-4 text-sm">{b.court.name}</td>
                        <td className="p-4 text-sm">{b.customerName}</td>
                        <td className="p-4"><StatusBadge status={b.status} /></td>
                        <td className="p-4 text-sm text-right">{formatPrice(b.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Name</th>
                  <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">E-Mail</th>
                  <th className="text-left text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Telefon</th>
                  <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Buchungen</th>
                  <th className="text-right text-[10px] font-label uppercase tracking-widest text-on-surface-variant p-4">Umsatz</th>
                </tr>
              </thead>
              <tbody>
                {uniqueCustomers.map((c) => (
                  <tr key={c.email} className="border-b border-outline-variant/30 last:border-0">
                    <td className="p-4 text-sm font-medium">{c.name}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{c.email}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{c.phone || "–"}</td>
                    <td className="p-4 text-sm text-right">{c.bookings}</td>
                    <td className="p-4 text-sm text-right font-medium">{formatPrice(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {uniqueCustomers.length === 0 && (
              <p className="text-on-surface-variant text-sm p-8 text-center">Noch keine Kunden</p>
            )}
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
