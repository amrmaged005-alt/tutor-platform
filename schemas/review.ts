import { z } from "zod";

export const ReviewCreateSchema = z.object({
  classId: z.string().cuid("Invalid class ID"),
  rating:  z.number().int().min(1, "Min rating is 1").max(5, "Max rating is 5"),
  comment: z.string().max(1000, "Comment too long").optional(),
});

export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;