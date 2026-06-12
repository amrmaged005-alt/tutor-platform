"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  School,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
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

type Translator = ReturnType<typeof useI18n>["t"];
type PaymentMethod = "card" | "fawry" | "bank" | "cash";

const CALENDAR_DAYS = [
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3, available: true },
  { day: 4 },
  { day: 5 },
  { day: 6 },
  { day: 7, selected: true },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16, available: true },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20, today: true },
  { day: 21 },
  { day: 22 },
  { day: 23 },
  { day: 24 },
  { day: 25 },
  { day: 26 },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31 },
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_OPTIONS = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];
const PLATFORM_FEE = 20;

export default function BookingCheckout({ cls }: { cls: ClassSummary }) {
  const reduceMotion = useReducedMotion();
  const { lang, setLang, t } = useI18n();
  const [selectedDay, setSelectedDay] = useState(7);
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [studentName, setStudentName] = useState("Omar Hossam");
  const [school, setSchool] = useState("IGCSE - Al Nafees International School");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [alreadyBookedId, setAlreadyBookedId] = useState<string | null>(null);

  const cashAvailable = cls.paymentType === "IN_PERSON";
  const total = cls.priceEgp + PLATFORM_FEE;
  const paymentType = paymentMethod === "cash" && cashAvailable ? "IN_PERSON" : "ONLINE";
  const paymentMethodLabel =
    paymentMethod === "cash" ? "Cash at center/tutor" : paymentMethod === "bank" ? "Bank transfer" : paymentMethod === "fawry" ? "Fawry Pay" : "Card";
  const note = useMemo(
    () =>
      [
        `Schedule: May ${selectedDay}, 2025 at ${selectedTime}`,
        `Student: ${studentName || "Not provided"}`,
        school ? `School: ${school}` : null,
        `Payment method: ${paymentMethodLabel}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [paymentMethodLabel, school, selectedDay, selectedTime, studentName],
  );

  const handleBook = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: cls.id, paymentType, note }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409 && typeof data.bookingId === "string") {
          setAlreadyBookedId(data.bookingId);
          return;
        }
        setError(data.error ?? "Could not create booking. Please try again.");
        return;
      }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      setDone(true);
      window.setTimeout(() => {
        window.location.href = data.bookingId ? `/booking-confirmed?bookingId=${data.bookingId}` : "/dashboard";
      }, 700);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [cls.id, note, paymentType, submitting]);

  if (alreadyBookedId) {
    return <AlreadyBookedState bookingId={alreadyBookedId} cls={cls} t={t} />;
  }

  if (done) {
    return (
      <main className="booking-state" aria-busy="true">
        <div>
          <span className="booking-success-icon">
            <Check size={28} aria-hidden />
          </span>
          <h1>Booking received</h1>
          <p>Opening your confirmation...</p>
        </div>
        <CheckoutStyles />
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-shell">
        <header className="booking-topbar">
          <Link href={`/classes/${cls.id}`} aria-label="Back to class" className="icon-link">
            <ArrowLeft size={21} aria-hidden />
          </Link>
          <CoursatyLogo compact />
          <button type="button" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="language-toggle">
            <span className={lang === "ar" ? "active" : ""}>AR</span>
            <span className={lang === "en" ? "active" : ""}>EN</span>
          </button>
        </header>

        <StepIndicator />

        <div className="checkout-layout">
          <div className="checkout-main">
            <ClassSummaryCard cls={cls} />

            <section className="checkout-card date-card" aria-labelledby="date-title">
              <div className="section-heading">
                <h2 id="date-title">1. Choose date</h2>
                <button type="button" className="month-button" aria-label="Change month">
                  May 2025 <ChevronRight size={16} aria-hidden />
                </button>
              </div>
              <div className="week-row" aria-hidden>
                {WEEK_DAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {CALENDAR_DAYS.map((date, index) => {
                  const isSelected = selectedDay === date.day && !date.muted;
                  const disabled = date.muted;
                  return (
                    <button
                      key={`${date.day}-${index}`}
                      type="button"
                      disabled={disabled}
                      aria-pressed={isSelected}
                      aria-label={`${date.day} May${date.available ? ", available" : ""}${date.today ? ", today" : ""}`}
                      onClick={() => setSelectedDay(date.day)}
                      className={`date-button ${isSelected ? "selected" : ""} ${date.available ? "available" : ""} ${date.today ? "today" : ""}`}
                    >
                      {date.day}
                    </button>
                  );
                })}
              </div>
              <div className="legend-row" aria-label="Calendar legend">
                <LegendDot label="Selected" className="selected-dot" />
                <LegendDot label="Today" className="today-dot" />
                <LegendDot label="Available" className="available-dot" />
                <LegendDot label="Unavailable" className="unavailable-dot" />
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="time-title">
              <h2 id="time-title">2. Choose time</h2>
              <div className="time-row">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    aria-pressed={selectedTime === time}
                    onClick={() => setSelectedTime(time)}
                    className={selectedTime === time ? "time-button selected" : "time-button"}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="student-title">
              <h2 id="student-title">3. Student details</h2>
              <div className="field-stack">
                <label className="checkout-field">
                  <UserRound size={20} aria-hidden />
                  <span>
                    <small>Student full name</small>
                    <input value={studentName} onChange={(event) => setStudentName(event.target.value)} />
                  </span>
                </label>
                <label className="checkout-field">
                  <School size={20} aria-hidden />
                  <span>
                    <small>Grade / School (optional)</small>
                    <input value={school} onChange={(event) => setSchool(event.target.value)} />
                  </span>
                </label>
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="payment-title">
              <h2 id="payment-title">4. Payment method</h2>
              <div className={cashAvailable ? "payment-grid has-cash" : "payment-grid"}>
                <PaymentOption
                  id="card"
                  label="Card"
                  meta="Visa, MasterCard"
                  active={paymentMethod === "card"}
                  onSelect={setPaymentMethod}
                  icon={<CreditCard size={24} aria-hidden />}
                />
                <PaymentOption
                  id="fawry"
                  label="Fawry Pay"
                  meta="Fawry"
                  active={paymentMethod === "fawry"}
                  onSelect={setPaymentMethod}
                  icon={<span className="fawry-logo">Fawry</span>}
                />
                <PaymentOption
                  id="bank"
                  label="Bank Transfer"
                  meta="Manual review"
                  active={paymentMethod === "bank"}
                  onSelect={setPaymentMethod}
                  icon={<Banknote size={24} aria-hidden />}
                />
                {cashAvailable && (
                  <PaymentOption
                    id="cash"
                    label="Cash"
                    meta="At center/tutor"
                    active={paymentMethod === "cash"}
                    onSelect={setPaymentMethod}
                    icon={<Banknote size={24} aria-hidden />}
                  />
                )}
              </div>
              {cashAvailable && (
                <p className="payment-note">
                  Cash is available because this class poster accepts physical payment. Your booking is confirmed now, then payment is handled in person.
                </p>
              )}
            </section>
          </div>

          <aside className="checkout-side">
            <OrderSummary
              cls={cls}
              selectedDay={selectedDay}
              selectedTime={selectedTime}
              total={total}
              detailsOpen={detailsOpen}
              setDetailsOpen={setDetailsOpen}
              submitting={submitting}
              error={error}
              handleBook={handleBook}
              reduceMotion={Boolean(reduceMotion)}
            />
          </aside>
        </div>
      </div>
      <CheckoutStyles />
    </main>
  );
}

function StepIndicator() {
  return (
    <ol className="booking-steps" aria-label="Booking steps">
      {["Schedule", "Details", "Pay"].map((label, index) => (
        <li key={label} className={index === 0 ? "active" : ""} aria-current={index === 0 ? "step" : undefined}>
          <span>{index + 1}</span>
          <strong>{label}</strong>
        </li>
      ))}
    </ol>
  );
}

function ClassSummaryCard({ cls }: { cls: ClassSummary }) {
  return (
    <section className="class-summary-card">
      <div className="class-thumb" style={{ backgroundColor: subjectAccent(cls.subject) }}>
        <Image src={classBanner(`${cls.subject}-${cls.id}`, 260, 210)} alt="" fill sizes="(max-width: 720px) 106px, 142px" style={{ objectFit: "cover" }} priority />
        <span>{cls.subject}</span>
      </div>
      <div className="class-info">
        <h1>{cls.title}</h1>
        <p>
          with {cls.tutorName} <ShieldCheck size={15} aria-hidden />
        </p>
        <div className="class-meta">
          <span>
            <Star size={15} fill="currentColor" aria-hidden /> 4.9 (128)
          </span>
          <span>
            <UsersRound size={15} aria-hidden /> {cls.spotsLeft ?? 20} seats left
          </span>
          <span>
            <Wifi size={15} aria-hidden /> {cls.format === "ONLINE" ? "Online session" : cls.city ?? "In person"}
          </span>
          <span>
            <Clock3 size={15} aria-hidden /> 60 min
          </span>
        </div>
      </div>
      <div className="class-price">
        <strong>EGP {cls.priceEgp}</strong>
        <span>per session</span>
      </div>
    </section>
  );
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span>
      <i className={className} aria-hidden />
      {label}
    </span>
  );
}

function PaymentOption({
  id,
  label,
  meta,
  active,
  onSelect,
  icon,
}: {
  id: PaymentMethod;
  label: string;
  meta: string;
  active: boolean;
  onSelect: (value: PaymentMethod) => void;
  icon: React.ReactNode;
}) {
  return (
    <button type="button" className={active ? "payment-option active" : "payment-option"} onClick={() => onSelect(id)} aria-pressed={active}>
      <span className="radio-dot" aria-hidden />
      <span className="payment-icon">{icon}</span>
      <span>
        <strong>{label}</strong>
        <small>{meta}</small>
      </span>
    </button>
  );
}

function OrderSummary({
  cls,
  selectedDay,
  selectedTime,
  total,
  detailsOpen,
  setDetailsOpen,
  submitting,
  error,
  handleBook,
  reduceMotion,
}: {
  cls: ClassSummary;
  selectedDay: number;
  selectedTime: string;
  total: number;
  detailsOpen: boolean;
  setDetailsOpen: (value: boolean) => void;
  submitting: boolean;
  error: string | null;
  handleBook: () => void;
  reduceMotion: boolean;
}) {
  return (
    <section className="order-summary" aria-labelledby="order-title">
      <div className="order-heading">
        <h2 id="order-title">Order summary</h2>
        <button type="button" onClick={() => setDetailsOpen(!detailsOpen)}>
          Details <ChevronDown size={15} aria-hidden />
        </button>
      </div>
      <div className="summary-rows">
        <PriceRow label="Class session" value={`EGP ${cls.priceEgp}`} />
        <PriceRow label="Platform fee" value={`EGP ${PLATFORM_FEE}`} />
        {detailsOpen && (
          <>
            <PriceRow label="Date" value={`May ${selectedDay}`} />
            <PriceRow label="Time" value={selectedTime} />
          </>
        )}
      </div>
      <div className="summary-total">
        <strong>Total</strong>
        <span>EGP {total}</span>
      </div>
      <button type="button" onClick={handleBook} disabled={submitting} className="confirm-button">
        {submitting ? (
          <>
            <Loader2 size={18} aria-hidden /> Confirming booking
          </>
        ) : (
          <>
            Confirm booking <ChevronRight size={21} aria-hidden />
          </>
        )}
        <small>
          <ShieldCheck size={12} aria-hidden /> Secure payment
        </small>
      </button>
      {submitting && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="processing-banner"
          aria-live="polite"
        >
          <Loader2 size={20} aria-hidden />
          Processing your booking...
        </motion.div>
      )}
      {error && (
        <p role="alert" className="booking-error">
          {error}
        </p>
      )}
      <div className="trust-line">
        <ShieldCheck size={18} aria-hidden />
        <span>
          <strong>Protected checkout</strong>
          Confirmation is saved to your dashboard.
        </span>
      </div>
    </section>
  );
}

function AlreadyBookedState({ bookingId, cls, t }: { bookingId: string; cls: ClassSummary; t: Translator }) {
  const [openingMessages, setOpeningMessages] = useState(false);

  async function messageTutor() {
    if (!cls.tutorId) {
      window.location.href = "/messages";
      return;
    }

    setOpeningMessages(true);
    const response = await fetch("/api/messages/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutorId: cls.tutorId }),
    });
    const data = await response.json().catch(() => null);
    window.location.href = response.ok && data?.threadId ? `/messages/${data.threadId}` : "/messages";
  }

  return (
    <main className="booking-state">
      <section>
        <span className="booking-success-icon">
          <Check size={26} aria-hidden />
        </span>
        <h1>{t("booking.checkout.alreadyTitle")}</h1>
        <p>{t("booking.checkout.alreadyBody")}</p>
        <div className="state-actions">
          <Link href={`/dashboard?bookingId=${bookingId}`} className="state-primary">
            <BookOpen size={16} aria-hidden /> {t("booking.checkout.viewBooking")}
          </Link>
          <Link href="/dashboard" className="state-secondary">
            <LayoutDashboard size={16} aria-hidden /> {t("booking.checkout.goDashboard")}
          </Link>
          <button type="button" onClick={messageTutor} disabled={openingMessages} className="state-secondary">
            {openingMessages ? <Loader2 size={16} aria-hidden /> : <MessageCircle size={16} aria-hidden />}
            {t(openingMessages ? "booking.checkout.openingMessages" : "booking.checkout.messageTutor")}
          </button>
        </div>
      </section>
      <CheckoutStyles />
    </main>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="price-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CheckoutStyles() {
  return (
    <style>{`
      .booking-page {
        min-height: 100vh;
        color: var(--text);
        background:
          radial-gradient(circle at 12% 0%, rgba(13, 89, 70, 0.08), transparent 28rem),
          linear-gradient(180deg, #fbfaf6 0%, var(--bg) 100%);
      }

      .booking-shell {
        width: min(100%, 1180px);
        margin: 0 auto;
        padding: 20px 20px 44px;
      }

      .booking-topbar {
        display: grid;
        grid-template-columns: 44px 1fr auto;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .booking-topbar > :nth-child(2) {
        justify-self: center;
      }

      .icon-link,
      .language-toggle,
      .month-button {
        color: var(--text);
        background: transparent;
        border: 0;
        text-decoration: none;
      }

      .icon-link {
        display: grid;
        width: 42px;
        height: 42px;
        place-items: center;
        border-radius: 999px;
      }

      .language-toggle {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 34px;
        padding: 6px 10px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: rgba(251, 250, 246, 0.78);
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 800;
      }

      .language-toggle .active {
        color: var(--accent);
      }

      .booking-steps {
        position: relative;
        display: grid;
        width: min(100%, 590px);
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        margin: 0 auto 24px;
        padding: 0;
        list-style: none;
      }

      .booking-steps:before {
        position: absolute;
        top: 15px;
        right: 16.5%;
        left: 16.5%;
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent) 0 32%, var(--border-light) 32% 100%);
        content: "";
      }

      .booking-steps li {
        position: relative;
        z-index: 1;
        display: grid;
        justify-items: center;
        gap: 6px;
        color: var(--text-muted);
        font-size: 13px;
      }

      .booking-steps span {
        display: grid;
        width: 31px;
        height: 31px;
        place-items: center;
        border: 2px solid var(--border);
        border-radius: 999px;
        background: var(--bg-card);
        font-weight: 850;
      }

      .booking-steps strong {
        font-weight: 850;
      }

      .booking-steps .active {
        color: var(--accent);
      }

      .booking-steps .active span {
        color: var(--accent-fg);
        border-color: var(--accent);
        background: var(--accent);
      }

      .checkout-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 350px;
        gap: 18px;
        align-items: start;
      }

      .checkout-main {
        display: grid;
        gap: 14px;
      }

      .checkout-card,
      .class-summary-card,
      .order-summary {
        border: 1px solid var(--border-light);
        border-radius: 16px;
        background: rgba(251, 250, 246, 0.92);
      }

      .class-summary-card {
        display: grid;
        grid-template-columns: 142px minmax(0, 1fr) auto;
        gap: 16px;
        align-items: center;
        min-height: 142px;
        padding: 16px;
      }

      .class-thumb {
        position: relative;
        min-height: 110px;
        overflow: hidden;
        border-radius: 12px;
      }

      .class-thumb:after {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(13, 89, 70, 0.3));
        content: "";
      }

      .class-thumb span {
        position: absolute;
        top: 9px;
        left: 9px;
        z-index: 1;
        padding: 4px 8px;
        border-radius: 999px;
        color: var(--accent-fg);
        background: var(--accent);
        font-size: 11px;
        font-weight: 850;
      }

      .class-info h1 {
        margin: 0 0 6px;
        color: var(--text);
        font-family: Lora, Georgia, serif;
        font-size: clamp(1.25rem, 2vw, 1.75rem);
        line-height: 1.1;
      }

      .class-info p {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .class-info p svg {
        color: var(--accent);
      }

      .class-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 16px;
        margin-top: 14px;
        color: var(--text-secondary);
        font-size: 13px;
      }

      .class-meta span {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .class-meta span:first-child {
        color: var(--rating-gold);
      }

      .class-price {
        align-self: end;
        text-align: right;
      }

      .class-price strong {
        display: block;
        color: var(--accent);
        font-size: 1.45rem;
        line-height: 1;
      }

      .class-price span {
        display: block;
        margin-top: 5px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .checkout-card {
        padding: 18px 20px;
      }

      .checkout-card h2 {
        margin: 0;
        color: var(--text);
        font-size: 1rem;
        font-weight: 850;
      }

      .section-heading,
      .order-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .month-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 750;
      }

      .week-row,
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      .week-row {
        margin-top: 20px;
        color: var(--text-muted);
        font-size: 12px;
        text-align: center;
      }

      .calendar-grid {
        gap: 7px;
        margin-top: 10px;
      }

      .date-button {
        aspect-ratio: 1;
        min-width: 0;
        border: 0;
        border-radius: 999px;
        color: var(--text-secondary);
        background: transparent;
        font-size: 15px;
        font-weight: 750;
      }

      .date-button:disabled {
        color: rgba(111, 107, 97, 0.42);
      }

      .date-button.available {
        background: var(--accent-bg);
        color: var(--accent);
      }

      .date-button.today {
        border: 2px solid var(--accent);
        color: var(--accent);
        background: transparent;
      }

      .date-button.selected {
        color: var(--accent-fg);
        background: var(--accent);
      }

      .legend-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px 22px;
        margin-top: 18px;
        color: var(--text-muted);
        font-size: 12px;
      }

      .legend-row span {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .legend-row i {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 999px;
      }

      .selected-dot {
        background: var(--accent);
      }

      .today-dot {
        border: 2px solid var(--accent);
      }

      .available-dot {
        background: var(--accent-bg);
      }

      .unavailable-dot {
        background: var(--border);
      }

      .time-row {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
        margin-top: 14px;
      }

      .time-button {
        min-height: 45px;
        border: 1px solid var(--border);
        border-radius: 12px;
        color: var(--text-secondary);
        background: var(--bg-card);
        font-size: 14px;
        font-weight: 780;
      }

      .time-button.selected {
        color: var(--accent-fg);
        border-color: var(--accent);
        background: var(--accent);
      }

      .field-stack {
        display: grid;
        gap: 10px;
        margin-top: 14px;
      }

      .checkout-field {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 58px;
        padding: 8px 12px;
        border: 1px solid var(--border);
        border-radius: 13px;
        background: var(--bg-card);
        color: var(--text-secondary);
      }

      .checkout-field:focus-within {
        border-color: var(--accent);
        outline: 2px solid rgba(13, 89, 70, 0.14);
        outline-offset: 1px;
      }

      .checkout-field span {
        display: grid;
        flex: 1;
        gap: 2px;
      }

      .checkout-field small {
        color: var(--text-muted);
        font-size: 11px;
      }

      .checkout-field input {
        width: 100%;
        min-width: 0;
        padding: 0;
        border: 0;
        outline: 0;
        color: var(--text);
        background: transparent;
        font: inherit;
        font-size: 14px;
      }

      .payment-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 14px;
      }

      .payment-grid.has-cash {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .payment-option {
        display: grid;
        grid-template-columns: auto auto minmax(0, 1fr);
        align-items: center;
        gap: 9px;
        min-height: 66px;
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: 13px;
        color: var(--text-secondary);
        background: var(--bg-card);
        text-align: left;
      }

      .payment-option.active {
        border-color: var(--accent);
        color: var(--text);
        outline: 2px solid rgba(13, 89, 70, 0.1);
      }

      .radio-dot {
        display: grid;
        width: 19px;
        height: 19px;
        place-items: center;
        border: 2px solid var(--border);
        border-radius: 999px;
      }

      .payment-option.active .radio-dot {
        border-color: var(--accent);
      }

      .payment-option.active .radio-dot:after {
        width: 7px;
        height: 7px;
        border-radius: inherit;
        background: var(--accent);
        content: "";
      }

      .payment-icon {
        display: grid;
        min-width: 28px;
        color: var(--text-secondary);
      }

      .payment-option strong,
      .payment-option small {
        display: block;
      }

      .payment-option strong {
        font-size: 13px;
      }

      .payment-option small {
        margin-top: 2px;
        color: var(--text-muted);
        font-size: 11px;
      }

      .fawry-logo {
        display: inline-grid;
        min-width: 44px;
        height: 18px;
        place-items: center;
        border-radius: 3px;
        color: #244498;
        background: #ffe01b;
        font-size: 10px;
        font-weight: 900;
      }

      .payment-note {
        margin: 12px 0 0;
        padding: 10px 12px;
        border: 1px solid rgba(13, 89, 70, 0.14);
        border-radius: 12px;
        color: var(--text-secondary);
        background: var(--accent-bg-soft);
        font-size: 12px;
        line-height: 1.45;
      }

      .checkout-side {
        position: sticky;
        top: 18px;
      }

      .order-summary {
        padding: 18px;
      }

      .order-heading h2 {
        margin: 0;
        font-size: 1.05rem;
      }

      .order-heading button {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        border: 0;
        color: var(--text-secondary);
        background: transparent;
        font-size: 12px;
        font-weight: 750;
      }

      .summary-rows {
        display: grid;
        gap: 9px;
        margin-top: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-light);
      }

      .price-row,
      .summary-total {
        display: flex;
        justify-content: space-between;
        gap: 14px;
      }

      .price-row {
        color: var(--text-secondary);
        font-size: 13px;
      }

      .price-row strong {
        color: var(--text);
        font-weight: 750;
      }

      .summary-total {
        align-items: center;
        margin-top: 12px;
        font-size: 1.05rem;
        font-weight: 900;
      }

      .summary-total span {
        color: var(--accent);
      }

      .confirm-button {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        width: 100%;
        min-height: 62px;
        margin-top: 16px;
        padding: 11px 16px;
        border: 0;
        border-radius: 14px;
        color: var(--accent-fg);
        background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        font-size: 1.05rem;
        font-weight: 900;
        letter-spacing: 0.08em;
      }

      .confirm-button small {
        grid-column: 1 / -1;
        display: inline-flex;
        align-items: center;
        justify-self: center;
        gap: 5px;
        margin-top: 3px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0;
        opacity: 0.9;
      }

      .confirm-button svg:first-child,
      .processing-banner svg,
      .state-secondary svg:first-child {
        animation: spin 0.8s linear infinite;
      }

      .processing-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 11px;
        min-height: 48px;
        margin-top: 11px;
        border: 1px solid rgba(13, 89, 70, 0.22);
        border-radius: 12px;
        color: var(--accent);
        background: var(--accent-bg);
        font-size: 14px;
        font-weight: 850;
        letter-spacing: 0.08em;
      }

      .booking-error {
        margin: 12px 0 0;
        padding: 10px 12px;
        border: 1px solid var(--error-border);
        border-radius: 12px;
        color: var(--error);
        background: var(--error-bg);
        font-size: 13px;
      }

      .trust-line {
        display: flex;
        gap: 10px;
        margin-top: 14px;
        padding: 12px;
        border: 1px solid var(--border-light);
        border-radius: 12px;
        color: var(--text-secondary);
        background: var(--accent-bg-soft);
        font-size: 12px;
      }

      .trust-line svg {
        flex: 0 0 auto;
        color: var(--accent);
      }

      .trust-line strong {
        display: block;
        color: var(--accent);
      }

      .booking-state {
        min-height: 72vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        color: var(--text);
        text-align: center;
      }

      .booking-state section {
        width: min(100%, 520px);
        padding: 1.5rem;
        border: 1px solid var(--accent-border);
        border-radius: 16px;
        background: var(--bg-card);
      }

      .booking-success-icon {
        display: inline-grid;
        width: 58px;
        height: 58px;
        place-items: center;
        border-radius: 999px;
        color: var(--accent);
        background: var(--accent-bg);
      }

      .booking-state h1 {
        margin: 14px 0 7px;
        font-size: 1.55rem;
      }

      .booking-state p {
        margin: 0 auto 20px;
        max-width: 420px;
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.65;
      }

      .state-actions {
        display: grid;
        gap: 9px;
      }

      .state-primary,
      .state-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 44px;
        border-radius: 12px;
        font-weight: 800;
        text-decoration: none;
      }

      .state-primary {
        color: var(--accent-fg);
        background: var(--accent);
      }

      .state-secondary {
        border: 1px solid var(--border);
        color: var(--text);
        background: var(--bg-card);
      }

      @media (max-width: 900px) {
        .booking-shell {
          max-width: 540px;
          padding: 14px 10px 28px;
        }

        .checkout-layout {
          grid-template-columns: 1fr;
        }

        .checkout-side {
          position: static;
        }

        .class-summary-card {
          grid-template-columns: 106px minmax(0, 1fr) auto;
          gap: 12px;
          padding: 10px;
        }

        .class-thumb {
          min-height: 116px;
        }

        .class-info h1 {
          font-size: 1.1rem;
        }

        .class-info p {
          font-size: 12px;
        }

        .class-meta {
          gap: 8px 12px;
          font-size: 11px;
        }

        .class-price strong {
          font-size: 1.1rem;
        }
      }

      @media (max-width: 560px) {
        .booking-page {
          background: linear-gradient(180deg, #fbfaf6, var(--bg));
        }

        .booking-shell {
          padding-inline: 8px;
        }

        .booking-topbar {
          margin-bottom: 14px;
        }

        .booking-steps {
          margin-bottom: 12px;
        }

        .checkout-card {
          padding: 14px 10px;
          border-radius: 14px;
        }

        .class-summary-card {
          grid-template-columns: 106px minmax(0, 1fr) auto;
          align-items: stretch;
          border-radius: 14px;
        }

        .class-price {
          text-align: right;
        }

        .class-meta span {
          min-width: max-content;
        }

        .date-button {
          font-size: 14px;
        }

        .legend-row {
          gap: 12px 14px;
          font-size: 10px;
        }

        .time-row {
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
        }

        .time-button {
          min-height: 38px;
          padding: 0 4px;
          font-size: 12px;
        }

        .payment-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .payment-grid.has-cash {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .payment-option {
          grid-template-columns: auto minmax(0, 1fr);
          min-height: 56px;
          gap: 7px;
          padding: 8px;
        }

        .payment-icon {
          display: none;
        }

        .payment-option strong {
          font-size: 11px;
        }

        .payment-option small {
          font-size: 9px;
        }

        .order-summary {
          padding: 14px 12px;
          border-radius: 14px;
        }

        .confirm-button {
          min-height: 60px;
          font-size: 1rem;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .confirm-button svg:first-child,
        .processing-banner svg,
        .state-secondary svg:first-child {
          animation: none;
        }
      }
    `}</style>
  );
}
