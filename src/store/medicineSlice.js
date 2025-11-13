import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import medicineService from "../services/medicineService";
import { mappingDataMedicineProcessExaminationPage } from "../helpers";

const name = "medicine";

const initialState = {
  listMedicine :[],
   listMedicineProcessExamination :[],
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

export const fetchGetAllMedicineProcessExamination= createAsyncThunk(`${name}/fetchGetAllMedicineProcessExamination`, async () => {
    try {
        const res = await medicineService.getAll();
        return res.data.map(mappingDataMedicineProcessExaminationPage);
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
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});

export const fetchChangeQuanlity = createAsyncThunk(`${name}/fetchChangeQuanlity`, async (data) => {
    try {
        const res = await medicineService.changeQuanlity(data);
        console.log("res fetchChangeQuanlity", res);
        
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});


export const fetchUpdateMedicine = createAsyncThunk(`${name}/fetchUpdateMedicine`, async (data) => {
    try {
        const res = await medicineService.updateMedicine(data);
        console.log("res fetchChangeQuanlity", res);
        
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});


export const fetchCreateMedicine = createAsyncThunk(`${name}/fetchCreateMedicine`, async (data) => {
    try {
        const res = await medicineService.postMedicine(data);
        console.log("res fetchChangeQuanlity", res);
        
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
       builder.addCase(fetchGetAllMedicineProcessExamination.fulfilled, (state, action) => {
            state.listMedicineProcessExamination = action.payload;
        });
    },
})

export default medicineSlice.reducer;