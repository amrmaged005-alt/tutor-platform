import { z } from "zod";

export const BookingCreateSchema = z.object({
  classId: z.string().cuid("Invalid class ID"),
  notes: z.string().max(500, "Note too long").optional(),
});

export const BookingCancelSchema = z.object({
  bookingId: z.string().cuid("Invalid booking ID"),
  reason: z.string().max(300).optional(),
});

export type BookingCreateInput = z.infer<typeof BookingCreateSchema>;
export type BookingCancelInput = z.infer<typeof BookingCancelSchema>;