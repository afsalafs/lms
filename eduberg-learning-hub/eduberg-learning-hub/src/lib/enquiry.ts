import { z } from "zod";

export const COURSE_OPTIONS = [
  "Diploma in AI (6 months)",
  "Diploma in Robotics (6 months)",
  "Master Diploma in AI & Robotics (6 months)",
  "BCA with AI & Robotics (3 years)",
  "Add-On Courses for Colleges",
  "R&D Lab internship",
] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  phone: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || undefined)
    .optional(),
  course: z.enum(COURSE_OPTIONS),
  message: z
    .string()
    .trim()
    .max(4000)
    .transform((value) => value || undefined)
    .optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
