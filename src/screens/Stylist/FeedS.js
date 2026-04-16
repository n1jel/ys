import { FlatList, StyleSheet, ImageBackground, View, Pressable, Keyboard, Text, RefreshControl, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../components/Header'
import FeedBlock from '../../components/FeedBlock'
import Searchbar from '../../components/Searchbar'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { GetCollection, SendNotification, editProfileStylist, getHomeFeed, getuserclientdetail, getuserstylistdetail, likeUnlikeStylist } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { FeedStylistReducer, Productdetail, SaveFeedStylistReducer, setNotification } from '../../redux/CommanReducer'
import { SFollowCollection, SLikeCollection, SMediaCollection, StylistData, StylistFeedCollection } from '../../schema/StylistCollection'
import Realm from 'realm'
import messaging from '@react-native-firebase/messaging';
import showToast from '../../CustomToast'
import PageLoaderComponent from '../../components/PageLoaderComponent'
import moment from 'moment'
import { fileUrl } from '../../apimanager/httpmanager'
import firestore from '@react-native-firebase/firestore';
import { getChatUnreadCount, setUnreadChats } from '../../redux/ChatCount'

const FeedS = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const connected = useSelector(state => state.CommanReducer?.connected)
    // const connected = false
    const feed = useSelector(state => state.CommanReducer?.feedStylist)
    const user = useSelector(state => state?.auth?.user)

    const limit = 16
    const [paginationData, setPaginationData] = useState({ current_page: 0, total_page: 0 })
    const [feedData, setFeedData] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)

    useFocusEffect(useCallback(() => {
        get_details()
    }, []))
    useEffect(() => {
        if (!connected) {
            dispatch(FeedStylistReducer())
        } else {
            get_collection()
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
        if (!connected) {
            setFeedData([...feed])
        }
    }, [feed, connected])
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
            let res = await editProfileStylist(formdata)
        } catch (e) {
        }
    }
    const queryBuilder = (pg) => {
        return `?page=${pg}&limit=${limit}`
    }
    async function get_collection() {
        try {
            dispatch(setLoading(true))
            let res = await getHomeFeed(queryBuilder(1))
            if (res?.data?.status) {
                setFeedData(res.data.data)
                dispatch(setLoading(false))
                let { current_page, total_page } = res?.data?.other
                setPaginationData({ current_page, total_page })
                // Realm.deleteFile({ schema: [StylistFeedCollection, StylistData, SFollowCollection, SMediaCollection, SLikeCollection], path: 'StylistFeedCollection.realm' })
                // res.data.data.forEach(async element => {
                //     if (element) {
                //         dispatch(SaveFeedStylistReducer(element))
                //     }
                // })
            } else {
                setFeedData([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
            setIsFetching(false)
        }
    }
    const endReached = () => {
        const { total_page, current_page } = paginationData
        if (current_page < total_page && !loadingMore) {
            getMoreData(current_page + 1)
        }
    }
    const getMoreData = async (pg) => {
        try {
            setLoadingMore(true)
            let res = await getHomeFeed(queryBuilder(pg))
            if (res?.data?.status) {
                let temp = [...feedData].concat(res?.data?.data)
                setFeedData(temp)
                let { current_page, total_page } = res?.data?.other
                setPaginationData({ current_page, total_page })
            } else {
                setFeedData([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false)
        }
    }
    async function get_details() {
        let res = await getuserstylistdetail()
        try {
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
    const _renderItem = ({ item, index }) => {
        return (
            <FeedBlock item={item} stylist={true}
                onPressPost={() => {
                    if (item?.stylist_id) {
                        dispatch(Productdetail(item._id))
                        navigation.navigate("ProductScreen", { _item: item })
                    } else {
                        navigation.navigate("ProductScreenBrands", { _item: item })
                    }
                }}
                onPressLikeCount={() => {
                    navigation.navigate("ProductLikes", { item })
                }}
                onPressLike={() => {
                    let obj = { collection_id: item?._id, brand_id: item?.brand_id, media_id: item?.media_data?.[0]?.media_id }
                    likingFuntion(obj, index, item)
                }}
                onMessagePress={() => {
                    sendMessage(item, 0)
                }}
            />
        )
    }
    const likingFuntion = async (data, index, item) => {
        try {
            let response = await likeUnlikeStylist(data)
            if (response?.data?.status) {
                // updateData(response?.data?.data, index)
                if (item?.media_data[0]?.like_data?.length) {
                    return
                }
                sendMessage(item, 0, "liked")
            } else {
                showToast(response?.data?.message)
            }
        } catch (e) {
            console.error(e);
        }
    }
    const updateData = useCallback((data, index) => {
        let temp = [...feedData]
        let x = temp[index]
        let mediaD = x?.media_data[0]
        x = { ...x, like_data: data ?? [] }
        console.log(x);
        temp.splice(index, 1, x)
        setFeedData(temp)
    }, [feedData])
    async function sendMessage(item, activeIndex = 0, from = "message") {
        const isBrand = item?.brand_id ? true : false

        const uploadedBy = isBrand ? item?.brand_data?.[0] : item?.stylist_data?.[0]
        const uId = isBrand ? item?.brand_id : item?.stylist_id

        let room = [uId, user?._id].sort().join("_")
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
                    navigation.navigate('StylistChat', { item: isBrand ? { ...uploadedBy, user_type: "brand" } : uploadedBy })
                    SendNotification({ collection_id: item?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'brand', user_id: uId, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'brand', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
                }
            })
        });
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            <Header isHome={true} shownotes onNotespress={() => navigation.navigate('Notes')} showNoti={true} onPressProfile={() => { navigation.navigate("ProfileS") }} onBellPress={() => { navigation?.navigate('NotificationS') }} showUser={true} containerStyle={{ justifyContent: "space-between" }} />
            <View style={{ marginTop: 8 }} />
            <Pressable onPress={() => { navigation.navigate("SearchS") }} >
                <Searchbar place="Search Brands"
                    textInputProps={{
                        onFocus: () => {
                            navigation.navigate("SearchS")
                            Keyboard.dismiss()
                        }
                    }}
                />
            </Pressable>
            <FlatList
                data={feedData}
                contentContainerStyle={{ paddingBottom: 20 }}
                removeClippedSubviews={true}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => get_collection()} />}
                ListEmptyComponent={() => {
                    return (<Text style={[Commonstyles(Appcolor).bold20, styles.noDataTxt]}>No Collection found</Text>)
                }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item?._id}
                renderItem={_renderItem}
                onEndReached={endReached}
                ListFooterComponent={() => { return (<PageLoaderComponent loadingMore={loadingMore} />) }}
            />
        </View>
    )
}

export default FeedS

const styles = StyleSheet.create({
    noDataTxt: {
        fontSize: RFValue(14),
        margin: 18,
        marginTop: 120,
        textAlign: 'center',
    },
    main: {
        width: "100%", height: "100%"
    },
})