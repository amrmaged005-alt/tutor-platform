"use client";

import { useTransition } from "react";

export default function CancelBookingButton({
  bookingId,
  cancelAction,
}: {
  bookingId: string;
  cancelAction: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    const formData = new FormData();
    formData.set("bookingId", bookingId);
    startTransition(() => cancelAction(formData));
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      style={{
        background: "transparent",
        border: "1px solid #f87171",
        color: "#f87171",
        borderRadius: 8,
        padding: "4px 12px",
        fontSize: 12,
        cursor: pending ? "not-allowed" : "pointer",
        fontWeight: 600,
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? "Cancelling…" : "Cancel Booking"}
    </button>
  );
}