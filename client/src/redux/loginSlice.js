import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userName: null,
  userId: null,
  userTypeId: null,
  brandId: null,
  campusId: null,
  token: null,
  nameOfPerson: null,
};

const userSlice = createSlice({
    name : "userSlice",
    initialState,
    reducers: {
        setUserAndToken: (state, action) => {
            state.userName = action.payload.userName;
            state.userId = parseInt(action.payload.id, 10);
            state.userTypeId = action.payload.userTypeId;
            state.brandId = action.payload.brandId;
            state.campusId = action.payload.campusId;
            state.token = action.payload.token;
            state.nameOfPerson = action.payload.nameOfPerson;
        },
        logout: (state) => {
            state.userName = null;
            state.userId = null;
            state.userTypeId = null;
            state.brandId = null;
            state.campusId = null;
            state.token = null;
            state.nameOfPerson = null;
        }
    }
})

export const {
    setUserAndToken,
    logout
} = userSlice.actions;

export default userSlice.reducer;
