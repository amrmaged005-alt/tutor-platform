import { z } from "zod";

// 20 most common passwords — rejected regardless of length/complexity.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890",
  "qwerty123", "qwertyuiop", "111111111", "abc12345", "iloveyou1", "admin123",
  "welcome1", "welcome123", "letmein1", "monkey123", "dragon123", "sunshine1",
  "princess1", "football1",
]);

/**
 * Shared strong-password policy: 8–72 chars, at least one uppercase letter and
 * one number, and not in the common-password blocklist (case-insensitive).
 */
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), {
    message: "This password is too common. Please choose a stronger one.",
  });

export const UserRegisterSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: passwordSchema,
  fullName: z.string().min(2, "Name too short").max(100, "Name too long"),
  role:     z.enum(["STUDENT", "TUTOR", "CENTER_ADMIN"]).default("STUDENT"),
});

export const UserUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  bio:      z.string().max(1000).optional(),
  phone:    z.string().max(20).optional(),
  subjects: z.array(z.string()).max(10).optional(),
  city:     z.string().max(100).optional(),
});

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword:     passwordSchema,
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: "New password must differ from current", path: ["newPassword"] }
);

export const PasswordResetSchema = z.object({
  token:    z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type UserUpdateInput   = z.infer<typeof UserUpdateSchema>;
