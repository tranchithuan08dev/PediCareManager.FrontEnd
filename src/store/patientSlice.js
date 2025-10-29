import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import patientService from "../services/patientService";

const name = "patient";

const initialState = {
  listPatient :[],
  patientDetail :{}
    
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

    },
})

export default patientSlice.reducer;