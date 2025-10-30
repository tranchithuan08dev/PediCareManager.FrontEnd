import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import medicineService from "../services/medicineService";

const name = "medicine";

const initialState = {
  listMedicine :[],
  medicineDetail :{}
    
};
export const fetchGetAllMedicine = createAsyncThunk(`${name}/fetchGetAllMedicine`, async () => {
    try {
        const res = await medicineService.getAll();
        return res;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});

export const fetchGetDetailMedicine = createAsyncThunk(`${name}/fetchGetDetailMedicine`, async (id) => {
    try {
        const res = await medicineService.getDetail(id);  
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});


export const fetchGetDetailMedicineRecords = createAsyncThunk(`${name}/fetchGetDetailMedicineRecords`, async (id) => {
    try {
        const res = await medicineService.getMedicalRecords(id);
        console.log("ress", res);
        
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});



const medicineSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchGetAllMedicine.fulfilled, (state, action) => {
            state.listMedicine = action.payload.data;
        });
        builder.addCase(fetchGetDetailMedicine.fulfilled, (state, action) => {
            state.medicineDetail = action.payload.data;
        });

    },
})

export default medicineSlice.reducer;