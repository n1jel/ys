import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isActive: false,
    isUploadingNative:false
}

const appstateSlice = createSlice({
    name: "appstate",
    initialState: initialState,
    reducers: {
        updateAppstate: (state, action) => {
            state.isActive = action.payload
        },
        setisUploadingNative: (state, action) => {
            state.isUploadingNative = action.payload
        },
    }
})

export const { updateAppstate,setisUploadingNative } = appstateSlice.actions
export default appstateSlice.reducer
