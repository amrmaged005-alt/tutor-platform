import { z } from "zod";

const ClassFormatEnum  = z.enum(["IN_PERSON", "ONLINE", "HYBRID"]);
const CurriculumEnum   = z.enum(["NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM", "OTHER"]);

export const ClassCreateSchema = z.object({
  title:       z.string().min(3, "Title too short").max(120, "Title too long"),
  subject:     z.string().min(1, "Subject required"),
  description: z.string().max(2000).optional(),
  city:        z.string().min(1, "City required"),
  location:    z.string().max(200).optional(),
  priceEgp:    z.number().int().min(0, "Price cannot be negative").max(100000),
  capacity:    z.number().int().min(1).max(1000).optional(),
  schedule:    z.string().max(300).optional(),
  format:      ClassFormatEnum,
  curriculum:  CurriculumEnum,
  gradeLevel:  z.string().max(50).optional(),
  language:    z.string().default("Arabic"),
  centerId:    z.string().cuid().optional(),
});

export const ClassUpdateSchema = ClassCreateSchema.partial();

export type ClassCreateInput = z.infer<typeof ClassCreateSchema>;
export type ClassUpdateInput = z.infer<typeof ClassUpdateSchema>;