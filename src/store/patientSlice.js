import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import patientService from "../services/patientService";

const name = "patient";

const initialState = {
  listPatient :[],
  patientDetail :{},
  patientHistory:[]
    
};
export const fetchGetAllPatient = createAsyncThunk(`${name}/fetchGetAllPatient`, async () => {
    try {
        const res = await patientService.getAll();
        return res;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});

export const fetchGetDetailPatient = createAsyncThunk(`${name}/fetchGetDetailPatient`, async (id) => {
    try {
        const res = await patientService.getDetail(id);
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});
export const fetchGetPatientHistory = createAsyncThunk(`${name}/fetchGetPatientHistory`, async (patientCode) => {
    try {
        const res = await patientService.getHistory(patientCode);
        console.log("ress", res);
        
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});



const patientSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchGetAllPatient.fulfilled, (state, action) => {
            state.listPatient = action.payload.data;
        });
        builder.addCase(fetchGetDetailPatient.fulfilled, (state, action) => {
            state.patientDetail = action.payload.data;
        });
         builder.addCase(fetchGetPatientHistory.fulfilled, (state, action) => {
           
            state.patientHistory = action.payload;
        });

    },
})

export default patientSlice.reducer;