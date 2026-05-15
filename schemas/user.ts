import { z } from "zod";

export const UserRegisterSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
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
  newPassword:     z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: "New password must differ from current", path: ["newPassword"] }
);

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type UserUpdateInput   = z.infer<typeof UserUpdateSchema>;
