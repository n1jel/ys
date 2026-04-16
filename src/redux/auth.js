import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    authorize: false,
    token: "",
    isSubscribe: "0",
    biometric: "0",
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        authorize: (state, action) => {
            state.authorize = true
            state.token = action.payload.token
            state.user = action.payload.user
        },
        setUser: (state, action) => {
            state.user = action.payload.user
        },
        setisSubscribe: (state, action) => {
            state.isSubscribe = action.payload
        },
        setbiometric: (state, action) => {
            state.biometric = action.payload
        },
        signout: (state, action) => {
            return initialState
        },
    }
})

export const { authorize, setUser, signout, setisSubscribe, setbiometric } = authSlice.actions
export default authSlice.reducer
