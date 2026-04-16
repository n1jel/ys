import { createSlice } from "@reduxjs/toolkit";

const loadSlice = createSlice({
    name: "load",
    initialState: { isLoading: false, userGallery: false },
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setUserGalleryLoader: (state, action) => {
            state.userGallery = action.payload
        },
    }
})

export const { setLoading, setUserGalleryLoader } = loadSlice.actions

export default loadSlice.reducer