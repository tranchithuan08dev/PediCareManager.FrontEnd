import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'
import medicineReducer from './medicineSlice'
const store = configureStore({
  reducer: {
     AUTH: authReducer,
     MEDICINE: medicineReducer,
  },
});

export default store;