"use client";

import { useState, useEffect } from "react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: {
    fullName: string | null;
    name: string | null;
    photoUrl: string | null;
  };
}

interface ReviewSectionProps {
  classId: string;
  isEligible: boolean;
  existingUserReview?: { rating: number; comment: string | null } | null;
}

import { motion, AnimatePresence } from "framer-motion";

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.span
          key={star}
          whileHover={!readonly ? { scale: 1.2 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? "20px" : "32px",
            cursor: readonly ? "default" : "pointer",
            color: star <= (hovered || value) ? "var(--rating)" : "var(--text-secondary)",
            transition: "color 0.15s, transform 0.1s",
            lineHeight: 1,
            textShadow: star <= (hovered || value) ? "0 0 12px rgba(251, 191, 36, 0.4)" : "none",
          }}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}

export default function ReviewSection({
  classId,
  isEligible,
  existingUserReview,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(existingUserReview?.rating ?? 0);
  const [comment, setComment] = useState(existingUserReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?classId=${classId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [classId, submitted]);

  async function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, rating, comment }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      setShowForm(false);
    } else {
      const d = await res.json();
      setError(d.error ?? "Something went wrong.");
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section style={{ marginTop: "48px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 style={{ color: "var(--text)", fontSize: "22px", margin: 0 }}>
            Reviews
          </h2>
          {reviews.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "6px",
              }}
            >
              <StarRating value={Math.round(avgRating)} readonly />
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                {avgRating.toFixed(1)} out of 5 ({reviews.length} review
                {reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {isEligible && !showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(13,89,70,0.25)",
            }}
          >
            {existingUserReview || submitted ? "Edit Your Review" : "Write a Review"}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showForm && isEligible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "linear-gradient(to bottom right, var(--text), var(--text))",
              border: "1px solid rgba(13,89,70,0.25)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              overflow: "hidden"
            }}
          >
            <h3 style={{ color: "var(--text)", marginTop: 0, marginBottom: "16px" }}>
              {existingUserReview || submitted ? "Update Your Review" : "Your Review"}
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience..."
                style={{
                  width: "100%",
                  background: "var(--text)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "10px",
                  color: "var(--text)",
                  padding: "12px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <p style={{ color: "var(--error)", fontSize: "14px", marginBottom: "12px" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 24px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "10px",
                  padding: "10px 24px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          No reviews yet.{isEligible ? " Be the first to leave one!" : ""}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {reviews.map((review, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={review.id}
              style={{
                background: "var(--text)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    flexShrink: 0,
                  }}
                >
                  {(review.student.fullName || review.student.name || "?")[0].toUpperCase()}
                </div>

                <div>
                  <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "15px" }}>
                    {review.student.fullName || review.student.name || "Student"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div style={{ marginLeft: "auto", alignSelf: "flex-start", marginTop: "4px" }}>
                  <StarRating value={review.rating} readonly />
                </div>
              </div>

              {review.comment && (
                <p
                  style={{
                    color: "var(--text-muted)",
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: 1.6,
                  }}
                >
                  {review.comment}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}