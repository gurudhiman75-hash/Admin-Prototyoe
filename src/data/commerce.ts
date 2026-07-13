export interface Package {
  id: string; name: string; exam: string; examName: string; series: string[];
  price: number; discountedPrice: number; validityDays: number; language: string;
  saleStart: string; saleEnd: string; active: boolean; featured: boolean;
  enrolments: number; revenue: number;
}

export const PACKAGES: Package[] = [
  { id: 'PKG-01', name: 'SSC CGL Ultimate 2025', exam: 'SSC_CGL_T1', examName: 'SSC CGL Tier 1', series: ['SSC CGL Prime 2025'], price: 1999, discountedPrice: 999, validityDays: 365, language: 'English + Hindi', saleStart: '2025-01-01', saleEnd: '2025-12-31', active: true, featured: true, enrolments: 12450, revenue: 12437550 },
  { id: 'PKG-02', name: 'Banking Pro Combo', exam: 'IBPS_PO_PRE', examName: 'IBPS PO Prelims', series: ['IBPS PO Prelims Booster', 'IBPS Clerk Complete'], price: 2499, discountedPrice: 1299, validityDays: 365, language: 'English + Hindi', saleStart: '2025-01-01', saleEnd: '2025-12-31', active: true, featured: true, enrolments: 18900, revenue: 24560100 },
  { id: 'PKG-03', name: 'Railway NTPC Mega Pack', exam: 'RRB_NTPC_CBT1', examName: 'RRB NTPC CBT 1', series: ['RRB NTPC CBT 1 Mega Series'], price: 1799, discountedPrice: 899, validityDays: 365, language: 'English + Hindi', saleStart: '2025-01-01', saleEnd: '2025-12-31', active: true, featured: true, enrolments: 22300, revenue: 20047700 },
  { id: 'PKG-04', name: 'Punjab Govt Exams Combo', exam: 'PUNJAB_PSSSB_CLERK', examName: 'Punjab PSSSB Clerk', series: ['Punjab PSSSB Clerk Combo', 'Punjab Excise Inspector Pack'], price: 1499, discountedPrice: 749, validityDays: 180, language: 'English + Punjabi', saleStart: '2025-02-01', saleEnd: '2025-08-31', active: true, featured: false, enrolments: 6800, revenue: 5093200 },
  { id: 'PKG-05', name: 'SSC CHSL Standard', exam: 'SSC_CHSL_T1', examName: 'SSC CHSL Tier 1', series: ['SSC CHSL Power Pack'], price: 1299, discountedPrice: 649, validityDays: 270, language: 'English + Hindi', saleStart: '2025-01-15', saleEnd: '2025-10-15', active: true, featured: false, enrolments: 8200, revenue: 5321800 },
  { id: 'PKG-06', name: 'SSC MTS Foundation Pack', exam: 'SSC_MTS', examName: 'SSC MTS', series: ['SSC MTS Foundation'], price: 999, discountedPrice: 499, validityDays: 210, language: 'English + Hindi', saleStart: '2025-01-01', saleEnd: '2025-07-31', active: false, featured: false, enrolments: 4100, revenue: 2045900 },
];

export interface Order {
  id: string; studentName: string; studentId: string; product: string;
  amount: number; paymentStatus: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  entitlementStatus: 'Active' | 'Pending' | 'Failed' | 'Not Granted';
  coupon: string | null; gateway: 'Razorpay' | 'Cashfree' | 'UPI Direct' | 'Manual';
  paymentDate: string; refundStatus: 'None' | 'Requested' | 'Approved' | 'Processed';
  reconIssue?: boolean;
}

const STUDENT_NAMES = ['Harleen Kaur', 'Gurpreet Singh', 'Manjit Singh', 'Sukhdeep Kaur', 'Rajveer Singh', 'Parneet Kaur', 'Jagpreet Singh', 'Navleen Kaur', 'Dilpreet Singh', 'Simarjeet Kaur', 'Amandeep Singh', 'Komalpreet Kaur', 'Harsimran Singh', 'Ravleen Kaur', 'Jaspreet Singh', 'Taniya Sharma', 'Rohit Kumar', 'Priya Gupta', 'Amit Verma', 'Sneha Reddy'];
const PAYMENT_STATUSES: Order['paymentStatus'][] = ['Success', 'Success', 'Success', 'Success', 'Pending', 'Failed', 'Refunded'];
const GATEWAYS: Order['gateway'][] = ['Razorpay', 'Cashfree', 'UPI Direct', 'Manual'];
const COUPON_CODES = ['EARLYBIRD20', 'SSC50', 'PUNJAB30', null, 'NEWUSER100', 'WEEKEND15', null];

export const ORDERS: Order[] = Array.from({ length: 40 }).map((_, i) => {
  const pkg = PACKAGES[i % PACKAGES.length];
  const ps = PAYMENT_STATUSES[i % PAYMENT_STATUSES.length];
  const es = ps === 'Success' ? (i % 7 === 0 ? 'Pending' : 'Active') : ps === 'Failed' ? 'Failed' : ps === 'Refunded' ? 'Not Granted' : 'Pending';
  return {
    id: `ORD-${(50000 + i).toString()}`, studentName: STUDENT_NAMES[i % STUDENT_NAMES.length],
    studentId: `STU-${(30000 + i).toString()}`, product: pkg.name,
    amount: pkg.discountedPrice + (i % 3) * 50, paymentStatus: ps, entitlementStatus: es,
    coupon: COUPON_CODES[i % COUPON_CODES.length], gateway: GATEWAYS[i % GATEWAYS.length],
    paymentDate: new Date(Date.now() - i * 86400000 * 2).toISOString().slice(0, 10),
    refundStatus: ps === 'Refunded' ? 'Processed' : 'None',
    reconIssue: (ps === 'Success' && es !== 'Active') || (ps === 'Failed' && es === 'Active'),
  };
});

export interface Coupon {
  id: string; code: string; type: 'Percentage' | 'Flat'; discount: number;
  eligiblePackages: string[]; startDate: string; endDate: string;
  totalLimit: number; perUserLimit: number; active: boolean;
  redemptions: number; revenueGenerated: number;
}

export const COUPONS: Coupon[] = [
  { id: 'C-1', code: 'EARLYBIRD20', type: 'Percentage', discount: 20, eligiblePackages: ['SSC CGL Ultimate 2025', 'Banking Pro Combo'], startDate: '2025-01-01', endDate: '2025-03-31', totalLimit: 2000, perUserLimit: 1, active: true, redemptions: 1340, revenueGenerated: 890000 },
  { id: 'C-2', code: 'PUNJAB30', type: 'Percentage', discount: 30, eligiblePackages: ['Punjab Govt Exams Combo'], startDate: '2025-02-01', endDate: '2025-06-30', totalLimit: 1000, perUserLimit: 1, active: true, redemptions: 620, revenueGenerated: 320000 },
  { id: 'C-3', code: 'SSC50', type: 'Flat', discount: 50, eligiblePackages: ['SSC CGL Ultimate 2025', 'SSC CHSL Standard'], startDate: '2025-01-15', endDate: '2025-12-31', totalLimit: 5000, perUserLimit: 2, active: true, redemptions: 3100, revenueGenerated: 2100000 },
  { id: 'C-4', code: 'NEWUSER100', type: 'Flat', discount: 100, eligiblePackages: ['All active packages'], startDate: '2025-01-01', endDate: '2025-12-31', totalLimit: 10000, perUserLimit: 1, active: true, redemptions: 5400, revenueGenerated: 4200000 },
  { id: 'C-5', code: 'WEEKEND15', type: 'Percentage', discount: 15, eligiblePackages: ['All active packages'], startDate: '2025-04-01', endDate: '2025-04-30', totalLimit: 800, perUserLimit: 1, active: false, redemptions: 590, revenueGenerated: 240000 },
  { id: 'C-6', code: 'RAILWAY10', type: 'Percentage', discount: 10, eligiblePackages: ['Railway NTPC Mega Pack'], startDate: '2025-03-01', endDate: '2025-09-30', totalLimit: 3000, perUserLimit: 1, active: true, redemptions: 1450, revenueGenerated: 680000 },
];

export interface Entitlement {
  id: string; studentName: string; studentId: string; packageName: string;
  source: 'Purchase' | 'Free Preview' | 'Manual Grant' | 'Promotional';
  startDate: string; expiryDate: string;
  status: 'Active' | 'Expired' | 'Revoked' | 'Suspended';
  grantedBy: string; paymentRef: string | null;
}

export const ENTITLEMENTS: Entitlement[] = Array.from({ length: 24 }).map((_, i) => {
  const pkg = PACKAGES[i % PACKAGES.length];
  const sources: Entitlement['source'][] = ['Purchase', 'Purchase', 'Free Preview', 'Manual Grant', 'Promotional'];
  const statuses: Entitlement['status'][] = ['Active', 'Active', 'Active', 'Expired', 'Revoked'];
  return {
    id: `ENT-${(7000 + i).toString()}`, studentName: STUDENT_NAMES[i % STUDENT_NAMES.length],
    studentId: `STU-${(30000 + i).toString()}`, packageName: pkg.name, source: sources[i % sources.length],
    startDate: new Date(Date.now() - i * 86400000 * 5).toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + (60 - i) * 86400000).toISOString().slice(0, 10),
    status: i % 5 === 4 ? statuses[i % statuses.length] : 'Active',
    grantedBy: ['Ravneet Thind', 'System', 'Harpreet Kaur', 'System'][i % 4],
    paymentRef: i % 3 === 0 ? null : `ORD-${50000 + i}`,
  };
});
