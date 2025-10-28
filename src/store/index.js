import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'
const store = configureStore({
  reducer: {
     AUTH: authReducer,
  },
});

export default store;