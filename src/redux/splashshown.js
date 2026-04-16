import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSplashShown: false,
}

const splashShownSlice = createSlice({
    name: "splashshown",
    initialState: initialState,
    reducers: {
        setSplashShown: (state, action) => {
            state.isSplashShown = action.payload
        },
    }
})

export const { setSplashShown } = splashShownSlice.actions
export default splashShownSlice.reducer
