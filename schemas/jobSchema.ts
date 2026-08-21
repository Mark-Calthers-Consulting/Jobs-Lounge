// schemas/jobSchema.ts
import { z } from "zod"
import { JOB_ENUMS, JOB_STATUSES } from "@/constants/enums"

const optionalUrl = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().url().optional(),
)

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/

const optionalDeadline = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().refine(
    (value) => dateOnlyPattern.test(value) || z.string().datetime().safeParse(value).success,
    'Deadline must be a calendar date or ISO timestamp',
  ).optional(),
)

export const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().trim().min(50, "Description must be at least 50 characters"),
  category: z.enum(JOB_ENUMS.category),
  location: z.string().min(1, "Location is required"),
  workMode: z.enum(JOB_ENUMS.workMode),
  jobType: z.enum(JOB_ENUMS.jobType),
  level: z.enum(JOB_ENUMS.level),
  salary: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().nonnegative().optional(),
    currency: z.string().default("NGN")
  }).refine(
    ({ min, max }) => min === undefined || max === undefined || max >= min,
    { message: "Maximum salary must be greater than or equal to minimum salary", path: ["max"] },
  ),
  responsibilities: z.array(z.string().trim().min(1)).min(1, "Add at least one responsibility"),
  requirements: z.array(z.string().trim().min(1)).min(1, "Add at least one requirement"),
  benefits: z.array(z.string().trim().min(1)).min(1, "Add at least one benefit"),
  experience: z.number().int().min(0, "Experience must be zero or greater"),
  skills: z.array(z.string().trim().min(1)).min(1, "Add at least one required skill"),
  applyLink: optionalUrl,
  deadline: optionalDeadline,
  status: z.enum(JOB_STATUSES).default("Draft"),
  company: z.object({
    name: z.string().min(1, "Company name is required"),
    logo: optionalUrl,
    website: optionalUrl,
  })
})

export type JobFormInput = z.input<typeof jobFormSchema>
export type JobFormType = z.output<typeof jobFormSchema>
