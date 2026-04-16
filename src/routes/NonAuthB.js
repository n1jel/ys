import { Alert, NativeEventEmitter, NativeModules, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ProfileB from '../screens/Brands/ProfileB'
import Appcolor from '../constants/Appcolor'
import { SafeAreaView } from 'react-native-safe-area-context'
import EditProfileB from '../screens/Brands/EditProfileB'
import ChangePasswordB from '../screens/Brands/ChangePasswordB'
import AddStylistsB from '../screens/Brands/AddStylistsB'
import BottomTabB from './BottomTabB'
import { setisUploadingNative } from '../redux/appstate'
import CreateCollectionB from '../screens/Brands/CreateCollectionB'
import UserGalleryB from '../screens/Brands/UserGalleryB'
import ImageSelectionGalleryB from '../screens/Brands/ImageSelectionGalleryB'
import ProductScreenB from '../screens/Brands/ProductScreenB'
import NotesB from '../screens/Brands/NotesB'
import CreateNotesB from '../screens/Brands/CreateNotesB'
import DeletedNotesB from '../screens/Brands/DeletedNotesB'
import ProductEditScreenB from '../screens/Brands/ProductEditScreenB'
import UserGalleryUpdateB from '../screens/Brands/UserGalleryUpdateB'
import NotificationB from '../screens/Brands/NotificationB'
import BrandChat from '../screens/Brands/BrandChat'
import BiometricB from '../screens/Brands/BiometricB'
import ProfileClientStylist from '../screens/Brands/ProfileClientStylist'
import TermsB from '../screens/Brands/TermsB'
import DeleteAccountB from '../screens/Brands/DeleteAccountB'
import ContactusB from '../screens/Brands/ContactusB'
import EmployeeProfile from '../screens/Brands/EmployeeProfile'
import AudioReceiveCall from '../screens/Client/AudioReceiverCall'
import VideoReceiveCall from '../screens/Client/VideoReceiveCall'
import ReceiveCall from '../screens/Client/RecieveCall';
import VideoCallBrands from '../screens/Brands/VideoCallBrands'
import CallBrands from '../screens/Brands/CallBrands'
import TotalLikes from '../screens/Stylist/TotalLikes'
import LikedList from '../screens/Stylist/LikedList'
import { setUnreadChats } from '../redux/ChatCount'
import firestore from '@react-native-firebase/firestore';

const NonAuthB = ({ navigation }) => {
    const dispatch = useDispatch()
    const Stack = createNativeStackNavigator();
    const { Photopicker } = NativeModules;

    const user = useSelector(state => state?.auth?.user)

    let biometric = useSelector(state => state?.auth?.biometric)
    let uploadTask = useSelector(state => state?.uploadReducer?.uploadTask);
    let failedTask = useSelector(state => state?.uploadReducer?.failedTask);
    let isUploading = useSelector(state => state?.uploadReducer?.isUploading);

    const [uploadingStatus, setuploadingStatus] = useState()

    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(Photopicker)

        eventEmitter.addListener('status', (i) => {
            console.log(i, "Upload images count")
            if (i.total == i.completed || i.remaining == "0") {
                setuploadingStatus(null);
                dispatch(setisUploadingNative(false))
            } else {
                setuploadingStatus(i)
                dispatch(setisUploadingNative(true))
            }
        });
        return () => {
            eventEmitter.removeAllListeners("video")
        }
    }, [Photopicker])
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
        <SafeAreaView edges={['top']} style={{ backgroundColor: Appcolor.blackcolor, flex: 1 }}>
            {uploadingStatus && (
                <View style={{ width: '100%', height: 30, backgroundColor: 'rgba(60,60,60,1)', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, }}>
                    <Text style={{ color: 'white', alignSelf: 'center' }}>Uploading in progress ({uploadingStatus.completed}/{uploadingStatus.total})</Text>
                    <Text
                        style={{ color: 'red', alignSelf: 'center' }}
                        onPress={() => {
                            Alert.alert(
                                'Cancel Upload',
                                'Are you sure you want to cancel the upload progress',
                                [
                                    {
                                        text: 'Yes',
                                        onPress: () => {
                                            Photopicker.cancelUploading()
                                        },
                                    },
                                    {
                                        text: 'No',
                                    },
                                ],
                            );
                        }}
                    >
                        {failedTask?.parameters?.unifiedBatches?.length > 0 ? 'Failed' : 'Cancel'}
                    </Text>
                </View>
            )}
            <Stack.Navigator
                initialRouteName={biometric == '0' ? 'BiometricB' : user?.is_added_by_brand == 1 ? "BottomTabB" : "AddStylistsB"}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen component={AddStylistsB} name="AddStylistsB" />
                <Stack.Screen component={BiometricB} name="BiometricB" options={{ gestureEnabled: false }} />
                <Stack.Screen component={BottomTabB} name="BottomTabB" />
                <Stack.Screen component={ProfileB} name="ProfileB" />
                <Stack.Screen component={EditProfileB} name="EditProfileB" />
                <Stack.Screen component={ChangePasswordB} name="ChangePasswordB" />
                <Stack.Screen component={CreateCollectionB} name="CreateCollectionB" />
                <Stack.Screen component={ImageSelectionGalleryB} name="ImageSelectionGalleryB" />
                <Stack.Screen component={ProductScreenB} name="ProductScreenB" />
                <Stack.Screen component={ProductEditScreenB} name="ProductEditScreenB" />
                <Stack.Screen component={UserGalleryB} name="UserGalleryB" />
                <Stack.Screen component={NotesB} name="NotesB" />
                <Stack.Screen component={CreateNotesB} name="CreateNotesB" />
                <Stack.Screen component={DeletedNotesB} name="DeletedNotesB" />
                <Stack.Screen component={UserGalleryUpdateB} name="UserGalleryUpdateB" />
                <Stack.Screen component={NotificationB} name="NotificationB" />
                <Stack.Screen component={BrandChat} name="BrandChat" />
                <Stack.Screen component={ProfileClientStylist} name="ProfileClientStylist" />
                <Stack.Screen component={EmployeeProfile} name="EmployeeProfile" />
                <Stack.Screen component={TermsB} name="TermsB" />
                <Stack.Screen component={DeleteAccountB} name="DeleteAccountB" />
                <Stack.Screen component={ContactusB} name="ContactusB" />
                <Stack.Screen component={ReceiveCall} name="ReceiveCall" />
                <Stack.Screen component={AudioReceiveCall} name="AudioReceiveCall" />
                <Stack.Screen component={VideoReceiveCall} name="VideoReceiveCall" />
                <Stack.Screen component={CallBrands} name="CallBrands" />
                <Stack.Screen component={VideoCallBrands} name="VideoCallBrands" />
                <Stack.Screen component={TotalLikes} name="TotalLikes" initialParams={{ from: "brand" }} />
                <Stack.Screen component={LikedList} name="LikedList" initialParams={{ from: "brand" }} />
            </Stack.Navigator>
        </SafeAreaView>
    )
}

export default NonAuthB

const styles = StyleSheet.create({})