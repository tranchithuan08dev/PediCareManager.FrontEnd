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
import AdminDashboard from './pages/Admin'
import MedicineManagementAdmin from './pages/Admin/MedicineManagementAdmin'
import PatientManagementAdmin from './pages/Admin/PatientManagementAdmin'
import DailyRevenueReport from './pages/Admin/DailyRevenueReport'
import MonthlyTransactionReport from './pages/Admin/MonthlyTransactionReport'
import ListDoctor from './pages/Admin/ListDoctor'
import AttendanceDoctor from './pages/Admin/AttendanceDoctor'
import MedicineForm from './pages/Admin/MedicineForm'

function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
     dispatch(fetchMe())
  },[])
  return (
    <Routes>
      {/* Trang login */}
      <Route path="/" element={<LoginPage />} />

      <Route path="/admin" element={<AdminDashboard />} >
         <Route index element={<Navigate to="medicine" replace />} />
         <Route path="medicine" element={<MedicineManagementAdmin />} />
         <Route path="patient" element={<PatientManagementAdmin />} />
         <Route path="reports" element={<DailyRevenueReport />} />
         <Route path="create-medicine" element={<MedicineForm />} />
         <Route path="monthly-transaction-report" element={<MonthlyTransactionReport />} />  
         <Route path="doctor-profile" element={<ListDoctor />} />
         <Route path="attendance-reports" element={<AttendanceDoctor />} />
      </Route>

      <Route path="/dashboard" element={<DoctorDashboardLayout />}>
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
