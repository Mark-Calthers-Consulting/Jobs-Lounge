export type JobDetailField = 'benefits' | 'responsibilities' | 'requirements' | 'skills'

type SuggestionContext = {
  category: string
  jobType: string
  level: string
  workMode: string
}

type CategorySuggestions = Partial<Record<JobDetailField, readonly string[]>>

const commonSuggestions: Record<JobDetailField, readonly string[]> = {
  responsibilities: [
    'Collaborate with cross-functional teams to deliver agreed objectives',
    'Track performance and provide clear, timely reports',
    'Maintain accurate records and process documentation',
    'Identify opportunities to improve processes and outcomes',
    'Communicate progress, risks, and priorities to relevant stakeholders',
  ],
  requirements: [
    'Strong written and verbal communication skills',
    'Ability to organise work and manage competing priorities',
    'Demonstrated attention to detail and sound judgement',
    'Ability to work independently and as part of a team',
    'Proficiency with Microsoft Office or Google Workspace',
  ],
  skills: [
    'Communication',
    'Problem solving',
    'Time management',
    'Teamwork',
    'Attention to detail',
  ],
  benefits: [
    'Competitive salary',
    'Health insurance',
    'Paid annual leave',
    'Learning and development support',
    'Performance-based bonus',
    'Pension contributions',
    'Career progression opportunities',
    'Employee wellbeing support',
  ],
}

const categorySuggestions: Record<string, CategorySuggestions> = {
  FMCG: {
    responsibilities: [
      'Build and maintain productive relationships with distributors and retailers',
      'Monitor product availability, visibility, and sales performance',
      'Support route-to-market and in-store execution activities',
    ],
    requirements: [
      'Experience working with distributors, retailers, or consumer products',
      'Understanding of route-to-market and merchandising principles',
    ],
    skills: ['FMCG sales', 'Merchandising', 'Route-to-market execution', 'Trade marketing'],
  },
  'Manufacturing & Production': {
    responsibilities: [
      'Monitor production output, quality, and adherence to schedule',
      'Follow safety, quality, and operating procedures',
      'Support preventive maintenance and continuous-improvement activities',
    ],
    requirements: [
      'Experience in a manufacturing or production environment',
      'Working knowledge of workplace health and safety procedures',
    ],
    skills: ['Production planning', 'Quality control', 'Lean manufacturing', 'Equipment operation'],
  },
  'Oil, Gas & Energy': {
    responsibilities: [
      'Support safe and compliant delivery of operational activities',
      'Monitor operational performance and escalate risks promptly',
      'Maintain accurate technical and regulatory documentation',
    ],
    requirements: [
      'Knowledge of relevant safety and regulatory requirements',
      'Experience in energy, utilities, or industrial operations',
    ],
    skills: ['HSE compliance', 'Technical reporting', 'Risk assessment', 'Asset operations'],
  },
  'Banking, Finance & Insurance': {
    responsibilities: [
      'Review financial information and prepare accurate reports',
      'Ensure transactions and records comply with internal controls',
      'Support budgeting, forecasting, or portfolio monitoring activities',
    ],
    requirements: [
      'Understanding of financial controls and regulatory requirements',
      'Strong numerical and analytical ability',
    ],
    skills: ['Financial analysis', 'Risk management', 'Microsoft Excel', 'Financial reporting'],
  },
  'Technology & ICT': {
    responsibilities: [
      'Design, build, test, and maintain reliable technical solutions',
      'Investigate issues and deliver well-documented fixes',
      'Participate in code reviews and technical planning',
    ],
    requirements: [
      'Experience delivering production software or technology services',
      'Understanding of software development and version-control practices',
    ],
    skills: ['Software development', 'Git', 'API integration', 'Technical troubleshooting'],
  },
  'Legal, Compliance & Audit': {
    responsibilities: [
      'Review policies, controls, and records for regulatory compliance',
      'Document findings and recommend practical corrective actions',
      'Monitor changes in applicable laws and regulatory guidance',
    ],
    requirements: [
      'Knowledge of relevant legal, audit, or compliance frameworks',
      'Ability to analyse evidence and communicate findings objectively',
    ],
    skills: ['Compliance monitoring', 'Internal audit', 'Risk assessment', 'Policy review'],
  },
  'Real Estate & Construction': {
    responsibilities: [
      'Coordinate project activities, contractors, and delivery timelines',
      'Monitor site progress, quality, cost, and safety compliance',
      'Maintain project records and communicate delivery risks',
    ],
    requirements: [
      'Experience supporting property or construction projects',
      'Understanding of construction safety and quality standards',
    ],
    skills: ['Project coordination', 'Site supervision', 'Cost control', 'Property management'],
  },
  'Consulting & Strategy': {
    responsibilities: [
      'Structure ambiguous problems and develop evidence-based recommendations',
      'Conduct research, analysis, and stakeholder interviews',
      'Prepare clear client presentations and implementation plans',
    ],
    requirements: [
      'Strong analytical, research, and presentation ability',
      'Experience managing stakeholders or client-facing work',
    ],
    skills: ['Business analysis', 'Strategic planning', 'Stakeholder management', 'Presentation design'],
  },
  'Supply Chain, Procurement & Logistics': {
    responsibilities: [
      'Coordinate procurement, inventory, and delivery activities',
      'Monitor supplier performance, cost, and service levels',
      'Maintain accurate purchase, stock, and logistics records',
    ],
    requirements: [
      'Experience in procurement, inventory, warehousing, or logistics',
      'Understanding of supplier and inventory-management processes',
    ],
    skills: ['Procurement', 'Inventory management', 'Supplier management', 'Logistics planning'],
  },
  'Human Resources & Admin': {
    responsibilities: [
      'Coordinate employee records, documentation, and people processes',
      'Support recruitment, onboarding, and employee-engagement activities',
      'Respond to staff enquiries accurately and confidentially',
    ],
    requirements: [
      'Experience supporting HR, office, or administrative operations',
      'Ability to handle sensitive information with discretion',
    ],
    skills: ['Recruitment', 'HR administration', 'Employee relations', 'Records management'],
  },
  'Sales, Marketing & Retail': {
    responsibilities: [
      'Develop and manage a healthy pipeline of prospective customers',
      'Deliver sales or campaign targets and report performance',
      'Build strong customer relationships and identify growth opportunities',
    ],
    requirements: [
      'Demonstrated experience meeting sales or marketing targets',
      'Strong customer engagement and negotiation ability',
    ],
    skills: ['Sales', 'Digital marketing', 'Negotiation', 'Customer relationship management'],
  },
  'Customer Service & Support': {
    responsibilities: [
      'Respond to customer enquiries clearly, accurately, and promptly',
      'Resolve issues or escalate them through the appropriate channels',
      'Record customer interactions and identify recurring service issues',
    ],
    requirements: [
      'Experience in a customer-facing or support role',
      'Ability to remain calm and helpful when resolving complaints',
    ],
    skills: ['Customer support', 'Complaint resolution', 'Active listening', 'CRM software'],
  },
  'Healthcare & Pharmaceuticals': {
    responsibilities: [
      'Deliver services in line with clinical, quality, and safety procedures',
      'Maintain accurate and confidential patient or product records',
      'Collaborate with healthcare professionals and operational teams',
    ],
    requirements: [
      'Relevant professional registration or licence where required',
      'Knowledge of healthcare quality, safety, and confidentiality standards',
    ],
    skills: ['Patient care', 'Clinical documentation', 'Quality assurance', 'Healthcare compliance'],
  },
  'Hospitality, Travel & Tourism': {
    responsibilities: [
      'Deliver a consistently welcoming and professional guest experience',
      'Coordinate bookings, requests, and service recovery',
      'Maintain service, hygiene, and safety standards',
    ],
    requirements: [
      'Experience in hospitality, travel, events, or guest services',
      'Flexibility to work operational shifts where required',
    ],
    skills: ['Guest relations', 'Reservations', 'Event coordination', 'Service recovery'],
  },
  'Education & Training': {
    responsibilities: [
      'Plan and deliver engaging learning activities',
      'Assess progress and provide constructive feedback',
      'Maintain accurate learning records and safeguarding standards',
    ],
    requirements: [
      'Relevant teaching, facilitation, or subject-matter experience',
      'Ability to explain concepts clearly to different audiences',
    ],
    skills: ['Teaching', 'Curriculum development', 'Facilitation', 'Learning assessment'],
  },
  'Engineering (Non-IT)': {
    responsibilities: [
      'Develop, review, or maintain engineering designs and specifications',
      'Monitor technical quality, safety, cost, and delivery requirements',
      'Investigate technical issues and recommend practical solutions',
    ],
    requirements: [
      'Relevant engineering qualification or professional experience',
      'Knowledge of applicable engineering codes and safety standards',
    ],
    skills: ['Engineering design', 'Technical drawings', 'Root-cause analysis', 'Project engineering'],
  },
  'NGO & Non-Profit': {
    responsibilities: [
      'Coordinate programme activities, partners, and delivery milestones',
      'Monitor outcomes and prepare accurate donor or programme reports',
      'Engage communities and stakeholders respectfully and inclusively',
    ],
    requirements: [
      'Experience in programme delivery, development, or community engagement',
      'Understanding of safeguarding and accountability principles',
    ],
    skills: ['Programme management', 'Monitoring and evaluation', 'Community engagement', 'Grant reporting'],
  },
}

const contextualSuggestions = ({ jobType, level, workMode }: SuggestionContext): CategorySuggestions => ({
  requirements: [
    ...(level === 'Entry' || level === 'Junior'
      ? ['Applications from early-career candidates with relevant practical experience are welcome']
      : []),
    ...(level === 'Senior' || level === 'Lead' || level === 'Manager' || level === 'Executive'
      ? ['Evidence of leading complex work and supporting less-experienced colleagues']
      : []),
    ...(jobType === 'Contract' || jobType === 'Temporary'
      ? ['Availability to work for the stated contract period']
      : []),
    ...(workMode === 'Remote'
      ? ['Reliable internet access and the ability to work effectively in a remote environment']
      : []),
  ],
  skills: [
    ...(workMode === 'Remote' ? ['Remote collaboration'] : []),
    ...(level === 'Manager' || level === 'Executive' ? ['People leadership', 'Decision making'] : []),
  ],
  benefits: [
    ...(workMode === 'Remote' ? ['Remote-work support'] : []),
    ...(workMode === 'Hybrid' ? ['Flexible hybrid working'] : []),
    ...(jobType === 'Internship' ? ['Structured mentorship', 'Practical industry experience'] : []),
  ],
})

const unique = (items: readonly string[]) => Array.from(new Set(items))

export const getJobDetailSuggestions = (
  field: JobDetailField,
  context: SuggestionContext,
) => {
  const category = categorySuggestions[context.category]?.[field] ?? []
  const contextual = contextualSuggestions(context)[field] ?? []

  return unique([...category, ...contextual, ...commonSuggestions[field]])
}
