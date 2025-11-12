import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import checkAttendanceService from "../services/checkAttendanceService";

const name = "checkAttendance";

const initialState = {
  checkstatus: {},
};

// ✅ Check In
export const fetchCheckIn = createAsyncThunk(`${name}/fetchCheckIn`, async () => {
  try {
    const res = await checkAttendanceService.checkIn();
    return res.data;
  } catch (error) {
    console.error("Lỗi Check In:", error);
    throw error.response?.data || { message: "Lỗi khi Check In" };
  }
});

// ✅ Check Out
export const fetchCheckOut = createAsyncThunk(`${name}/fetchCheckOut`, async () => {
  try {
    const res = await checkAttendanceService.checkOut();
    return res.data;
  } catch (error) {
    console.error("Lỗi Check Out:", error);
    throw error.response?.data || { message: "Lỗi khi Check Out" };
  }
});

// ✅ Check Status
export const fetchCheckStatus = createAsyncThunk(`${name}/fetchCheckStatus`, async () => {
  try {
    const res = await checkAttendanceService.checkStatus();
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy trạng thái:", error);
    return {
      ok: false,
      isOverdue: false,
      warningMessage: "Không thể kiểm tra trạng thái điểm danh.",
    };
  }
});

export const fetchAttendanceReport = createAsyncThunk(`${name}/fetchAttendanceReport`, async (data) => {
  try {
    const res = await checkAttendanceService.attendanceReport(data);
    return res.data;
  } catch (error) {
   
   
  }
});


const checkAttendanceSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCheckStatus.fulfilled, (state, action) => {
      state.checkstatus = action.payload;
    });
  },
});

export default checkAttendanceSlice.reducer;
