export const JOB_ENUMS = {
  category: [
    "FMCG",
    "Manufacturing & Production",
    "Oil, Gas & Energy",
    "Banking, Finance & Insurance",
    "Technology & ICT",
    "Legal, Compliance & Audit",
    "Real Estate & Construction",
    "Consulting & Strategy",
    "Supply Chain, Procurement & Logistics",
    "Human Resources & Admin",
    "Sales, Marketing & Retail",
    "Customer Service & Support",
    "Healthcare & Pharmaceuticals",
    "Hospitality, Travel & Tourism",
    "Education & Training",
    "Engineering (Non-IT)",
    "NGO & Non-Profit",
    "Other"
  ],
  workMode: ["On-site", "Hybrid", "Remote"],
  jobType: ["Full-time", "Part-time", "Contract", "Temporary", "Internship"],
  level: ["Entry", "Junior", "Mid", "Senior", "Lead", "Manager", "Executive"]
} as const;

export const JOB_STATUSES = ["Draft", "Open", "Closed"] as const;
export const APPLICATION_STATUSES = ["pending", "reviewed", "shortlisted", "rejected"] as const;
export const BLOG_STATUSES = ["Draft", "Published"] as const;
export const USER_ROLES = ["user", "admin", "recruiter", "super-admin"] as const;
export const USER_GENDERS = ["male", "female", "other"] as const;
export const USER_MARITAL_STATUSES = ["single", "married", "divorced", "widowed"] as const;
export const USER_NYSC_STATUSES = ["completed", "exempted", "not-started"] as const;

export type Category = typeof JOB_ENUMS.category[number];
export type WorkMode = typeof JOB_ENUMS.workMode[number];
export type JobType = typeof JOB_ENUMS.jobType[number];
export type Level = typeof JOB_ENUMS.level[number];
export type JobStatus = typeof JOB_STATUSES[number];
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];
export type BlogStatus = typeof BLOG_STATUSES[number];
export type UserRole = typeof USER_ROLES[number];
export type UserGender = typeof USER_GENDERS[number];
export type UserMaritalStatus = typeof USER_MARITAL_STATUSES[number];
export type UserNyscStatus = typeof USER_NYSC_STATUSES[number];
