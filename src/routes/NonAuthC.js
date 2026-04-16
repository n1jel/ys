import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabC from './BottomTabC';
import { SafeAreaView } from 'react-native-safe-area-context';
import Appcolor from '../constants/Appcolor';
import DeleteAccountC from '../screens/Client/DeleteAccountC';
import TermsC from '../screens/Client/TermsC';
import EditProfileC from '../screens/Client/EditProfileC';
import ChangePasswordC from '../screens/Client/ChangePasswordC';
import ContactusC from '../screens/Client/ContactusC';
import NotificationC from '../screens/Client/NotificationC';
import MeasurementC from '../screens/Client/MeasurementC';
import ClientChat from '../screens/Client/ClientChat';
import CallClient from '../screens/Client/CallClient';
import VideoCallClient from '../screens/Client/VideoCallClient';
import ReceiveCall from '../screens/Client/RecieveCall';
import AudioReceiveCall from '../screens/Client/AudioReceiverCall';
import VideoReceiveCall from '../screens/Client/VideoReceiveCall';
import ClientNotes from '../screens/Client/ClientNotes';
import AddNotes from '../screens/Client/AddNotes';
import DeletedNotesC from '../screens/Client/DeletedNotesC';
import BiometricsC from '../screens/Client/BiometricsC';
import { useDispatch, useSelector } from 'react-redux';
import ProfileC from '../screens/Client/ProfileC';
import ClosetC from '../screens/Client/ClosetC';
import UploadScreen from '../screens/Client/UploadScreen';
import firestore from '@react-native-firebase/firestore';
import { setUnreadChats } from '../redux/ChatCount';

const NonAuthC = () => {
    const dispatch = useDispatch()

    const Stack = createNativeStackNavigator();
    let biometric = useSelector(state => state?.auth?.biometric)
    const user = useSelector(state => state?.auth?.user)

    useEffect(() => {
        if (user?._id) {
            let id = user?._id
            const unsubscribe = firestore().collection("chats").where("userIds", "array-contains", id).onSnapshot((querySnapshot) => {
                let totalUnreadCount = 0
                for (let snaps of querySnapshot.docs) {
                    let data = snaps.data()
                    if (data?.type != "group") {
                        let unreadCount = data?.unreadCount ? data?.unreadCount[id] : 0
                        totalUnreadCount += unreadCount
                    }
                }
                dispatch(setUnreadChats(totalUnreadCount))
            })
            return () => unsubscribe();
        }
    }, [user?._id])

    return (
        <SafeAreaView edges={["top"]} style={{ backgroundColor: Appcolor.txt, flex: 1 }}>
            <Stack.Navigator initialRouteName={biometric == "0" ? "BiometricsC" : "BottomTabC"} screenOptions={{ headerShown: false }}>
                <Stack.Screen component={BottomTabC} name="BottomTabC" options={{ gestureEnabled: false }} />
                <Stack.Screen component={ProfileC} name="ProfileC" />
                <Stack.Screen component={DeleteAccountC} name="DeleteAccountC" />
                <Stack.Screen component={TermsC} name="TermsC" />
                <Stack.Screen component={EditProfileC} name="EditProfileC" />
                <Stack.Screen component={ChangePasswordC} name="ChangePasswordC" />
                <Stack.Screen component={ContactusC} name="ContactusC" />
                <Stack.Screen component={NotificationC} name="NotificationC" />
                <Stack.Screen component={MeasurementC} name="MeasurementC" />
                <Stack.Screen component={ClientChat} name="ClientChat" />
                <Stack.Screen component={CallClient} name="CallClient" />
                <Stack.Screen component={VideoCallClient} name="VideoCallClient" />
                <Stack.Screen component={ReceiveCall} name="ReceiveCall" />
                <Stack.Screen component={AudioReceiveCall} name="AudioReceiveCall" />
                <Stack.Screen component={VideoReceiveCall} name="VideoReceiveCall" />
                <Stack.Screen component={ClientNotes} name="ClientNotes" />
                <Stack.Screen component={AddNotes} name="AddNotes" />
                <Stack.Screen component={DeletedNotesC} name="DeletedNotesC" />
                <Stack.Screen component={BiometricsC} name="BiometricsC" />
                <Stack.Screen component={ClosetC} name="ClosetC" />
                <Stack.Screen component={UploadScreen} name="UploadScreen" />
            </Stack.Navigator>
        </SafeAreaView>
    )
}

export default NonAuthC

const styles = StyleSheet.create({})