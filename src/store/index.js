import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'
import medicineReducer from './medicineSlice'
import patientReducer from './patientSlice'
import checkAttendanceReducer from './checkAttendanceSlice'
const store = configureStore({
  reducer: {
     AUTH: authReducer,
     MEDICINE: medicineReducer,
     PATIENT: patientReducer,
    checkAttendance: checkAttendanceReducer,
  },
});

export default store;