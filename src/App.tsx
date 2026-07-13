import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/app/layout/AdminLayout';
import { ThemeProvider } from '@/app/theme/ThemeProvider';
import { PrototypeStoreProvider } from '@/app/store/PrototypeStore';
import { Toaster } from '@/components/ui/sonner';

import { DashboardPage } from '@/pages/overview/DashboardPage';
import { QuestionBankPage } from '@/pages/content/QuestionBankPage';
import { QuestionDetailPage } from '@/pages/content/QuestionDetailPage';
import { QuestionStudioPage } from '@/pages/content/QuestionStudioPage';
import { ContentReviewPage } from '@/pages/content/ContentReviewPage';
import { TaxonomyPage } from '@/pages/content/TaxonomyPage';
import { DiPassageSetsPage } from '@/pages/content/DiPassageSetsPage';
import { MediaLibraryPage } from '@/pages/content/MediaLibraryPage';
import { TestsPage } from '@/pages/tests/TestsPage';
import { TestDetailPage } from '@/pages/tests/TestDetailPage';
import { TestBuilderPage } from '@/pages/tests/TestBuilderPage';
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
import { BusinessAnalyticsPage } from '@/pages/analytics/BusinessAnalyticsPage';
import { TestAnalyticsPage } from '@/pages/analytics/TestAnalyticsPage';
import { QuestionAnalyticsPage } from '@/pages/analytics/QuestionAnalyticsPage';
import { ContentQualityPage } from '@/pages/analytics/ContentQualityPage';
import { SystemHealthPage } from '@/pages/analytics/SystemHealthPage';
import { ExamConfigurationPage } from '@/pages/settings/ExamConfigurationPage';
import { LanguagesPage } from '@/pages/settings/LanguagesPage';
import { RolesPermissionsPage } from '@/pages/settings/RolesPermissionsPage';
import { BrandingPage } from '@/pages/settings/BrandingPage';
import { AuditLogsPage } from '@/pages/settings/AuditLogsPage';
import { IntegrationsPage } from '@/pages/settings/IntegrationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <PrototypeStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/content/questions" element={<QuestionBankPage />} />
            <Route path="/content/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/content/studio" element={<QuestionStudioPage />} />
            <Route path="/content/review" element={<ContentReviewPage />} />
            <Route path="/content/taxonomy" element={<TaxonomyPage />} />
            <Route path="/content/sets" element={<DiPassageSetsPage />} />
            <Route path="/content/media" element={<MediaLibraryPage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/tests/builder" element={<TestBuilderPage />} />
            <Route path="/tests/test-builder" element={<TestBuilderPage />} />
            <Route path="/tests/series" element={<TestSeriesPage />} />
            <Route path="/tests/blueprints" element={<ExamBlueprintsPage />} />
            <Route path="/tests/calendar" element={<PublishingCalendarPage />} />
            <Route path="/tests/:id" element={<TestDetailPage />} />
            <Route path="/commerce/packages" element={<PackagesPage />} />
            <Route path="/commerce/packages/:id" element={<PackageDetailPage />} />
            <Route path="/commerce/orders" element={<OrdersPaymentsPage />} />
            <Route path="/commerce/orders/:id" element={<OrderDetailPage />} />
            <Route path="/commerce/coupons" element={<CouponsPage />} />
            <Route path="/commerce/entitlements" element={<EntitlementsPage />} />
            <Route path="/users/students" element={<StudentsPage />} />
            <Route path="/users/students/:id" element={<StudentDetailPage />} />
            <Route path="/users/team" element={<AdminTeamPage />} />
            <Route path="/users/support" element={<SupportRequestsPage />} />
            <Route path="/users/support/:id" element={<SupportDetailPage />} />
            <Route path="/users/notifications" element={<NotificationsPage />} />
            <Route path="/analytics/business" element={<BusinessAnalyticsPage />} />
            <Route path="/analytics/tests" element={<TestAnalyticsPage />} />
            <Route path="/analytics/questions" element={<QuestionAnalyticsPage />} />
            <Route path="/analytics/content-quality" element={<ContentQualityPage />} />
            <Route path="/analytics/system-health" element={<SystemHealthPage />} />
            <Route path="/settings/exam-config" element={<ExamConfigurationPage />} />
            <Route path="/settings/languages" element={<LanguagesPage />} />
            <Route path="/settings/roles" element={<RolesPermissionsPage />} />
            <Route path="/settings/branding" element={<BrandingPage />} />
            <Route path="/settings/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
      </PrototypeStoreProvider>
    </ThemeProvider>
  );
}
