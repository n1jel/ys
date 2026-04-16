import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    uploadTask:{},
    failedTask:{},
    isUploading:false,
    progress:0,
    currentBatch:0,
    totalBatchSize:0,
    
}

const uploadReducer = createSlice({
    name: "uploadReducer",
    initialState: initialState,
    reducers: {
        setUploadTask: (state, action) => {
            state.uploadTask = action.payload
        },
        setIsUploading: (state, action) => {
            state.isUploading = action.payload
        },
        setProgress: (state, action) => {
            state.progress = action.payload
        },
        setCurrentBatch: (state, action) => {
            state.currentBatch = action.payload
        },
        setTotalBatchSize: (state, action) => {
            state.totalBatchSize = action.payload
        },
        setFailedTask: (state, action) => {
            state.failedTask = action.payload
        },
       
    }
})

export const {setUploadTask,setIsUploading,setCurrentBatch,setProgress,setTotalBatchSize,setFailedTask } = uploadReducer.actions
export default uploadReducer.reducer
