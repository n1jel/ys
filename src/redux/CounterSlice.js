import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  Userdata: {},
  Token: "",
};

export const UserReducer = createSlice({
  name: "UserReducer",
  initialState: initialState,
  reducers: {
    setToken: (state, actions) => {
      state.Token = actions.payload;
    },
    Userdata: (state, actions) => {
      state.Userdata = actions.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setToken, Userdata } = UserReducer.actions;

export default UserReducer.reducer;
