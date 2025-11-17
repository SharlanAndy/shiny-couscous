import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { FormListPage } from './pages/FormListPage'
import { FormPage } from './pages/FormPage'
import { SubmissionListPage } from './pages/SubmissionListPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forms" element={<FormListPage />} />
        <Route path="/forms/:formId" element={<FormPage />} />
        <Route path="/submissions" element={<SubmissionListPage />} />
        <Route path="/submissions/:submissionId" element={<SubmissionDetailPage />} />
        <Route path="/admin/*" element={<AdminDashboardPage />} />
      </Routes>
    </Layout>
  )
}

export default App

