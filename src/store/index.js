import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'
import medicineReducer from './medicineSlice'
import patientReducer from './patientSlice'
const store = configureStore({
  reducer: {
     AUTH: authReducer,
     MEDICINE: medicineReducer,
     PATIENT: patientReducer,
  },
});

export default store;