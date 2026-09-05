"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter } from "@/i18n/routing";
import { formatTime, formatPrice, COURT_TYPES, getPriceForHour } from "@/lib/constants";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { validateEmail, type EmailValidationResult } from "@/lib/email-validation";
import {
  STUDENT_DISCOUNT_PERCENT,
  applyStudentDiscount,
  isBookingDiscountEligible,
} from "@/lib/student-discount";

interface CheckoutItem {
  courtId: string;
  courtName: string;
  courtType: string;
  startTime: number;
  endTime: number;
  totalPrice: number;
}

interface CheckoutData {
  date: string;
  items: CheckoutItem[];
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" /></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Validation is only evaluated once the user has meaningfully interacted with
  // the email field — typing-in-progress shouldn't yell "invalid" on every
  // keystroke.
  const [emailTouched, setEmailTouched] = useState(false);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  // Student discount state. The "verified" flag is checked server-side
  // (we re-resolve it in /api/checkout regardless of what's set here), so
  // this only drives the UI: show / hide upload box, display discount line.
  const [isStudent, setIsStudent] = useState(false);
  const [studentVerified, setStudentVerified] = useState(false);
  const [studentBusy, setStudentBusy] = useState(false);
  const [studentMsg, setStudentMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emailValidation: EmailValidationResult = useMemo(
    () => (customerEmail ? validateEmail(customerEmail) : { kind: "ok" }),
    [customerEmail]
  );
  const showEmailFeedback = emailTouched && customerEmail.length > 0;
  const emailHasBlocker = emailValidation.kind === "blocker";
  const emailHasSuggestion =
    (emailValidation.kind === "suggestion" || emailValidation.kind === "blocker") &&
    "suggestion" in emailValidation &&
    !!emailValidation.suggestion &&
    !suggestionDismissed;

  const applySuggestion = () => {
    if ("suggestion" in emailValidation && emailValidation.suggestion) {
      setCustomerEmail(emailValidation.suggestion);
      setSuggestionDismissed(false);
      setError("");
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutData");
    if (stored) {
      try {
        setCheckoutData(JSON.parse(stored));
      } catch {
        setCheckoutData(null);
      }
    }
  }, []);

  // Debounced student-status lookup. We only hit the API when the user has
  // ticked "I'm a student" AND typed a syntactically valid email — avoids
  // request storms on every keystroke. The 400 ms delay matches the email-
  // validation feedback cadence elsewhere on the page.
  useEffect(() => {
    if (!isStudent) {
      setStudentVerified(false);
      return;
    }
    const validForLookup =
      customerEmail.length > 0 && validateEmail(customerEmail).kind !== "blocker";
    if (!validForLookup) {
      setStudentVerified(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/student/status?email=${encodeURIComponent(customerEmail)}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setStudentVerified(!!data.verified);
      } catch {
        // network/abort — silent: UI just shows "not verified yet"
      }
    }, 400);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [isStudent, customerEmail]);

  // Memo MUST live above the early-return below — Rules of Hooks: every
  // render path through this component has to call hooks in the same
  // order. Reading from the (possibly null) checkoutData here keeps the
  // hook count stable across the empty-state and the filled-cart render.
  const slotsEligibleForDiscount = useMemo(
    () => isBookingDiscountEligible(checkoutData?.date ?? "", checkoutData?.items ?? []),
    [checkoutData?.date, checkoutData?.items]
  );

  if (!checkoutData || checkoutData.items.length === 0) {
    return (
      <div className="pt-40 pb-24 max-w-2xl mx-auto px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-6">
          event_busy
        </span>
        <h1 className="text-3xl font-headline italic text-on-surface mb-4">
          {t("emptyState.title")}
        </h1>
        <p className="text-on-surface-variant font-light mb-8">
          {t("emptyState.description")}
        </p>
        <Link href="/booking" className="btn-primary inline-block">
          {t("emptyState.button")}
        </Link>
      </div>
    );
  }

  const { date, items } = checkoutData;
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const dateObj = new Date(date + "T00:00:00");
  const dateLocale = locale === "en" ? "en-GB" : "de-DE";
  const formattedDate = dateObj.toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const discountApplies = isStudent && studentVerified && slotsEligibleForDiscount;
  const finalTotal = discountApplies ? applyStudentDiscount(totalPrice) : totalPrice;
  const discountAmount = discountApplies ? totalPrice - finalTotal : 0;

  const handleVerifyUpload = async (file: File) => {
    if (!customerEmail || validateEmail(customerEmail).kind === "blocker") {
      setStudentMsg({ kind: "error", text: t("form.studentEmailFirst") });
      return;
    }
    setStudentBusy(true);
    setStudentMsg(null);
    try {
      const fd = new FormData();
      fd.append("email", customerEmail);
      fd.append("file", file);
      const res = await fetch("/api/student/verify", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setStudentMsg({ kind: "error", text: data.error ?? t("form.studentUploadError") });
        return;
      }
      setStudentVerified(true);
      setStudentMsg({ kind: "ok", text: t("form.studentVerifiedNow") });
    } catch {
      setStudentMsg({ kind: "error", text: t("form.studentUploadError") });
    } finally {
      setStudentBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Final guard — block submit if validation has a hard error.
    const finalCheck = validateEmail(customerEmail);
    if (finalCheck.kind === "blocker") {
      setEmailTouched(true);
      setError(t("form.emailBlockedSubmit"));
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          items,
          customerName,
          customerEmail,
          customerPhone,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("form.errorDefault"));
      }

      if (data.url) {
        sessionStorage.removeItem("checkoutData");
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-screen-2xl mx-auto px-6 md:px-12">
      {/* Header */}
      <header className="mb-16">
        <button
          onClick={() => router.back()}
          className="text-on-surface-variant font-label text-xs tracking-widest uppercase hover:text-primary transition-colors mb-8 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">
            arrow_back
          </span>
          {t("backButton")}
        </button>
        <span className="section-label">{t("badge")}</span>
        <h1 className="text-5xl md:text-6xl font-headline italic tracking-tighter">
          {t("headline")} <span className="text-primary">{t("headlineAccent")}</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Customer Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow space-y-8">
              <h2 className="font-headline text-2xl italic mb-2">
                {t("form.title")}
              </h2>

              <div>
                <label className="label">{t("form.nameLabel")}</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t("form.namePlaceholder")}
                  className="input"
                />
              </div>

              <div>
                <label className="label">{t("form.emailLabel")}</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    setSuggestionDismissed(false);
                    if (error) setError("");
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder={t("form.emailPlaceholder")}
                  aria-invalid={showEmailFeedback && emailHasBlocker ? true : undefined}
                  className={`input ${
                    showEmailFeedback && emailHasBlocker
                      ? "!border-error focus:!border-error"
                      : ""
                  }`}
                />

                {/* Hard error — blocks submit */}
                {showEmailFeedback && emailHasBlocker && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-error">
                    <span className="material-symbols-outlined text-base mt-0.5">error</span>
                    <div className="flex-1">
                      {emailValidation.messageKey === "invalidTld" &&
                      "suggestion" in emailValidation &&
                      emailValidation.suggestion ? (
                        <span>
                          {t("form.emailErrorInvalidTld", {
                            suggestion: emailValidation.suggestion,
                          })}
                        </span>
                      ) : (
                        <span>{t("form.emailErrorInvalidFormat")}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Soft warning — does NOT block submit */}
                {showEmailFeedback &&
                  !emailHasBlocker &&
                  emailValidation.kind === "suggestion" &&
                  !suggestionDismissed && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-tertiary">
                      <span className="material-symbols-outlined text-base mt-0.5">
                        info
                      </span>
                      <div className="flex-1">
                        <span>
                          {t("form.emailWarningDomainTypo", {
                            suggestion: emailValidation.suggestion,
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                {/* One-click fix — only when we have a concrete suggestion */}
                {showEmailFeedback && emailHasSuggestion && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="text-[10px] font-label uppercase tracking-widest px-4 py-2 rounded-md bg-primary text-on-primary hover:opacity-90 transition"
                    >
                      {t("form.emailSuggestionApply")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionDismissed(true)}
                      className="text-[10px] font-label uppercase tracking-widest px-4 py-2 rounded-md text-on-surface-variant hover:text-on-surface transition"
                    >
                      {t("form.emailSuggestionDismiss")}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="label">{t("form.phoneLabel")}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t("form.phonePlaceholder")}
                  className="input"
                />
              </div>
            </div>

            {/* Student discount section — only relevant when the selected
                slots qualify (Mo-Fr 08-12). Hidden otherwise to keep the
                checkout clean. */}
            {slotsEligibleForDiscount && (
              <div className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-headline text-xl italic mb-1">
                      {t("form.studentTitle")}
                    </h3>
                    <p className="text-sm text-on-surface-variant font-light">
                      {t("form.studentSubtitle", { percent: STUDENT_DISCOUNT_PERCENT })}
                    </p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => {
                        setIsStudent(e.target.checked);
                        setStudentMsg(null);
                      }}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-label uppercase tracking-widest">
                      {t("form.studentToggle")}
                    </span>
                  </label>
                </div>

                {isStudent && (
                  <div className="pt-4 border-t border-stone-200 space-y-4">
                    {studentVerified ? (
                      <div className="flex items-center gap-3 text-secondary">
                        <span className="material-symbols-outlined">verified</span>
                        <span className="text-sm font-medium">
                          {t("form.studentAlreadyVerified")}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                          {t("form.studentUploadHint")}
                        </p>
                        <label className="block">
                          <span className="sr-only">{t("form.studentUploadLabel")}</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                            disabled={studentBusy}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleVerifyUpload(f);
                            }}
                            className="block w-full text-sm text-on-surface-variant font-light file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:font-label file:text-xs file:tracking-widest file:uppercase file:bg-primary file:text-on-primary hover:file:opacity-90 file:cursor-pointer cursor-pointer disabled:opacity-50"
                          />
                        </label>
                        {studentBusy && (
                          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                            {t("form.studentVerifying")}
                          </div>
                        )}
                      </>
                    )}
                    {studentMsg && (
                      <div
                        className={`text-sm flex items-start gap-2 ${
                          studentMsg.kind === "ok" ? "text-secondary" : "text-error"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base mt-0.5">
                          {studentMsg.kind === "ok" ? "check_circle" : "error"}
                        </span>
                        <span>{studentMsg.text}</span>
                      </div>
                    )}
                    <p className="text-[10px] font-label uppercase tracking-widest text-stone-400 leading-relaxed">
                      {t("form.studentPrivacyNote")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-error-container text-on-error-container px-6 py-4 rounded-lg text-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (emailTouched && emailHasBlocker)}
              className="w-full kinetic-gradient text-on-primary py-6 rounded-lg font-label text-xs tracking-[0.3em] uppercase editorial-shadow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  {t("form.processing")}
                </>
              ) : (
                <>{t("form.submit", { price: formatPrice(finalTotal) })}</>
              )}
            </button>

            <p className="text-center text-[10px] text-stone-400 font-label uppercase tracking-widest">
              {t("form.secureNote")}
            </p>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-5 sticky top-32">
          <div className="bg-surface-container-highest rounded-xl p-10 editorial-shadow border border-white/20">
            <h3 className="text-2xl font-headline italic tracking-tight mb-8">
              {t("summary.title")}
            </h3>

            <div className="mb-6">
              <label className="block text-[10px] font-label uppercase tracking-widest text-stone-500 mb-1">
                {t("summary.dateLabel")}
              </label>
              <p className="font-body font-medium">{formattedDate}</p>
            </div>

            <div className="space-y-4 mb-8">
              {items.map((item) => {
                const hours = item.endTime - item.startTime;
                const typeInfo = COURT_TYPES[item.courtType as keyof typeof COURT_TYPES];

                return (
                  <div key={item.courtId} className="bg-surface-container-lowest/60 rounded-lg p-5 border border-surface-container-lowest space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-body font-medium">{item.courtName}</p>
                        <p className="text-[10px] font-label tracking-widest uppercase text-on-surface-variant">
                          {typeInfo?.label}
                        </p>
                      </div>
                      <span className="font-body font-bold">{formatPrice(item.totalPrice)}</span>
                    </div>
                    <div className="text-sm text-on-surface-variant font-light">
                      {formatTime(item.startTime)} – {formatTime(item.endTime)} ({hours}h)
                    </div>
                    {Array.from({ length: hours }, (_, i) => item.startTime + i).map((hour) => (
                      <div key={hour} className="flex justify-between text-xs font-light">
                        <span className="text-on-surface-variant">
                          {formatTime(hour)} – {formatTime(hour + 1)}
                        </span>
                        <span className="font-body font-bold">
                          {formatPrice(getPriceForHour(item.courtType, hour))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="bg-surface-container-lowest/60 rounded-lg p-5 space-y-3 border border-surface-container-lowest">
              {discountApplies && (
                <div className="flex justify-between text-sm font-light text-secondary">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">school</span>
                    {t("summary.studentDiscount", { percent: STUDENT_DISCOUNT_PERCENT })}
                  </span>
                  <span className="font-body font-bold">−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-light">
                <span className="text-on-surface-variant">{t("summary.vat")}</span>
                <span className="font-body font-bold">{formatPrice(finalTotal * 0.19)}</span>
              </div>
              <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                <span className="font-headline italic text-xl">{t("summary.investment")}</span>
                <span className="text-3xl font-headline italic text-primary">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-surface-container-low rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-lg">
                verified_user
              </span>
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                {t("summary.note")}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
