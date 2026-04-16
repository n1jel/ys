import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export const callDataSlice = createSlice({
    name: 'CallData',
    initialState: {
     
        showIntro: false,
        videoCall:false,
        notification: {},
        call_state: false,
        current_notification_data: {},
    
        callActive: "",
     
        callEngine: null,
        navigationParams: {},
        navigationSender: {},

        callStates: {
            remoteUid: 123,
            audioEnabled: true,
            otherAudioEnabled: true,
            callStatus: "Connecting...",
            isJoined: false,
            stateTimer: moment().unix(),
            enableSpeakerphone: false,
            switchCamera:false,
            videoEnabled:true,
            audioEnabled:true,
            otherVideoEnabled:true
        },
        
    },
    reducers: {
     
        SetNotification: (state, action) => {
            state.notification = action.payload;
        },
        SetCallState: (state, action) => {
            state.call_state = action.payload;
        },
        SetCurrentNotificationData: (state, action) => {
            state.current_notification_data = action.payload;
        },
     
   
        setCallS: (state, action) => {
            state.callActive = action.payload;
        },
        setCallEngine: (state, action) => {
            state.callEngine = action.payload;
        },
        setNavigationParams: (state, action) => {
            state.navigationParams = action.payload;
        },
        setNavigationSender: (state, action) => {
            state.navigationSender = action.payload;
        },
        setCallStates: (state, action) => {
            state.callStates = action.payload;
        },
        setisVideoCall: (state, action) => {
            state.videoCall = action.payload;
        },
 
    },
});

export const {
 
    SetNotification,
    SetCallState,
    SetCurrentNotificationData,
 
    setCallS,
  
    setCallEngine,
    setNavigationParams,
    setCallStates,
 
    setNavigationSender,
    setisVideoCall
} = callDataSlice.actions;

export default callDataSlice.reducer;
