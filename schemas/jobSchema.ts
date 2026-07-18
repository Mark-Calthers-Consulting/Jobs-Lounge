// schemas/jobSchema.ts
import { z } from "zod"
import { JOB_ENUMS, JOB_STATUSES } from "@/constants/enums"

const optionalUrl = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().url().optional(),
)

const optionalIsoDate = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().datetime().optional(),
)

export const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
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
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  experience: z.number().int().min(0, "Experience must be zero or greater"),
  skills: z.array(z.string()).default([]),
  applyLink: optionalUrl,
  deadline: optionalIsoDate,
  status: z.enum(JOB_STATUSES).default("Open"),
  company: z.object({
    name: z.string().min(1, "Company name is required"),
    logo: optionalUrl,
    website: optionalUrl,
  })
})

export type JobFormInput = z.input<typeof jobFormSchema>
export type JobFormType = z.output<typeof jobFormSchema>
