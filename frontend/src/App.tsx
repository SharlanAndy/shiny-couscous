import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { FormListPage } from './pages/FormListPage'
import { FormPage } from './pages/FormPage'
import { SubmissionListPage } from './pages/SubmissionListPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'
import { LoginPage } from './pages/LoginPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { UserDashboardPage } from './pages/UserDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminFormSchemaEditorPage } from './pages/admin/AdminFormSchemaEditorPage'
import { AdminFormCreatePage } from './pages/admin/AdminFormCreatePage'
import { AdminSubmissionsListPage } from './pages/admin/AdminSubmissionsListPage'
import { AdminSubmissionReviewPage } from './pages/admin/AdminSubmissionReviewPage'
import { AdminFormsPage } from './pages/admin/AdminFormsPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminAdminsPage } from './pages/admin/AdminAdminsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SupabaseTestPage } from './pages/SupabaseTestPage'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/dashboard" element={<Layout><ProtectedRoute><UserDashboardPage /></ProtectedRoute></Layout>} />
      <Route path="/forms" element={<Layout><ProtectedRoute><FormListPage /></ProtectedRoute></Layout>} />
      <Route path="/forms/:formId" element={<Layout><ProtectedRoute><FormPage /></ProtectedRoute></Layout>} />
      <Route path="/submissions" element={<Layout><ProtectedRoute><SubmissionListPage /></ProtectedRoute></Layout>} />
      <Route path="/submissions/:submissionId" element={<Layout><ProtectedRoute><SubmissionDetailPage /></ProtectedRoute></Layout>} />
      <Route path="/profile" element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
      <Route path="/admin" element={<Layout><ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/submissions" element={<Layout><ProtectedRoute requireAdmin><AdminSubmissionsListPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/submissions/:submissionId" element={<Layout><ProtectedRoute requireAdmin><AdminSubmissionReviewPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/forms" element={<Layout><ProtectedRoute requireAdmin><AdminFormsPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/forms/create" element={<Layout><ProtectedRoute requireAdmin><AdminFormCreatePage /></ProtectedRoute></Layout>} />
      <Route path="/admin/forms/:formId/schema" element={<Layout><ProtectedRoute requireAdmin><AdminFormSchemaEditorPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/analytics" element={<Layout><ProtectedRoute requireAdmin><AdminAnalyticsPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/settings" element={<Layout><ProtectedRoute requireAdmin><AdminSettingsPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/users" element={<Layout><ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute></Layout>} />
      <Route path="/admin/admins" element={<Layout><ProtectedRoute requireAdmin><AdminAdminsPage /></ProtectedRoute></Layout>} />
      <Route path="/test/supabase" element={<Layout><SupabaseTestPage /></Layout>} />
      {/* Catch-all route for 404 - must be last */}
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  )
}

export default App

