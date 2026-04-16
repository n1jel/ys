import { FlatList, StyleSheet, View, Text, RefreshControl, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../components/Header'
import FeedBlock from '../../components/FeedBlock'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { setLoading } from '../../redux/load'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { FeedStylistReducer, Productdetail, SaveFeedStylistReducer, setNotification } from '../../redux/CommanReducer'
import messaging from '@react-native-firebase/messaging';
import { getBrandDetail, getBrandFeed, likeParentPost, updateProfileBrand } from '../../apimanager/brandServices'
import { getData } from '../../utils/asyncstore'
import PageLoaderComponent from '../../components/PageLoaderComponent'
import showToast from '../../CustomToast'
import { getChatUnreadCount, setUnreadChats } from '../../redux/ChatCount'
import firestore from '@react-native-firebase/firestore';

const FeedB = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const [feedData, setFeedData] = useState([])
    const limit = 10
    const [paginationData, setPaginationData] = useState({ current_page: 0, total_page: 0 })
    const [loadingMore, setLoadingMore] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [token, setToken] = useState("")

    const connected = useSelector(state => state.CommanReducer?.connected)
    const feed = useSelector(state => state.CommanReducer?.feedStylist)
    const user = useSelector(state => state?.auth?.user)

    useFocusEffect(
        useCallback(() => {
            get_details()
        }, [])
    )
    useEffect(() => {
        getToken()
    }, [])
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
    //             console.log("TotalUnresadads0", totalUnreadCount, id);
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
    // useEffect(() => {
    //     if (!connected) {
    //         setFeedData([...feed])
    //     }
    // }, [feed, connected])
    useEffect(() => {
        if (user?.notification_status == 1 && token) {
            updateFcmToken()
        }
    }, [user, token])

    const updateFcmToken = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
            Alert.alert("Permission required", "Enable notification permission", [{ text: "Ok", onPress: () => Linking.openSettings() }, { text: "Cancel", style: "cancel" }])
            return
        }
        const fcmtoken = await messaging().getToken();
        if (!fcmtoken) {
            return
        }
        try {
            let obj = [{ name: "fcm_token", data: fcmtoken },]
            let res = await updateProfileBrand(obj, token)
        } catch (e) {
            console.error(e);
        }
    }
    const getToken = async () => {
        try {
            const tokens = await getData("@tokens");
            setToken(tokens)
        } catch (e) {
            console.error(e);
        }
    }
    const queryBuilder = (pg) => {
        return `?page=${pg}&limit=${limit}`
    }
    async function get_collection() {
        try {
            dispatch(setLoading(true))
            let res = await getBrandFeed(queryBuilder(1))
            if (res?.data?.status) {
                setFeedData(res.data.data)
                dispatch(setLoading(false))
                let { current_page, total_page } = res?.data?.other
                setPaginationData({ current_page, total_page })
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
            let res = await getBrandFeed(queryBuilder(pg))
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
        try {
            let res = await getBrandDetail()
            if (res?.data?.status) {
                if (res?.data?.other) {
                    dispatch(setNotification(res.data.other.new_notification))
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const likePost = async (item, index) => {
        try {
            let media_data = item?.media_data?.[0]
            let body = { collection_id: media_data?.collection_id, media_id: media_data?.media_id, brand_id: item?.brand_id }
            let res = await likeParentPost(body)
            if (res?.data?.status) {
                if (res?.data?.data) {
                    let temp = { ...item, like_data: [res?.data?.data] }
                    updateData(temp, index)
                } else {
                    let temp = { ...item, like_data: [] }
                    updateData(temp, index)
                }
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        }
    }
    const updateData = useCallback((data, index) => {
        let temp = [...feedData]
        temp.splice(index, 1, data)
        setFeedData(temp)
    }, [feedData])
    const _renderItem = ({ item, index }) => {
        return (
            <FeedBlock item={item}
                brand={true}
                onPressPost={() => {
                    navigation.navigate("ProductScreenB", { _item: item })
                }}
                onPressLike={() => {
                    likePost(item, index)
                }}
                onPressLikeCount={() => {
                    // navigation.navigate("ProductLikes", { item })
                }}
            />
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            <Header isHome={true} shownotes onNotespress={() => navigation.navigate('NotesB')} showNoti={true} onPressProfile={() => { navigation.navigate("ProfileB") }} onBellPress={() => { navigation?.navigate('NotificationB') }} showUser={true} containerStyle={{ justifyContent: "space-between" }} />
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
                ListFooterComponent={() => {
                    return (<PageLoaderComponent loadingMore={loadingMore} />)
                }}
            />
        </View>
    )
}

export default FeedB

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