import { z } from "zod";

export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
  phone:    z.string().regex(/^(\+20|0)?1[0125]\d{8}$/, "Invalid Egyptian phone number").optional().or(z.literal("")),
  role:     z.enum(["STUDENT", "TUTOR", "CENTER_ADMIN"]),
});

export const createClassSchema = z.object({
  title:          z.string().min(5, "Title must be at least 5 characters"),
  subject:        z.string().min(1, "Subject is required"),
  description:    z.string().optional(),
  priceEgp:       z.number().min(0, "Price cannot be negative"),
  capacity:       z.number().min(1).max(200, "Capacity must be between 1 and 200"),
  sessionDays:    z.array(z.string()).min(1, "Select at least one day"),
  sessionTimeFrom: z.string().min(1, "Start time is required"),
  sessionTimeTo:   z.string().min(1, "End time is required"),
  recurrence:     z.enum(["weekly", "biweekly", "once"]),
});

export const tutorEditSchema = z.object({
  bio:      z.string().max(500, "Bio must be under 500 characters").optional(),
  subjects: z.array(z.string()).min(1, "Select at least one subject"),
  phone:    z.string().optional(),
});

export type LoginInput      = z.infer<typeof loginSchema>;
export type SignupInput      = z.infer<typeof signupSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type TutorEditInput   = z.infer<typeof tutorEditSchema>;
