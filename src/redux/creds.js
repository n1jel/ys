import { createSlice } from "@reduxjs/toolkit";

const credSlice = createSlice({
    name: "creds",
    initialState: {
        credList: []
    },
    reducers: {
        updateCredData: (state, action) => {
            state.credList = action.payload
        },
        clearAllCredentials: (state, action) => {
            state.credList = []
        },
    }
})

export const { updateCredData, clearAllCredentials } = credSlice.actions
export default credSlice.reducer
