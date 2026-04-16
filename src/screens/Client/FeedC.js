import { FlatList, StyleSheet, ImageBackground, View, Pressable, Keyboard, Text, RefreshControl, Alert, ActivityIndicator, Linking } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../components/Header'
import FeedBlock from '../../components/FeedBlock'
import Appimg from '../../constants/Appimg'
import Searchbar from '../../components/Searchbar'
import { editProfileClient, getClientFeed, getuserclientdetail, getuserdetail, LikeUnlike, LikeUnlikeBrand, SendNotification } from '../../apimanager/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import moment from 'moment'
import { fileUrl } from '../../apimanager/httpmanager'
import Realm from 'realm'
import { FollowCollection, LikeCollection, MediaCollection, StylistCollection, ClientCollection } from '../../schema/ClientCollection'
import { FeedClientReducer, SaveFeedClientReducer, setNotification } from '../../redux/CommanReducer'
import showToast from '../../CustomToast'
import messaging from '@react-native-firebase/messaging';
import { getChatUnreadCount, setUnreadChats } from '../../redux/ChatCount'

const FeedC = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const user = useSelector((state) => state?.auth?.user)
    const connected = useSelector(state => state.CommanReducer?.connected)
    const feed = useSelector(state => state.CommanReducer?.feedclient)
    let theme = useSelector(state => state.theme?.theme)

    const [feedData, setFeedData] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const limit = 10
    const [page, setPage] = useState(0)
    const [totalPage, setTotalPage] = useState(0)
    const [gettingMore, setGettingMore] = useState(false)

    useFocusEffect(useCallback(() => {
        get_details()
    }, []))

    useEffect(() => {
        if (!connected) {
            dispatch(FeedClientReducer())
        }
        else {
            getFeeds(1)
        }
    }, [connected])

    // useEffect(() => {
    //     if (connected && user?._id) {
    //         let id = user?._id
    //         const unsubscribe = firestore().collection("chats").where("userIds", "array-contains", id).onSnapshot((querySnapshot) => {
    //             let totalUnreadCount = 0
    //             for (let snaps of querySnapshot.docs) {
    //                 let data = snaps.data()
    //                 if (data?.type != "group") {
    //                     let unreadCount = data?.unreadCount ? data?.unreadCount[id] : 0
    //                     totalUnreadCount += unreadCount
    //                 }
    //             }
    //             console.log("TotalUnresadads0", totalUnreadCount);
    //             dispatch(setUnreadChats(totalUnreadCount))
    //         })
    //         return () => unsubscribe();
    //         // const unsubscribe = dispatch(getChatUnreadCount(user?._id));

    //         // return () => {
    //         //     if (unsubscribe) {
    //         //         unsubscribe();
    //         //     }
    //         // };
    //     }
    // }, [connected, user?._id])

    useEffect(() => {
        setFeedData([...feed])
    }, [feed])

    useEffect(() => {
        if (user?.notification_status == 1) {
            updateFcmToken()
        }
    }, [user])

    const updateFcmToken = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
            Alert.alert("Permission required", "Enable notification permission", [{ text: "Ok", onPress: () => Linking.openSettings() }, { text: "Cancel", style: "cancel" }])

            return
        }
        const token = await messaging().getToken();
        if (!token) {
            return
        }
        try {
            let formdata = new FormData()
            formdata.append("fcm_token", token)
            let res = await editProfileClient(formdata)
        } catch (e) {
            console.error(e);
        }
    }
    async function get_details() {
        try {
            let res = await getuserclientdetail()
            if (res?.data?.status) {
                if (res?.data?.other) {
                    dispatch(setNotification(res.data.other.new_notification))
                }
            } else {
            }
        } catch (e) {
        } finally {
        }
    }
    const getFeeds = async (page) => {
        let body = { page, limit }
        try {
            dispatch(setLoading(true))
            let res = await getClientFeed(body)
            if (res?.data?.status) {
                setFeedData(res?.data?.data)
                setPage(res?.data?.other?.current_page)
                setTotalPage(res?.data?.other?.total_page)
                // Realm.deleteFile({ schema: [ClientCollection, StylistCollection, FollowCollection, MediaCollection, LikeCollection] })
                // res.data.data.forEach(async element => {
                //     if (element) {
                //         dispatch(SaveFeedClientReducer(element))
                //     }
                // });
            } else {
                setFeedData([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreData = () => {
        if (page < totalPage) {
            getMoreFeeds(page + 1)
        }
    }
    const getMoreFeeds = async (page) => {
        let body = { page, limit }
        try {
            setGettingMore(true)
            let res = await getClientFeed(body)
            if (res?.data?.status) {
                let temp = [...feedData]
                temp = temp.concat(res?.data?.data)
                setFeedData(temp)
                setPage(res?.data?.other?.current_page)
            }
        } catch (e) {
        } finally {
            setGettingMore(false)
        }
    }
    // async function on_send(item, activeIndex, from = "message") {
    //     let isBrand = item?.brand_id ? true : false

    //     let uploadedBy = isBrand ? item?.brand_data?.[0] : item?.stylist_data?.[0]
    //     let uId = isBrand ? item?.brand_id : item?.stylist_id

    //     let room = [item?.uId, user?._id].sort().join("_")
    //     // console.log(room, item?.media_data[activeIndex]?.media_name);
    //     let type = item?.media_data[activeIndex]?.media_type
    //     const message = {
    //         _id: moment().unix(),
    //         text: type == "video" ? "Video" : 'Picture',
    //         type: type || "image",
    //         image: fileUrl + item?.media_data[activeIndex]?.media_name,
    //         imageData: item?.media_data[activeIndex],
    //         collectionitem: item,
    //         isConfirmed: 0,
    //         isLiked: from == "liked" ? 1 : 0,
    //         createdAt: moment().unix(),
    //         user: {
    //             _id: user?._id,
    //             full_name: user?.full_name,
    //             profile_pic: user?.profile_pic
    //         }
    //     }
    //     firestore().collection('chats').doc(room).get().then(documentSnapshot => {
    //         if (documentSnapshot.data()) {
    //             let current = item?.media_data[activeIndex]
    //             firestore().collection('chats').doc(room).collection("messages").add(message)
    //             firestore().collection('chats').doc(room).set({
    //                 users: [user, item.stylist_data[0]],
    //                 unreadCount: {
    //                     [`${user?._id}`]: 0,
    //                     [`${item?.stylist_id}`]: firestore.FieldValue.increment(1),
    //                 },
    //                 userIds: [user?._id, item?.stylist_id],
    //                 lastMessage: message,
    //                 type: "single",
    //             }, { merge: true }).then((res) => {
    //                 from != "liked" && navigation.navigate('ClientChat', { item: item?.stylist_data[0] }), SendNotification({ collection_id: item?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'stylist', user_id: item?.stylist_id, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'client', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
    //             })
    //         }
    //         else {
    //             firestore().collection('chats').doc(room).collection("messages").add(message)
    //             firestore().collection('chats').doc(room).set({
    //                 users: [user, item.stylist_data[0]],
    //                 unreadCount: {
    //                     [`${user?._id}`]: 0,
    //                     [`${item?.stylist_id}`]: firestore.FieldValue.increment(1),
    //                 },
    //                 userIds: [user?._id, item?.stylist_id],
    //                 lastMessage: message,
    //                 type: "single",
    //                 // products: [{ "id": item?.media_data[activeIndex]?._id, isConfirmed: 0 }]
    //             }, { merge: true }).then((res) => {
    //                 from != "liked" && navigation.navigate('ClientChat', { item: item?.stylist_data[0] }), SendNotification({ collection_id: item?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'stylist', user_id: item?.stylist_id, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'client', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
    //             })
    //         }
    //     });
    // }
    async function on_send(item, activeIndex, from = "message") {
        const isBrand = item?.brand_id ? true : false

        const uploadedBy = isBrand ? item?.brand_data?.[0] : item?.stylist_data?.[0]
        const uId = isBrand ? item?.brand_id : item?.stylist_id

        let room = [uId, user?._id].sort().join("_")
        // console.log(room, item?.media_data[activeIndex]?.media_name);
        let type = item?.media_data[activeIndex]?.media_type
        const message = {
            _id: moment().unix(),
            text: type == "video" ? "Video" : 'Picture',
            type: type || "image",
            image: fileUrl + item?.media_data[activeIndex]?.media_name,
            imageData: item?.media_data[activeIndex],
            collectionitem: item,
            isConfirmed: 0,
            isLiked: from == "liked" ? 1 : 0,
            createdAt: moment().unix(),
            user: {
                _id: user?._id,
                full_name: user?.full_name,
                profile_pic: user?.profile_pic
            }
        }
        firestore().collection('chats').doc(room).get().then(documentSnapshot => {
            firestore().collection('chats').doc(room).collection("messages").add(message)
            firestore().collection('chats').doc(room).set({
                users: [user, uploadedBy],
                unreadCount: {
                    [`${user?._id}`]: 0,
                    [`${uId}`]: firestore.FieldValue.increment(1),
                },
                userIds: [user?._id, uId],
                lastMessage: message,
                type: "single",
            }, { merge: true }).then((res) => {
                if (from != "liked") {
                    navigation.navigate('ClientChat', { item: isBrand ? { ...uploadedBy, user_type: "brand" } : uploadedBy })
                    SendNotification({ collection_id: item?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'stylist', user_id: uId, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'client', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
                }
            })
        });
    }
    async function on_press_like(item, index, type) {
        let isBrand = item?.brand_id ? true : false
        let body = {
            collection_id: item?._id,
            media_id: item?.media_data[0]?._id,
            ...(!isBrand ? { stylist_id: item?.stylist_id } : { brand_id: item?.brand_id })
        }
        // let room = [item?.stylist_id, user?._id].sort().join("_")
        try {
            dispatch(setLoading(true))
            let res
            if (isBrand)
                res = await LikeUnlikeBrand(body)
            else
                res = await LikeUnlike(body)
            if (res?.data?.status) {
                getFeeds(1, 100)
                if (item?.media_data[0]?.like_data?.length) {
                    return
                }
                if (type == "like") {
                    on_send(item, index, "liked")
                }
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header isHome={true} showCloset shownotes onHangerPress={() => { navigation.navigate('ClosetC') }} onNotespress={() => { navigation.navigate('ClientNotes') }} showNoti={true} onPressProfile={() => { navigation.navigate("ProfileC") }} onBellPress={() => { navigation?.navigate('NotificationC') }} showUser={true} containerStyle={{ justifyContent: "space-between" }} />
                <View style={{ marginTop: 8 }} />
                <Pressable onPress={() => { navigation.navigate("SearchC") }} >
                    <Searchbar textInputProps={{
                        onFocus: () => {
                            navigation.navigate("SearchC")
                            Keyboard.dismiss()
                        }
                    }} place="Search Personal Stylist/Brand..." />
                </Pressable>
                <FlatList
                    data={feedData}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={() => getFeeds(1)} />
                    }
                    ListEmptyComponent={() => {
                        return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, marginTop: 120, textAlign: 'center' }]}>No Collection found</Text>)
                    }}
                    renderItem={({ item, index }) => {
                        return (
                            <FeedBlock item={item}
                                onPressPost={() => { navigation.navigate('CollectionsC', { _item: item }) }}
                                onPressLike={(ind) => {
                                    if (!connected) {
                                        showToast('No internet connection')
                                    }
                                    else {
                                        on_press_like(item, ind, "like")
                                    }
                                }}
                                onMessagePress={(ind) => {
                                    if (!connected) {
                                        showToast('No internet connection')
                                    }
                                    else {
                                        on_send(item, ind)
                                        if (item?.media_data?.[0]?.like_data?.length == 0) {
                                            on_press_like(item, ind, "message")
                                        }
                                    }
                                }}
                            />
                        )
                    }}
                    onEndReached={() => checkForMoreData()}
                />
                {gettingMore && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
            </View>
        </ImageBackground>
    )
}

export default FeedC

const styles = StyleSheet.create({
    main: {
        width: "100%", height: "100%"
    },
})