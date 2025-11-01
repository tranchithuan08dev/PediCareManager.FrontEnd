import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ProcessExaminationPage from './pages/Dashboard/ProcessExaminationPage'
import DoctorDashboardLayout from './pages/Dashboard'
import ForgetPasswordPage from './pages/ForgetPasswordPage'
import MedicineManagement from './pages/Dashboard/MedicineManagement'
import PatientManagement from './pages/Dashboard/PatientManagement'
import MedicalRecordManagement from './pages/Dashboard/MedicalRecordManagement'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchMe } from './store/authSlice'
import DoctorProfile from './pages/Dashboard/DoctorProfile'
import AttendanceWidget from './pages/Dashboard/AttendanceWidget'

function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
     dispatch(fetchMe())
  },[])
  return (
    <Routes>
      {/* Trang login */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgetPasswordPage />} />
      {/* Dashboard chính của bác sĩ */}
    <Route path="/admin" element={<DoctorDashboardLayout />}>
  
      <Route index element={<Navigate to="examination" replace />} />
      
      <Route path="examination" element={<ProcessExaminationPage />} />
           <Route path="medicine" element={<MedicineManagement />} />
           <Route path="patient" element={<PatientManagement />} />
           <Route path="medicalRecord" element={<MedicalRecordManagement />} />
           <Route path="doctor-profile" element={<DoctorProfile />} />
           <Route path="attendance-widget" element={<AttendanceWidget />} />
       </Route>
    </Routes>
  )
}

export default App
