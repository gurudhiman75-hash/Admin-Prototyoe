import { EXAMS, ADMIN_NAMES, REVIEWERS } from './exams';

export interface Student {
  id: string; name: string; phone: string; email: string;
  targetExam: string; language: string; registeredOn: string; lastActive: string;
  activePackages: number; testsAttempted: number; avgScore: number;
  status: 'Active' | 'Inactive' | 'Suspended';
}

const FIRST = ['Harleen', 'Gurpreet', 'Manjit', 'Sukhdeep', 'Rajveer', 'Parneet', 'Jagpreet', 'Navleen', 'Dilpreet', 'Simarjeet', 'Amandeep', 'Komalpreet', 'Harsimran', 'Ravleen', 'Jaspreet', 'Taniya', 'Rohit', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Sahil', 'Ishpreet'];
const LAST = ['Kaur', 'Singh', 'Sharma', 'Kumar', 'Gupta', 'Reddy', 'Verma', 'Bhatia', 'Gill', 'Bedi', 'Khanna', 'Bansal', 'Mehta', 'Arora'];
const EXAM_NAMES = EXAMS.map((e) => e.name);
const LANGS = ['English', 'Hindi', 'Punjabi'];

export const STUDENTS: Student[] = Array.from({ length: 60 }).map((_, i) => ({
  id: `STU-${(30000 + i).toString()}`,
  name: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
  phone: `+91 ${90 + (i % 10)}${(10000000 + i * 137).toString().slice(0, 8)}`,
  email: `${FIRST[i % FIRST.length].toLowerCase()}.${LAST[i % LAST.length].toLowerCase()}${i}@gmail.com`,
  targetExam: EXAM_NAMES[i % EXAM_NAMES.length], language: LANGS[i % LANGS.length],
  registeredOn: new Date(Date.now() - i * 86400000 * 4).toISOString().slice(0, 10),
  lastActive: new Date(Date.now() - (i % 14) * 3600000).toISOString().slice(0, 16).replace('T', ' '),
  activePackages: i % 4, testsAttempted: (i * 7) % 90, avgScore: 40 + ((i * 13) % 55),
  status: i % 11 === 0 ? 'Suspended' : i % 6 === 0 ? 'Inactive' : 'Active',
}));

export interface AdminMember {
  id: string; name: string; email: string; role: string; permissions: string[];
  lastActive: string; assignedWork: number; status: 'Active' | 'Inactive'; avatar: string;
}

export const ADMIN_ROLES = ['Super Admin', 'Content Manager', 'Question Author', 'Reviewer', 'Test Manager', 'Support Agent', 'Finance Admin', 'Marketing Admin', 'Analyst', 'Read-only Auditor'];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Super Admin': ['all'],
  'Content Manager': ['questions.read', 'questions.write', 'tests.read', 'tests.write', 'review.approve', 'review.reject', 'taxonomy.manage'],
  'Question Author': ['questions.read', 'questions.write', 'studio.use'],
  'Reviewer': ['questions.read', 'review.approve', 'review.reject', 'review.comment'],
  'Test Manager': ['tests.read', 'tests.write', 'series.manage', 'blueprints.manage', 'publish.schedule'],
  'Support Agent': ['support.read', 'support.write', 'students.read', 'notifications.send'],
  'Finance Admin': ['orders.read', 'orders.refund', 'packages.manage', 'coupons.manage', 'entitlements.manage'],
  'Marketing Admin': ['notifications.send', 'packages.manage', 'coupons.manage', 'branding.manage'],
  'Analyst': ['analytics.read', 'reports.export'],
  'Read-only Auditor': ['audit.read', 'analytics.read'],
};

export const ADMIN_TEAM: AdminMember[] = ADMIN_NAMES.map((name, i) => ({
  id: `ADM-${(10 + i).toString()}`, name,
  email: `${name.toLowerCase().replace(/\s/g, '.')}@examtree.in`,
  role: ADMIN_ROLES[i % ADMIN_ROLES.length],
  permissions: ROLE_PERMISSIONS[ADMIN_ROLES[i % ADMIN_ROLES.length]] ?? [],
  lastActive: new Date(Date.now() - i * 3600000 * 3).toISOString().slice(0, 16).replace('T', ' '),
  assignedWork: [0, 18, 24, 12, 8, 7, 0, 0, 0, 0][i % 10],
  status: i % 7 === 0 ? 'Inactive' : 'Active',
  avatar: name.split(' ').map((p) => p[0]).slice(0, 2).join(''),
}));

export interface SupportRequest {
  id: string; type: 'Wrong Answer' | 'Unclear Wording' | 'Translation Issue' | 'Payment Issue' | 'Access Issue' | 'Technical Issue';
  studentName: string; studentId: string; relatedTest: string; relatedQuestion: string | null;
  language: string; priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'Investigating' | 'Waiting for User' | 'Corrected' | 'Rejected' | 'Resolved';
  assignedAgent: string | null; createdAt: string;
}

const SUPPORT_TYPES: SupportRequest['type'][] = ['Wrong Answer', 'Unclear Wording', 'Translation Issue', 'Payment Issue', 'Access Issue', 'Technical Issue'];
const PRIORITIES: SupportRequest['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
const SUPPORT_STATUSES: SupportRequest['status'][] = ['New', 'Investigating', 'Waiting for User', 'Corrected', 'Rejected', 'Resolved'];

export const SUPPORT_REQUESTS: SupportRequest[] = Array.from({ length: 28 }).map((_, i) => ({
  id: `SR-${(800 + i).toString()}`, type: SUPPORT_TYPES[i % SUPPORT_TYPES.length],
  studentName: STUDENTS[i % STUDENTS.length].name, studentId: STUDENTS[i % STUDENTS.length].id,
  relatedTest: `SSC CGL Mock ${i + 1}`, relatedQuestion: i % 3 === 0 ? null : `Q-${1000 + i}`,
  language: LANGS[i % LANGS.length], priority: PRIORITIES[i % PRIORITIES.length],
  status: SUPPORT_STATUSES[i % SUPPORT_STATUSES.length],
  assignedAgent: i % 4 === 0 ? null : REVIEWERS[i % REVIEWERS.length],
  createdAt: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
}));
