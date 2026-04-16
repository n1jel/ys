import { createSlice } from "@reduxjs/toolkit";
import firestore from '@react-native-firebase/firestore';

const initialState = {
    unreadsChat: 0,
};

export const ChatCount = createSlice({
    name: "ChatCount",
    initialState: initialState,
    reducers: {
        setUnreadChats: (state, actions) => {
            state.unreadsChat = actions.payload
        },
    }
})

export const { setUnreadChats } = ChatCount.actions;
export default ChatCount.reducer

export const getChatUnreadCount = (id) => {
    return async (dispatch) => {
        // const unsubscribe = firestore().collection("chats").where("userIds", "array-contains", id).onSnapshot((querySnapshot) => {
        //     let totalUnreadCount = 0
        //     for (let snaps of querySnapshot.docs) {
        //         let data = snaps.data()
        //         if (data?.type != "group") {
        //             let unreadCount = data?.unreadCount ? data?.unreadCount[id] : 0
        //             totalUnreadCount += unreadCount
        //         }
        //     }
        //     console.log("TotalUnresadads0", totalUnreadCount);
        //     dispatch(setUnreadChats(totalUnreadCount))
        // })
        // return () => unsubscribe();
    }
}