import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../services/authService";

const name = "auth";

const initialState = {
    token: null,
    
};
export const fetchLogin = createAsyncThunk(`${name}/fetchLogin`, async (params = {}) => {
    try {
        const res = await authService.login(params);
        const token = res.data.token;
      
        return {
            ok: true,
            data: {
                token,
             
            }
        };
    } catch (error) {
        return {
            ok: false,
            message: 'Thông tin đăng nhập của bạn không đúng!'
        }
    }
});


const authSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchLogin.fulfilled, (state, action) => {
            if (action.payload.ok) {
                state.token = action.payload.data.token;
              
            }
        });
      

    },
})

export default authSlice.reducer;