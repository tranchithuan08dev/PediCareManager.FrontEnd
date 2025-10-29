import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ProcessExaminationPage from './pages/Dashboard/ProcessExaminationPage'
import DoctorDashboardLayout from './pages/Dashboard'
import ForgetPasswordPage from './pages/ForgetPasswordPage'

function App() {
  return (
    <Routes>
      {/* Trang login */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgetPasswordPage />} />
      {/* Dashboard chính của bác sĩ */}
    <Route path="/admin" element={<DoctorDashboardLayout />}>
  
      <Route index element={<Navigate to="examination" replace />} />
      
      <Route path="examination" element={<ProcessExaminationPage />} />
    </Route>
    </Routes>
  )
}

export default App
