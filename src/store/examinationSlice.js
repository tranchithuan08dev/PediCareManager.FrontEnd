import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import examinationService from "../services/examinationService";

const name = "examination";

const initialState = {

};
export const fetchPostExamination = createAsyncThunk(`${name}/fetchPostExamination`, async (data) => {
    try {
        const res = await examinationService.postExamination(data);
        console.log("post", res);
        
        return res;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});



const examinationSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      

    },
})

export default examinationSlice.reducer;