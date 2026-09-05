"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Status = "idle" | "loading" | "success" | "error";

interface NewsletterFormProps {
  variant?: "hero" | "footer";
  placeholder: string;
  buttonLabel: string;
  successMessage?: string;
}

// Wired to the same /api/waitlist endpoint the coming-soon page already
// uses — this was previously a plain unwired <form> that did a native GET
// reload with the email in the query string on submit.
export default function NewsletterForm({
  variant = "hero",
  placeholder,
  buttonLabel,
  successMessage,
}: NewsletterFormProps) {
  const locale = useLocale();
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
        setErrorMsg(data.error === "invalid_email" ? t("errorInvalid") : t("errorGeneric"));
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg(t("errorGeneric"));
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={
          variant === "hero"
            ? "flex items-center justify-center gap-3 text-secondary py-4"
            : "flex items-center gap-2 text-secondary text-xs"
        }
      >
        <span className="material-symbols-outlined text-xl">check_circle</span>
        <span className="font-label tracking-wide">
          {successMessage ?? t("success")}
        </span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            disabled={status === "loading"}
            placeholder={placeholder}
            className="bg-surface-container-lowest border border-stone-200 rounded-lg text-xs w-full p-4 focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            aria-label={buttonLabel}
            className="bg-stone-900 text-white px-6 rounded-lg flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">
              {status === "loading" ? "progress_activity" : "north_east"}
            </span>
          </button>
        </form>
        {status === "error" && (
          <p className="mt-2 text-xs text-error">{errorMsg}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          disabled={status === "loading"}
          placeholder={placeholder}
          className="flex-grow bg-surface-container-lowest border-none px-6 py-4 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-stone-400 font-label text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-primary text-on-primary px-10 py-4 rounded-lg font-label text-xs tracking-widest uppercase transition-all hover:bg-primary-container disabled:opacity-50"
        >
          {status === "loading" ? t("submitting") : buttonLabel}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-3 text-sm text-error">{errorMsg}</p>
      )}
    </div>
  );
}
