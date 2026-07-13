export const EXAM_FAMILIES = ['SSC', 'Banking', 'Railway', 'Punjab State'] as const;
export type ExamFamily = (typeof EXAM_FAMILIES)[number];

export interface Exam { code: string; name: string; family: ExamFamily; stages: string[]; languages: string[] }

export const EXAMS: Exam[] = [
  { code: 'SSC_CGL_T1', name: 'SSC CGL Tier 1', family: 'SSC', stages: ['Tier 1', 'Tier 2', 'Document Verification'], languages: ['English', 'Hindi'] },
  { code: 'SSC_CHSL_T1', name: 'SSC CHSL Tier 1', family: 'SSC', stages: ['Tier 1', 'Tier 2', 'Skill Test'], languages: ['English', 'Hindi'] },
  { code: 'SSC_MTS', name: 'SSC MTS', family: 'SSC', stages: ['Session 1', 'Session 2', 'PET/PST'], languages: ['English', 'Hindi'] },
  { code: 'IBPS_PO_PRE', name: 'IBPS PO Prelims', family: 'Banking', stages: ['Prelims', 'Mains', 'Interview'], languages: ['English', 'Hindi'] },
  { code: 'IBPS_CLERK_PRE', name: 'IBPS Clerk Prelims', family: 'Banking', stages: ['Prelims', 'Mains'], languages: ['English', 'Hindi'] },
  { code: 'RRB_NTPC_CBT1', name: 'RRB NTPC CBT 1', family: 'Railway', stages: ['CBT 1', 'CBT 2', 'Typing Skill', 'Document Verification'], languages: ['English', 'Hindi'] },
  { code: 'RRB_GROUP_D', name: 'RRB Group D', family: 'Railway', stages: ['CBT', 'PET', 'Document Verification'], languages: ['English', 'Hindi'] },
  { code: 'PUNJAB_PSSSB_CLERK', name: 'Punjab PSSSB Clerk', family: 'Punjab State', stages: ['Written Exam', 'Typing Test'], languages: ['English', 'Punjabi'] },
  { code: 'PUNJAB_EXCISE_INSP', name: 'Punjab Excise Inspector', family: 'Punjab State', stages: ['Written Exam', 'Interview'], languages: ['English', 'Punjabi'] },
];

export const SUBJECTS = ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness', 'Computer Knowledge', 'Punjabi Language', 'Current Affairs'] as const;
export const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Expert'] as const;
export const LANGUAGES = ['English', 'Hindi', 'Punjabi'] as const;
export const QUESTION_TYPES = ['MCQ Single', 'MCQ Multiple', 'Fill in the Blank', 'Match the Following', 'Assertion-Reason'] as const;
export const QUESTION_STATUSES = ['Draft', 'Under Review', 'Needs Fix', 'Approved', 'Rejected', 'Archived'] as const;
export const TEST_STATUSES = ['Draft', 'Content Ready', 'Under QA', 'Scheduled', 'Live', 'Completed', 'Archived'] as const;
export const TEST_TYPES = ['Full Mock', 'Sectional Mock', 'Topic Test', 'Previous Year', 'Daily Quiz'] as const;

export const ADMIN_NAMES = ['Ravneet Thind', 'Harpreet Kaur', 'Simran Singh', 'Arjun Mehta', 'Manpreet Gill', 'Deepak Sharma', 'Neha Verma', 'Karan Bedi', 'Rohit Khanna', 'Anjali Bansal'];
export const REVIEWERS = ['Simran Singh', 'Neha Verma', 'Anjali Bansal', 'Karan Bedi'];
