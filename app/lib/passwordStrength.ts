export type PasswordStrength = "weak" | "fair" | "strong";

export interface PasswordStrengthResult {
  level: PasswordStrength;
  score: number; // 0–4
  label: string;
}

// Lightweight client-side estimate — mirrors the server policy in
// schemas/user.ts (8+ chars, uppercase, number) plus length/variety bonuses.
// This is UX guidance only; the server is the source of truth.
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { level: "weak", score: 0, label: "Too short" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length < 8 || score <= 2) return { level: "weak", score, label: "Weak" };
  if (score === 3) return { level: "fair", score, label: "Fair" };
  return { level: "strong", score, label: "Strong" };
}
