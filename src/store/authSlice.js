import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import authService from "../services/authService";

const name = "auth";

const initialState = {
    token: null,
   currentuser:null,
    
};
export const fetchLogin = createAsyncThunk(`${name}/fetchLogin`, async (params = {}) => {
    try {
        const res = await authService.login(params);
        const token = res.data.token;
        const role =  res.data.role
        return {
            ok: true,
            data: {
                token,
                role
            }
        };
    } catch (error) {
        return {
            ok: false,
            message: 'Thông tin đăng nhập của bạn không đúng!'
        }
    }
});

export const fetchSendEmail = createAsyncThunk(`${name}/fetchSendEmail`, async (params = {}) => {
    try {
        const res = await authService.sendEmail(params);
       
        return res;
    } catch (error) {
       
    }
});

export const fetchResetPassword = createAsyncThunk(`${name}/fetchResetPassword`, async (params = {}) => {
    try {
        const res = await authService.resetPassword(params);
        return res;
    } catch (error) {
       
    }
});

export const fetchMe = createAsyncThunk(`${name}/fetchMe`, async () => {
    try {
        const res = await authService.getMe();
        return res;
    } catch (error) {
       
    }
});

export const fetchChangePassword = createAsyncThunk(`${name}/fetchChangePassword`, async (data) => {
    try {
        const res = await authService.changePassword(data);
        console.log("res fetchChangePassword", res);
        
        return res;
    } catch (error) {
       
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
                localStorage.setItem("ACCESS_TOKEN", state.token);
            }
        });
       builder.addCase(fetchMe.fulfilled, (state, action) => {
      
                  state.currentuser = action.payload.data;
              });

    },
})

export default authSlice.reducer;