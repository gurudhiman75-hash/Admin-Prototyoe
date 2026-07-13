export interface DiSet {
  id: string; title: string; type: 'Data Interpretation' | 'Reading Comprehension' | 'Cloze Test' | 'Caselet';
  linkedQuestions: number; language: string; difficulty: string; status: string;
  exam: string; passageExcerpt: string;
}

export const DI_SETS: DiSet[] = [
  { id: 'DS-01', title: 'Sales of Smartphones across Brands (2020-2024)', type: 'Data Interpretation', linkedQuestions: 5, language: 'English', difficulty: 'Moderate', status: 'Approved', exam: 'SSC CGL Tier 1', passageExcerpt: 'The table below shows unit sales (in lakhs) of five smartphone brands from 2020 to 2024...' },
  { id: 'DS-02', title: 'Banking Sector: Credit & Deposit Growth', type: 'Data Interpretation', linkedQuestions: 6, language: 'English', difficulty: 'Hard', status: 'Approved', exam: 'IBPS PO Prelims', passageExcerpt: 'A bar graph depicts year-on-year growth in credit and deposits across public and private sector banks...' },
  { id: 'DS-03', title: 'Reading Comprehension: Climate Policy', type: 'Reading Comprehension', linkedQuestions: 8, language: 'English', difficulty: 'Moderate', status: 'Under Review', exam: 'IBPS PO Prelims', passageExcerpt: 'The passage discusses the evolution of international climate agreements since the Kyoto Protocol...' },
  { id: 'DS-04', title: 'Railway Network: Route Kilometres by Zone', type: 'Caselet', linkedQuestions: 4, language: 'English', difficulty: 'Hard', status: 'Approved', exam: 'RRB NTPC CBT 1', passageExcerpt: 'Indian Railways operates across 17 zones with varying route kilometres and electrification percentages...' },
  { id: 'DS-05', title: 'Punjab Literacy Rate (ਪੰਜਾਬ ਦੀ ਸਿੱਖਿਆ ਦਰ)', type: 'Data Interpretation', linkedQuestions: 5, language: 'Punjabi', difficulty: 'Moderate', status: 'Needs Fix', exam: 'Punjab PSSSB Clerk', passageExcerpt: 'ਹੇਠਾਂ ਦਿੱਤੇ ਚਾਰਟ ਵਿੱਚ ਪੰਜਾਬ ਦੇ ਵੱਖ-ਵੱਖ ਜ਼ਿਲ੍ਹਿਆਂ ਦੀ ਸਾਖਰਤਾ ਦਰ ਦਰਸਾਈ ਗਈ ਹੈ...' },
  { id: 'DS-06', title: 'Cloze Test: Economic Survey Highlights', type: 'Cloze Test', linkedQuestions: 5, language: 'English', difficulty: 'Moderate', status: 'Approved', exam: 'IBPS Clerk Prelims', passageExcerpt: 'The Economic Survey 2024-25 ___1___ a GDP growth target of 6.5-7%...' },
  { id: 'DS-07', title: 'Government Expenditure on Education', type: 'Data Interpretation', linkedQuestions: 5, language: 'English', difficulty: 'Expert', status: 'Draft', exam: 'SSC CGL Tier 1', passageExcerpt: 'A pie chart shows the distribution of central government expenditure across education sectors...' },
  { id: 'DS-08', title: 'Reading Comprehension: Punjab Agriculture', type: 'Reading Comprehension', linkedQuestions: 7, language: 'Punjabi', difficulty: 'Hard', status: 'Approved', exam: 'Punjab Excise Inspector', passageExcerpt: 'ਪੰਜਾਬ ਦੀ ਖੇਤੀਬਾੜੀ ਅਰਥਵਿਵਸਥਾ ਅਤੇ ਫਸਲੀ ਵਿਭਿੰਨਤਾ ਬਾਰੇ ਇਹ ਪ੍ਰਸ਼ਨ ਅਧਾਰਿਤ ਹੈ...' },
];

export interface MediaAsset {
  id: string; name: string; type: 'Question Image' | 'DI Chart' | 'Passage Image' | 'Package Banner' | 'Exam Icon' | 'Notification Image';
  size: string; dimensions: string; uploadedBy: string; uploadedOn: string;
  usageCount: number; status: 'Active' | 'Archived'; url: string;
}

export const MEDIA_ASSETS: MediaAsset[] = [
  { id: 'M-01', name: 'ssc_cgl_chart_2024.png', type: 'DI Chart', size: '248 KB', dimensions: '1200x680', uploadedBy: 'Arjun Mehta', uploadedOn: '2026-07-10', usageCount: 14, status: 'Active', url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-02', name: 'ibps_po_banner.jpg', type: 'Package Banner', size: '1.2 MB', dimensions: '1920x600', uploadedBy: 'Manpreet Gill', uploadedOn: '2026-07-08', usageCount: 3, status: 'Active', url: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-03', name: 'railway_route_map.png', type: 'Passage Image', size: '512 KB', dimensions: '800x600', uploadedBy: 'Karan Bedi', uploadedOn: '2026-07-06', usageCount: 8, status: 'Active', url: 'https://images.pexels.com/photos/262903/pexels-photo-262903.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-04', name: 'punjab_literacy_chart.png', type: 'DI Chart', size: '320 KB', dimensions: '1000x500', uploadedBy: 'Harpreet Kaur', uploadedOn: '2026-07-05', usageCount: 5, status: 'Active', url: 'https://images.pexels.com/photos/356052/pexels-photo-356052.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-05', name: 'ssc_icon.svg', type: 'Exam Icon', size: '12 KB', dimensions: '128x128', uploadedBy: 'Ravneet Thind', uploadedOn: '2026-06-28', usageCount: 22, status: 'Active', url: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-06', name: 'diabetes_study_graph.png', type: 'Question Image', size: '180 KB', dimensions: '600x400', uploadedBy: 'Neha Verma', uploadedOn: '2026-06-20', usageCount: 0, status: 'Archived', url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-07', name: 'notification_exam_reminder.png', type: 'Notification Image', size: '96 KB', dimensions: '600x300', uploadedBy: 'Marketing Team', uploadedOn: '2026-06-15', usageCount: 11, status: 'Active', url: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'M-08', name: 'banking_pro_banner.jpg', type: 'Package Banner', size: '980 KB', dimensions: '1920x600', uploadedBy: 'Manpreet Gill', uploadedOn: '2026-06-10', usageCount: 4, status: 'Active', url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export interface NotificationCampaign {
  id: string; title: string; channel: 'In-app' | 'Push' | 'Email' | 'SMS' | 'WhatsApp';
  audience: string; template: string; scheduled: string;
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Sending';
  deliveryCount: number; openRate: number; clickRate: number;
}

export const NOTIFICATIONS: NotificationCampaign[] = [
  { id: 'N-01', title: 'SSC CGL Mock 8 - Live Tomorrow', channel: 'In-app', audience: 'SSC CGL enrolled', template: 'Test Reminder', scheduled: '2026-07-13 08:00', status: 'Scheduled', deliveryCount: 12450, openRate: 0, clickRate: 0 },
  { id: 'N-02', title: 'Banking Pro - 20% off this week', channel: 'Push', audience: 'Banking aspirants', template: 'Promo Offer', scheduled: '2026-07-12 10:00', status: 'Sent', deliveryCount: 38000, openRate: 38, clickRate: 12 },
  { id: 'N-03', title: 'Weekly Performance Report', channel: 'Email', audience: 'All active students', template: 'Weekly Report', scheduled: '2026-07-11 07:00', status: 'Sent', deliveryCount: 42000, openRate: 52, clickRate: 8 },
  { id: 'N-04', title: 'Punjab PSSSB Mock 2 Reminder', channel: 'WhatsApp', audience: 'Punjab Combo', template: 'Test Reminder', scheduled: '2026-07-16 09:00', status: 'Draft', deliveryCount: 0, openRate: 0, clickRate: 0 },
  { id: 'N-05', title: 'New Test Series Launch', channel: 'In-app', audience: 'All students', template: 'Product Update', scheduled: '2026-07-10 12:00', status: 'Sent', deliveryCount: 56000, openRate: 44, clickRate: 18 },
  { id: 'N-06', title: 'Payment Success Confirmation', channel: 'SMS', audience: 'Recent buyers', template: 'Payment Receipt', scheduled: 'Trigger-based', status: 'Sending', deliveryCount: 320, openRate: 0, clickRate: 0 },
];

export interface AuditLog {
  id: string; timestamp: string; admin: string; action: string; entity: string;
  oldValue: string; newValue: string; reason: string; ip: string;
  approvalStatus: 'Auto' | 'Approved' | 'Pending';
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'AL-01', timestamp: '2026-07-12 14:32:11', admin: 'Ravneet Thind', action: 'ARCHIVED', entity: 'Test T-2005', oldValue: 'Live', newValue: 'Archived', reason: 'Outdated SSC MTS pattern', ip: '103.21.x.x - Chrome', approvalStatus: 'Auto' },
  { id: 'AL-02', timestamp: '2026-07-12 13:18:04', admin: 'Harpreet Kaur', action: 'APPROVED', entity: 'Question Q-1012', oldValue: 'Under Review', newValue: 'Approved', reason: 'Content verified', ip: '49.36.x.x - Safari', approvalStatus: 'Auto' },
  { id: 'AL-03', timestamp: '2026-07-12 11:45:22', admin: 'Arjun Mehta', action: 'CREATED', entity: 'Test SSC CGL Mock 8', oldValue: '-', newValue: 'Draft', reason: 'New mock test', ip: '157.34.x.x - Edge', approvalStatus: 'Auto' },
  { id: 'AL-04', timestamp: '2026-07-12 10:02:55', admin: 'Finance Admin', action: 'REFUND_INITIATED', entity: 'Order ORD-50012', oldValue: 'Success', newValue: 'Refunded', reason: 'Student request - duplicate payment', ip: '103.21.x.x - Chrome', approvalStatus: 'Approved' },
  { id: 'AL-05', timestamp: '2026-07-11 18:30:00', admin: 'Simran Singh', action: 'PUBLISHED', entity: 'Test IBPS PO Mock 5', oldValue: 'Scheduled', newValue: 'Live', reason: 'Scheduled release', ip: '49.36.x.x - Chrome', approvalStatus: 'Auto' },
  { id: 'AL-06', timestamp: '2026-07-11 16:12:33', admin: 'Marketing Admin', action: 'COUPON_CREATED', entity: 'Coupon RAILWAY10', oldValue: '-', newValue: 'Active', reason: 'Railway exam season campaign', ip: '103.21.x.x - Chrome', approvalStatus: 'Approved' },
  { id: 'AL-07', timestamp: '2026-07-11 14:05:19', admin: 'Neha Verma', action: 'SENT_FOR_CORRECTION', entity: 'Question Q-1034', oldValue: 'Under Review', newValue: 'Needs Fix', reason: 'Explanation too brief', ip: '157.34.x.x - Safari', approvalStatus: 'Auto' },
  { id: 'AL-08', timestamp: '2026-07-11 09:48:12', admin: 'Ravneet Thind', action: 'ROLE_CHANGED', entity: 'Admin ADM-15', oldValue: 'Reviewer', newValue: 'Content Manager', reason: 'Promotion', ip: '103.21.x.x - Chrome', approvalStatus: 'Pending' },
  { id: 'AL-09', timestamp: '2026-07-10 22:15:44', admin: 'System', action: 'AUTO_RECONCILE', entity: 'Orders (47)', oldValue: 'Pending', newValue: 'Verified', reason: 'Nightly reconciliation job', ip: 'internal', approvalStatus: 'Auto' },
  { id: 'AL-10', timestamp: '2026-07-10 17:22:08', admin: 'Manpreet Gill', action: 'PRICE_UPDATED', entity: 'Package Banking Pro Combo', oldValue: 'Rs 1499', newValue: 'Rs 1299', reason: 'Competitive pricing adjustment', ip: '49.36.x.x - Chrome', approvalStatus: 'Approved' },
];
