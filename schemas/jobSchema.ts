// schemas/jobSchema.ts
import { z } from "zod"

export const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum([
    'FMCG',
    'Manufacturing & Production',
    'Oil, Gas & Energy',
    'Banking, Finance & Insurance',
    'Technology & ICT',
    'Legal, Compliance & Audit',
    'Real Estate & Construction',
    'Consulting & Strategy',
    'Supply Chain, Procurement & Logistics',
    'Human Resources & Admin',
    'Sales, Marketing & Retail',
    'Customer Service & Support',
    'Healthcare & Pharmaceuticals',
    'Hospitality, Travel & Tourism',
    'Education & Training',
    'Engineering (Non-IT)',
    'NGO & Non-Profit',
    'Other'
  ]),
  location: z.string().min(1, "Location is required"),
  workMode: z.enum(["On-site", "Hybrid", "Remote"]),
  jobType: z.string().optional(),
  level: z.enum(["Internship", "Entry", "Junior", "Mid", "Senior", "Lead", "Manager", "Executive"]).optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default("NGN")
  }),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  experience: z.number().min(0, "Experience is required"),
  skills: z.array(z.string()).optional(),
  applyLink: z.string().url().optional(),
  deadline: z.string().optional(),
  status: z.enum(["Draft", "Open", "Closed"]).default("Open"),
  company: z.object({
    name: z.string().min(1, "Company name is required"),
    logo: z.string().optional(),
    website: z.string().url().optional()
  })
})

export type JobFormType = z.infer<typeof jobFormSchema>