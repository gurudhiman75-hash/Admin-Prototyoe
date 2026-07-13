export const REVENUE_TREND = [
  { month: 'Jan', revenue: 2840000, target: 3000000 },
  { month: 'Feb', revenue: 3120000, target: 3000000 },
  { month: 'Mar', revenue: 3950000, target: 3500000 },
  { month: 'Apr', revenue: 3680000, target: 3700000 },
  { month: 'May', revenue: 4210000, target: 4000000 },
  { month: 'Jun', revenue: 4580000, target: 4300000 },
  { month: 'Jul', revenue: 5120000, target: 4700000 },
];

export const STUDENT_ACTIVITY_TREND = [
  { day: 'Mon', active: 8200, new: 340 }, { day: 'Tue', active: 9100, new: 420 },
  { day: 'Wed', active: 8800, new: 380 }, { day: 'Thu', active: 9600, new: 510 },
  { day: 'Fri', active: 11200, new: 680 }, { day: 'Sat', active: 14800, new: 920 },
  { day: 'Sun', active: 13400, new: 760 },
];

export const CONTENT_COVERAGE = [
  { exam: 'SSC CGL', coverage: 92, questions: 12400 }, { exam: 'SSC CHSL', coverage: 86, questions: 9800 },
  { exam: 'IBPS PO', coverage: 78, questions: 7600 }, { exam: 'IBPS Clerk', coverage: 81, questions: 8200 },
  { exam: 'RRB NTPC', coverage: 74, questions: 6900 }, { exam: 'Punjab PSSSB', coverage: 58, questions: 3200 },
];

export const PLATFORM_HEALTH = [
  { service: 'API Gateway', status: 'operational', latency: '42ms' },
  { service: 'Database', status: 'operational', latency: '8ms' },
  { service: 'Payment Webhooks', status: 'degraded', latency: '1.2s' },
  { service: 'Notification Service', status: 'operational', latency: '120ms' },
  { service: 'File Storage (S3)', status: 'operational', latency: '65ms' },
  { service: 'Search Index', status: 'operational', latency: '24ms' },
];

export interface ActivityItem { id: string; actor: string; action: string; target: string; time: string; type: 'create' | 'update' | 'approve' | 'publish' | 'comment' | 'payment' }

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: 'a1', actor: 'Harpreet Kaur', action: 'approved question', target: 'Q-1012 - Profit & Loss', time: '5 min ago', type: 'approve' },
  { id: 'a2', actor: 'Arjun Mehta', action: 'created test', target: 'SSC CGL Mock Test 8', time: '22 min ago', type: 'create' },
  { id: 'a3', actor: 'Simran Singh', action: 'published', target: 'IBPS PO Prelims Mock 5', time: '1 hr ago', type: 'publish' },
  { id: 'a4', actor: 'System', action: 'processed payment', target: 'ORD-50012 - Rs 999', time: '1 hr ago', type: 'payment' },
  { id: 'a5', actor: 'Neha Verma', action: 'sent for correction', target: 'Q-1034 - Reasoning', time: '2 hr ago', type: 'comment' },
  { id: 'a6', actor: 'Manpreet Gill', action: 'updated package', target: 'Banking Pro Combo', time: '3 hr ago', type: 'update' },
  { id: 'a7', actor: 'Ravneet Thind', action: 'archived test', target: 'SSC MTS Mock 3', time: '5 hr ago', type: 'update' },
];

export const UPCOMING_RELEASES = [
  { id: 'r1', name: 'SSC CGL Mock Test 8', exam: 'SSC CGL Tier 1', date: '2026-07-13', time: '09:00', enrolled: 12450 },
  { id: 'r2', name: 'IBPS PO Sectional - Quant', exam: 'IBPS PO Prelims', date: '2026-07-14', time: '18:00', enrolled: 8200 },
  { id: 'r3', name: 'RRB NTPC Full Mock 6', exam: 'RRB NTPC CBT 1', date: '2026-07-15', time: '10:00', enrolled: 22300 },
  { id: 'r4', name: 'Punjab PSSSB Clerk Mock 2', exam: 'Punjab PSSSB Clerk', date: '2026-07-16', time: '11:00', enrolled: 6800 },
];

export const PENDING_REVIEW_TASKS = [
  { id: 't1', title: 'SSC CGL - Quant batch (12 questions)', reviewer: 'Simran Singh', age: '2 days', priority: 'High' },
  { id: 't2', title: 'IBPS PO - Reasoning batch (8 questions)', reviewer: 'Neha Verma', age: '1 day', priority: 'Medium' },
  { id: 't3', title: 'Punjab PSSSB - Punjabi Language (6 questions)', reviewer: 'Anjali Bansal', age: '4 days', priority: 'High' },
  { id: 't4', title: 'RRB NTPC - GA batch (15 questions)', reviewer: 'Karan Bedi', age: '3 hours', priority: 'Low' },
];

export const RECENT_TESTS = [
  { id: 'T-2001', name: 'SSC CGL Mock Test 7', exam: 'SSC CGL Tier 1', status: 'Live', created: '2026-07-10' },
  { id: 'T-2002', name: 'IBPS PO Prelims Mock 5', exam: 'IBPS PO Prelims', status: 'Scheduled', created: '2026-07-11' },
  { id: 'T-2003', name: 'RRB NTPC Full Mock 5', exam: 'RRB NTPC CBT 1', status: 'Content Ready', created: '2026-07-11' },
];

export const RECENT_QUESTIONS = [
  { id: 'Q-1042', stem: 'A shopkeeper marks goods 40% above CP...', subject: 'Quant', author: 'Deepak Sharma', status: 'Approved' },
  { id: 'Q-1041', stem: 'Coding-Decoding: FRIEND -> GSJFOE...', subject: 'Reasoning', author: 'Karan Bedi', status: 'Under Review' },
  { id: 'Q-1040', stem: 'Synonym of DILIGENT...', subject: 'English', author: 'Anjali Bansal', status: 'Needs Fix' },
];

export const TEST_PERFORMANCE = [
  { test: 'SSC CGL M1', attempts: 11200, completion: 78, avgScore: 62, avgTime: 52 },
  { test: 'SSC CGL M2', attempts: 10400, completion: 74, avgScore: 58, avgTime: 55 },
  { test: 'SSC CGL M3', attempts: 9800, completion: 71, avgScore: 55, avgTime: 58 },
  { test: 'IBPS PO M1', attempts: 15600, completion: 82, avgScore: 64, avgTime: 48 },
  { test: 'IBPS PO M2', attempts: 14200, completion: 79, avgScore: 61, avgTime: 50 },
  { test: 'RRB NTPC M1', attempts: 18800, completion: 69, avgScore: 52, avgTime: 72 },
];

export const SECTION_PERFORMANCE = [
  { section: 'Quant', accuracy: 64, avgTime: 75, skip: 12 },
  { section: 'Reasoning', accuracy: 71, avgTime: 68, skip: 8 },
  { section: 'English', accuracy: 68, avgTime: 42, skip: 15 },
  { section: 'GA', accuracy: 55, avgTime: 35, skip: 22 },
];

export const OPTION_DISTRIBUTION = [
  { option: 'A', count: 4200 }, { option: 'B', count: 3800 },
  { option: 'C (correct)', count: 5600 }, { option: 'D', count: 2400 },
];

export const PACKAGE_SALES = [
  { name: 'SSC CGL Ultimate', sales: 12450 }, { name: 'Banking Pro Combo', sales: 18900 },
  { name: 'Railway NTPC Pack', sales: 22300 }, { name: 'Punjab Combo', sales: 6800 },
  { name: 'SSC CHSL Standard', sales: 8200 },
];

export const CONVERSION_FUNNEL = [
  { stage: 'Visitors', count: 142000 }, { stage: 'Sign-ups', count: 38000 },
  { stage: 'Free Test Attempt', count: 21000 }, { stage: 'Paid Purchase', count: 6800 },
];
