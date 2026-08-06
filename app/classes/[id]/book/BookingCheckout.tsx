"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpen, CalendarDays, Check, ChevronRight, LayoutDashboard, Loader2, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import PromoCodeInput, { type PromoResult } from "@/components/ui/PromoCodeInput";
import CoursatyLogo from "@/components/ui/CoursatyLogo";
import { useI18n } from "@/app/components/i18n";
import { classBanner, subjectAccent } from "@/app/lib/imagery";

interface ClassSummary {
  id: string;
  title: string;
  subject: string;
  priceEgp: number;
  format: string;
  paymentType: string;
  city: string | null;
  schedule: string | null;
  spotsLeft: number | null;
  tutorId: string | null;
  tutorName: string;
}

const STEPS = ["booking.checkout.step.schedule", "booking.checkout.step.details", "booking.checkout.step.pay"] as const;
type Translator = ReturnType<typeof useI18n>["t"];

export default function BookingCheckout({ cls }: { cls: ClassSummary }) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { lang, setLang, t } = useI18n();
  const [step, setStep] = useState(0);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [alreadyBookedId, setAlreadyBookedId] = useState<string | null>(null);
  const direction = lang === "ar" ? -1 : 1;
  const rtlFlip = lang === "ar" ? "scaleX(-1)" : undefined;
  const finalPrice = promoResult?.finalPrice ?? cls.priceEgp;

  const handlePromoApply = useCallback((code: string, result: PromoResult) => {
    setPromoCode(code);
    setPromoResult(result);
  }, []);

  const handleBook = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          paymentType: cls.paymentType,
          ...(promoCode ? { promoCode } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409 && typeof data.bookingId === "string") {
          setAlreadyBookedId(data.bookingId);
          return;
        }
        setError(t("signup.error.generic"));
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      setDone(true);
      window.setTimeout(() => {
        router.push(data.bookingId ? `/booking-confirmed?bookingId=${data.bookingId}` : "/dashboard");
      }, 700);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setSubmitting(false);
    }
  }, [cls.id, cls.paymentType, promoCode, router, submitting, t]);

  if (alreadyBookedId) {
    return <AlreadyBookedState bookingId={alreadyBookedId} cls={cls} t={t} />;
  }

  if (done) {
    return (
      <main style={{ minHeight: "62vh", display: "grid", placeItems: "center", color: "var(--text)", textAlign: "center" }} aria-busy="true">
        <div>
          <span style={{ display: "inline-grid", width: 62, height: 62, placeItems: "center", color: "var(--success)", background: "var(--success-bg)", borderRadius: "50%" }}><Check size={28} aria-hidden /></span>
          <h1 style={{ margin: "14px 0 4px", fontSize: "1.45rem" }}>{t("booking.checkout.received")}</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>{t("booking.checkout.openingConfirmation")}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 1rem 5rem", color: "var(--text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href={`/classes/${cls.id}`} aria-label={t("booking.checkout.backToClass")} style={{ display: "inline-flex", alignItems: "center", color: "var(--text-secondary)", textDecoration: "none" }}>
          <ArrowLeft size={20} aria-hidden style={{ transform: rtlFlip }} />
        </Link>
        <CoursatyLogo compact />
        <button type="button" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="btn-secondary" style={{ minHeight: 44, padding: "6px 12px", fontSize: 11 }}>
          {lang === "en" ? "AR | EN" : "عربي | EN"}
        </button>
      </div>

      <StepIndicator step={step} t={t} />
      <CheckoutClassSummary cls={cls} t={t} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(250px, 280px)", gap: 14, alignItems: "start" }} className="checkout-grid">
        <section style={{ minHeight: 330, padding: "1.25rem", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? false : { opacity: 0, x: 10 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -10 * direction }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && <ScheduleStep cls={cls} t={t} />}
              {step === 1 && <DetailsStep cls={cls} t={t} />}
              {step === 2 && (
                <PaymentStep
                  cls={cls}
                  promoResult={promoResult}
                  onApply={handlePromoApply}
                  onClear={() => {
                    setPromoCode(null);
                    setPromoResult(null);
                  }}
                  disabled={submitting}
                  t={t}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p role="alert" style={{ margin: "16px 0 0", padding: "10px 12px", color: "var(--error)", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: "var(--radius-md)", fontSize: 13 }}>{error}</p>}

          <div style={{ marginTop: 22 }}>
            {step < STEPS.length - 1 ? (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || submitting} className="btn-secondary">
                  {t("booking.checkout.back")}
                </button>
                <button type="button" onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))} className="btn-primary" style={{ flex: 1 }}>
                  {t("booking.checkout.continue")} <ChevronRight size={15} aria-hidden style={{ transform: rtlFlip }} />
                </button>
              </div>
            ) : (
              <div>
                <button type="button" onClick={handleBook} disabled={submitting} className="btn-primary btn-primary-shimmer" style={{ width: "100%", minHeight: 50, fontSize: 15, fontWeight: 700 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={submitting ? "submitting" : "ready"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {submitting ? (
                        <>
                          <Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />
                          {t("booking.checkout.confirming")}
                        </>
                      ) : (
                        <>
                          {finalPrice === 0 ? t("booking.checkout.bookFree") : t("booking.checkout.confirm")}
                          <ChevronRight size={17} aria-hidden style={{ transform: rtlFlip }} />
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 10, color: "var(--text-muted)", fontSize: 12 }}>
                  <BookOpen size={13} aria-hidden />
                  {t("booking.checkout.secure")}
                </div>
                {submitting && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>
                    <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />
                    {t("booking.checkout.processing")}
                  </motion.div>
                )}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
                  <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={submitting} className="btn-secondary" style={{ fontSize: 13, padding: "7px 14px" }}>
                    {t("booking.checkout.back")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
        <OrderSummary cls={cls} promoResult={promoResult} finalPrice={finalPrice} t={t} />
      </div>
      <style>{`
        @media (max-width: 760px) { .checkout-grid { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { .btn-primary-shimmer::after { animation: none !important; } }
      `}</style>
    </main>
  );
}

function StepIndicator({ step, t }: { step: number; t: Translator }) {
  return (
    <ol style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", margin: "0 0 22px", padding: 0, listStyle: "none" }}>
      {STEPS.map((label, index) => {
        const complete = index < step;
        const active = index === step;
        return (
          <li key={label} aria-current={active ? "step" : undefined} style={{ position: "relative", display: "grid", justifyItems: "center", gap: 6, color: active || complete ? "var(--accent)" : "var(--text-muted)", fontSize: 12, fontWeight: 800 }}>
            {index > 0 && <span style={{ position: "absolute", insetInlineEnd: "50%", insetBlockStart: 15, width: "100%", height: 2, background: complete || active ? "var(--accent)" : "var(--border)", zIndex: 0 }} />}
            <span style={{ zIndex: 1, display: "grid", width: 30, height: 30, placeItems: "center", color: active || complete ? "var(--accent-fg)" : "var(--text-muted)", background: active || complete ? "var(--accent)" : "var(--bg-card)", border: `1px solid ${active || complete ? "var(--accent)" : "var(--border)"}`, borderRadius: "50%" }}>
              {complete ? <Check size={15} aria-hidden /> : index + 1}
            </span>
            {t(label)}
          </li>
        );
      })}
    </ol>
  );
}

function ScheduleStep({ cls, t }: { cls: ClassSummary; t: Translator }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <span style={{ display: "inline-grid", width: 48, height: 48, placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: 12 }}>
        <CalendarDays size={22} aria-hidden />
      </span>
      <div>
        <h2 style={{ margin: "0 0 7px", fontSize: "1.1rem" }}>{t("booking.checkout.scheduleTitle")}</h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{t("booking.checkout.scheduleBody")}</p>
      </div>
      <div style={{ padding: "14px 16px", color: "var(--text)", background: "var(--accent-bg-soft)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)" }}>
        <span style={{ display: "block", marginBottom: 4, color: "var(--accent)", fontSize: 12, fontWeight: 800 }}>{t("booking.schedule")}</span>
        <strong style={{ fontSize: 15 }}>{cls.schedule ?? t("booking.checkout.scheduleMissing")}</strong>
      </div>
    </div>
  );
}

function CheckoutClassSummary({ cls, t }: { cls: ClassSummary; t: Translator }) {
  return (
    <section style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, padding: "0.75rem", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)" }}>
      <span style={{ position: "relative", display: "block", width: 78, height: 72, flexShrink: 0, overflow: "hidden", borderRadius: 10, backgroundColor: subjectAccent(cls.subject) }}>
        <Image src={classBanner(`${cls.subject}-${cls.id}`, 160, 150)} alt="" fill sizes="78px" style={{ objectFit: "cover", opacity: 0.6, mixBlendMode: "luminosity" }} />
        <span aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${subjectAccent(cls.subject)}cc, ${subjectAccent(cls.subject)}44)`, display: "grid", placeItems: "center", color: "#fff" }}>
          <BookOpen size={26} strokeWidth={1.6} aria-hidden />
        </span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", overflow: "hidden", color: "var(--text)", fontSize: 15, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.title}</strong>
        <small style={{ display: "block", marginTop: 2, color: "var(--text-muted)", fontSize: 11 }}>{t("booking.checkout.withTutor", { name: cls.tutorName })}</small>
        <span style={{ display: "flex", gap: 10, marginTop: 8, color: "var(--text-secondary)", fontSize: 11, flexWrap: "wrap" }}>
          <span>{cls.format === "ONLINE" ? t("booking.checkout.onlineSession") : cls.city ?? t("booking.checkout.inPerson")}</span>
          <span>{cls.schedule ?? t("booking.checkout.scheduleMissing")}</span>
          {cls.spotsLeft !== null && <span>{t("booking.checkout.seatsLeft", { count: cls.spotsLeft })}</span>}
        </span>
      </span>
      <strong style={{ color: "var(--accent)", fontSize: 16, whiteSpace: "nowrap" }}>{cls.priceEgp} EGP</strong>
    </section>
  );
}

function DetailsStep({ cls, t }: { cls: ClassSummary; t: Translator }) {
  const details = [
    t("booking.checkout.nextDashboard"),
    t("booking.checkout.nextTutor", { name: cls.tutorName }),
    t("booking.checkout.nextMessages"),
  ];
  return (
    <>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>{t("booking.checkout.whatNext")}</h2>
      <p style={{ margin: "0 0 18px", color: "var(--text-secondary)", fontSize: 14 }}>{t("booking.checkout.whatNextBody")}</p>
      <div style={{ display: "grid", gap: 12 }}>
        {details.map((item) => (
          <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", color: "var(--text-secondary)", fontSize: 14 }}>
            <Check size={16} color="var(--accent)" aria-hidden />
            {item}
          </div>
        ))}
      </div>
    </>
  );
}

function PaymentStep({
  cls,
  promoResult,
  onApply,
  onClear,
  disabled,
  t,
}: {
  cls: ClassSummary;
  promoResult: PromoResult | null;
  onApply: (code: string, result: PromoResult) => void;
  onClear: () => void;
  disabled: boolean;
  t: Translator;
}) {
  return (
    <>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>{t("booking.checkout.paymentTitle")}</h2>
      <p style={{ margin: "0 0 18px", color: "var(--text-secondary)", fontSize: 14 }}>
        {t(cls.paymentType === "ONLINE" ? "booking.checkout.paymentOnline" : "booking.paymentCash")}
      </p>
      <PromoCodeInput
        classId={cls.id}
        priceEgp={cls.priceEgp}
        onApply={onApply}
        onClear={onClear}
        disabled={disabled}
      />
      {promoResult && (
        <p style={{ margin: "12px 0 0", color: "var(--success)", fontSize: 13, fontWeight: 700 }}>
          {t("booking.checkout.promoApplied", { amount: promoResult.discountEgp })}
        </p>
      )}
    </>
  );
}

function OrderSummary({
  cls,
  promoResult,
  finalPrice,
  t,
}: {
  cls: ClassSummary;
  promoResult: PromoResult | null;
  finalPrice: number;
  t: Translator;
}) {
  return (
    <aside style={{ position: "sticky", top: 84, padding: "1.25rem", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)" }}>
      <span style={{ display: "inline-grid", width: 42, height: 42, placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: 10 }}><BookOpen size={20} aria-hidden /></span>
      <h2 style={{ margin: "12px 0 3px", fontSize: "1rem" }}>{cls.title}</h2>
      <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 12 }}>{cls.subject} · {cls.tutorName}</p>
        <div style={{ display: "grid", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
          <PriceRow label={t("booking.checkout.classPrice")} value={`${cls.priceEgp} EGP`} />
          {promoResult && (
            <PriceRow
              label={t("booking.checkout.discount", { amount: promoResult.discountPct })}
              value={`-${promoResult.discountEgp} EGP`}
              highlight
            />
          )}
          <PriceRow label={t("booking.checkout.total")} value={`${finalPrice} EGP`} bold />
      </div>
    </aside>
  );
}

function AlreadyBookedState({ bookingId, cls, t }: { bookingId: string; cls: ClassSummary; t: Translator }) {
  const router = useRouter();
  const [openingMessages, setOpeningMessages] = useState(false);

  async function messageTutor() {
    if (!cls.tutorId) {
      router.push("/messages");
      return;
    }

    setOpeningMessages(true);
    const response = await fetch("/api/messages/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorId: cls.tutorId }),
    });
    const data = await response.json().catch(() => null);
    router.push(response.ok && data?.threadId ? `/messages/${data.threadId}` : "/messages");
  }

  return (
    <main style={{ minHeight: "72vh", display: "grid", placeItems: "center", padding: "1.5rem", color: "var(--text)" }}>
      <section style={{ width: "min(100%, 520px)", padding: "1.5rem", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-lg)" }}>
        <span style={{ display: "inline-grid", width: 58, height: 58, placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: "50%" }}>
          <Check size={26} aria-hidden />
        </span>
        <h1 style={{ margin: "14px 0 7px", fontSize: "1.55rem" }}>{t("booking.checkout.alreadyTitle")}</h1>
        <p style={{ margin: "0 auto 20px", maxWidth: 420, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{t("booking.checkout.alreadyBody")}</p>
        <div style={{ display: "grid", gap: 9 }}>
          <Link href={`/dashboard?bookingId=${bookingId}`} className="btn-primary" style={{ justifyContent: "center" }}>
            <BookOpen size={16} aria-hidden /> {t("booking.checkout.viewBooking")}
          </Link>
          <Link href="/dashboard" className="btn-secondary" style={{ justifyContent: "center" }}>
            <LayoutDashboard size={16} aria-hidden /> {t("booking.checkout.goDashboard")}
          </Link>
          <button type="button" onClick={messageTutor} disabled={openingMessages} className="btn-secondary" style={{ justifyContent: "center" }}>
            {openingMessages ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden /> : <MessageCircle size={16} aria-hidden />}
            {t(openingMessages ? "booking.checkout.openingMessages" : "booking.checkout.messageTutor")}
          </button>
        </div>
      </section>
    </main>
  );
}

function PriceRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: highlight ? "var(--success)" : bold ? "var(--text)" : "var(--text-secondary)", fontSize: bold ? 15 : 13, fontWeight: bold ? 850 : 600 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
