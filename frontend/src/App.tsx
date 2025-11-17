import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { FormListPage } from './pages/FormListPage'
import { FormPage } from './pages/FormPage'
import { SubmissionListPage } from './pages/SubmissionListPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { UserDashboardPage } from './pages/UserDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminFormSchemaEditorPage } from './pages/admin/AdminFormSchemaEditorPage'
import { AdminSubmissionsListPage } from './pages/admin/AdminSubmissionsListPage'
import { AdminSubmissionReviewPage } from './pages/admin/AdminSubmissionReviewPage'
import { AdminFormsPage } from './pages/admin/AdminFormsPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/dashboard" element={<Layout><UserDashboardPage /></Layout>} />
      <Route path="/forms" element={<Layout><FormListPage /></Layout>} />
      <Route path="/forms/:formId" element={<Layout><FormPage /></Layout>} />
      <Route path="/submissions" element={<Layout><SubmissionListPage /></Layout>} />
      <Route path="/submissions/:submissionId" element={<Layout><SubmissionDetailPage /></Layout>} />
      <Route path="/admin" element={<Layout><AdminDashboardPage /></Layout>} />
      <Route path="/admin/submissions" element={<Layout><AdminSubmissionsListPage /></Layout>} />
      <Route path="/admin/submissions/:submissionId" element={<Layout><AdminSubmissionReviewPage /></Layout>} />
      <Route path="/admin/forms" element={<Layout><AdminFormsPage /></Layout>} />
      <Route path="/admin/forms/:formId/schema" element={<Layout><AdminFormSchemaEditorPage /></Layout>} />
      <Route path="/admin/analytics" element={<Layout><AdminAnalyticsPage /></Layout>} />
      <Route path="/admin/settings" element={<Layout><AdminSettingsPage /></Layout>} />
    </Routes>
  )
}

export default App

