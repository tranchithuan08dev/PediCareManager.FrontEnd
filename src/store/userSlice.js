import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "../services/userService";

const name = "user";

const initialState = {
  listUsers :[],
  userDetail :{},
 
    
};
export const fetchGetAllUsers = createAsyncThunk(`${name}/fetchGetAllUsers`, async () => {
    try {
        const res = await userService.getAll();
   
        
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});

export const fetchGetDetailUser = createAsyncThunk(`${name}/fetchGetDetailUser`, async (id) => {
    try {
        const res = await userService.getDetail(id);
        console.log("userDetai", res);
        
        return res.data;
    } catch (error) {
        return {
            ok: false,
            message: 'Lỗi xảy ra'
        }
    }
});




const userSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchGetAllUsers.fulfilled, (state, action) => {
          
            state.listUsers = action.payload;
        });
        builder.addCase(fetchGetDetailUser.fulfilled, (state, action) => {
            state.userDetail = action.payload;
        });
        
    },
})

export default userSlice.reducer;