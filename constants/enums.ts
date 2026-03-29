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

export type Category = typeof JOB_ENUMS.category[number];
export type WorkMode = typeof JOB_ENUMS.workMode[number];
export type JobType = typeof JOB_ENUMS.jobType[number];
export type Level = typeof JOB_ENUMS.level[number];