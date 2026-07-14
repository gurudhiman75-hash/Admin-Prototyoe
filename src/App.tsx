import './App.css';
import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/app/layout/AdminLayout';
import { ThemeProvider } from '@/app/theme/ThemeProvider';
import { PrototypeStoreProvider } from '@/app/store/PrototypeStore';
import { Toaster } from '@/components/ui/sonner';

import { DashboardPage } from '@/pages/overview/DashboardPage';
import { QuestionBankPage } from '@/pages/content/QuestionBankPage';
import { QuestionDetailPage } from '@/pages/content/QuestionDetailPage';
import { ContentReviewPage } from '@/pages/content/ContentReviewPage';
import { TaxonomyPage } from '@/pages/content/TaxonomyPage';
import { DiPassageSetsPage } from '@/pages/content/DiPassageSetsPage';
import { MediaLibraryPage } from '@/pages/content/MediaLibraryPage';
import { TestsPage } from '@/pages/tests/TestsPage';
import { TestDetailPage } from '@/pages/tests/TestDetailPage';
import { TestSeriesPage } from '@/pages/tests/TestSeriesPage';
import { ExamBlueprintsPage } from '@/pages/tests/ExamBlueprintsPage';
import { PublishingCalendarPage } from '@/pages/tests/PublishingCalendarPage';
import { PackagesPage } from '@/pages/commerce/PackagesPage';
import { PackageDetailPage } from '@/pages/commerce/PackageDetailPage';
import { OrdersPaymentsPage } from '@/pages/commerce/OrdersPaymentsPage';
import { OrderDetailPage } from '@/pages/commerce/OrderDetailPage';
import { CouponsPage } from '@/pages/commerce/CouponsPage';
import { EntitlementsPage } from '@/pages/commerce/EntitlementsPage';
import { StudentsPage } from '@/pages/users/StudentsPage';
import { StudentDetailPage } from '@/pages/users/StudentDetailPage';
import { AdminTeamPage } from '@/pages/users/AdminTeamPage';
import { SupportRequestsPage } from '@/pages/users/SupportRequestsPage';
import { SupportDetailPage } from '@/pages/users/SupportDetailPage';
import { NotificationsPage } from '@/pages/users/NotificationsPage';
import { ExamConfigurationPage } from '@/pages/settings/ExamConfigurationPage';
import { LanguagesPage } from '@/pages/settings/LanguagesPage';
import { RolesPermissionsPage } from '@/pages/settings/RolesPermissionsPage';
import { BrandingPage } from '@/pages/settings/BrandingPage';
import { AuditLogsPage } from '@/pages/settings/AuditLogsPage';
import { IntegrationsPage } from '@/pages/settings/IntegrationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const QuestionStudioPage = lazy(() => import('@/pages/content/QuestionStudioPage').then((module) => ({ default: module.QuestionStudioPage })));
const CoveragePlannerPage = lazy(() => import('@/pages/content/CoveragePlannerPage').then((module) => ({ default: module.CoveragePlannerPage })));
const TestBuilderPage = lazy(() => import('@/pages/tests/TestBuilderPage').then((module) => ({ default: module.TestBuilderPage })));
const TestQAWorkspacePage = lazy(() => import('@/pages/tests/TestQAWorkspacePage').then((module) => ({ default: module.TestQAWorkspacePage })));
const BusinessAnalyticsPage = lazy(() => import('@/pages/analytics/BusinessAnalyticsPage').then((module) => ({ default: module.BusinessAnalyticsPage })));
const TestAnalyticsPage = lazy(() => import('@/pages/analytics/TestAnalyticsPage').then((module) => ({ default: module.TestAnalyticsPage })));
const QuestionAnalyticsPage = lazy(() => import('@/pages/analytics/QuestionAnalyticsPage').then((module) => ({ default: module.QuestionAnalyticsPage })));
const ContentQualityPage = lazy(() => import('@/pages/analytics/ContentQualityPage').then((module) => ({ default: module.ContentQualityPage })));
const SystemHealthPage = lazy(() => import('@/pages/analytics/SystemHealthPage').then((module) => ({ default: module.SystemHealthPage })));

function RouteFallback() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
      Loading admin workspace…
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/content/questions', element: <QuestionBankPage /> },
      { path: '/content/questions/:id', element: <QuestionDetailPage /> },
      { path: '/content/studio', element: <QuestionStudioPage /> },
      { path: '/content/review', element: <ContentReviewPage /> },
      { path: '/content/taxonomy', element: <TaxonomyPage /> },
      { path: '/content/sets', element: <DiPassageSetsPage /> },
      { path: '/content/media', element: <MediaLibraryPage /> },
      { path: '/content/coverage', element: <CoveragePlannerPage /> },
      { path: '/tests', element: <TestsPage /> },
      { path: '/tests/builder', element: <TestBuilderPage /> },
      { path: '/tests/test-builder', element: <Navigate to="/tests/builder" replace /> },
      { path: '/tests/qa', element: <TestQAWorkspacePage /> },
      { path: '/tests/series', element: <TestSeriesPage /> },
      { path: '/tests/blueprints', element: <ExamBlueprintsPage /> },
      { path: '/tests/calendar', element: <PublishingCalendarPage /> },
      { path: '/tests/:id', element: <TestDetailPage /> },
      { path: '/commerce/packages', element: <PackagesPage /> },
      { path: '/commerce/packages/:id', element: <PackageDetailPage /> },
      { path: '/commerce/orders', element: <OrdersPaymentsPage /> },
      { path: '/commerce/orders/:id', element: <OrderDetailPage /> },
      { path: '/commerce/coupons', element: <CouponsPage /> },
      { path: '/commerce/entitlements', element: <EntitlementsPage /> },
      { path: '/users/students', element: <StudentsPage /> },
      { path: '/users/students/:id', element: <StudentDetailPage /> },
      { path: '/users/team', element: <AdminTeamPage /> },
      { path: '/users/support', element: <SupportRequestsPage /> },
      { path: '/users/support/:id', element: <SupportDetailPage /> },
      { path: '/users/notifications', element: <NotificationsPage /> },
      { path: '/analytics/business', element: <BusinessAnalyticsPage /> },
      { path: '/analytics/tests', element: <TestAnalyticsPage /> },
      { path: '/analytics/questions', element: <QuestionAnalyticsPage /> },
      { path: '/analytics/content-quality', element: <ContentQualityPage /> },
      { path: '/analytics/system-health', element: <SystemHealthPage /> },
      { path: '/settings/exam-config', element: <ExamConfigurationPage /> },
      { path: '/settings/languages', element: <LanguagesPage /> },
      { path: '/settings/roles', element: <RolesPermissionsPage /> },
      { path: '/settings/branding', element: <BrandingPage /> },
      { path: '/settings/audit-logs', element: <AuditLogsPage /> },
      { path: '/settings/integrations', element: <IntegrationsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <PrototypeStoreProvider>
        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster />
      </PrototypeStoreProvider>
    </ThemeProvider>
  );
}
