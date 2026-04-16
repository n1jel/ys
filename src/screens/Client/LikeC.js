import { Alert, FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Searchbar from '../../components/Searchbar'
import Appimg from '../../constants/Appimg'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import LikedItemModal from '../../components/LikedItemModal'
import Header from '../../components/Header'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { GetLikedPost, LikeUnlike } from '../../apimanager/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { fileUrl } from '../../apimanager/httpmanager'
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'
import Realm from 'realm'
import { LikeClientReducer, SaveClientLikeReducer, setConnected } from '../../redux/CommanReducer'
import { ClientLikeCollection, CollectionData } from '../../schema/ClientLikeCollection'
import showToast from '../../CustomToast'
import MediaDisplay from '../../components/MediaDisplay'
import LinkBlock from '../../components/LinkBlock'

const LikeC = () => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const user = useSelector((state) => state?.auth?.user);
    const theme = useSelector(state => state.theme?.theme)
    const connected = useSelector(state => state.CommanReducer?.connected)
    const likelist = useSelector(state => state.CommanReducer?.clientLikelist)

    const [likedItems, setLikedItems] = useState([])
    const [showPost, setShowPost] = useState(false)
    const [selecteditem, setselecteditem] = useState({})
    const [collectionitem, setcollectionitem] = useState({})
    const [stylistDetail, setStylistDetail] = useState(null)
    const limit = 100
    const [page, setPage] = useState(0)
    const [totalPage, setTotalPage] = useState(0)
    const [mode, setMode] = useState(0)
    const [initialRenderIndex, setInitialRenderIndex] = useState(0)

    useFocusEffect(useCallback(() => {
        if (!connected) {
            dispatch(LikeClientReducer())
        } else {
            get_post()
        }
    }, [connected]))
    useEffect(() => {
        if (!connected) {
            setLikedItems([...likelist])
        }
    }, [likelist, connected])

    async function get_post() {
        let body = { page: 1, limit }
        try {
            dispatch(setLoading(true))
            let res = await GetLikedPost(body)
            if (res?.data?.status) {
                // let data = []
                // res?.data?.data?.forEach(element => {
                //     if (element?.collection_data[0]?.status == 1) {
                //         data.push(element)
                //     }
                // });
                setLikedItems(res?.data?.data)
                setPage(res?.data?.other?.current_page)
                setTotalPage(res?.data?.other?.total_page)
                // Realm.deleteFile({ schema: [ClientLikeCollection], path: 'ClientLikeCollection.realm' })
                // data.forEach(async element => {
                //     if (element) {
                //         dispatch(SaveClientLikeReducer(element))
                //     }
                // });
            } else {
                setLikedItems([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreData = () => {
        if (page < totalPage) {
            get_more_post(page + 1)
        }
    }
    async function get_more_post(page) {
        let body = { page, limit }
        try {
            // dispatch(setLoading(true))
            let res = await GetLikedPost(body)
            if (res?.data?.status) {
                let temp = [...likedItems]
                temp = temp?.concat(res?.data?.data)
                setLikedItems(temp)
                setPage(res?.data?.current_page)
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function onPressLike(body) {
        // let body = {
        //     collection_id: collectionitem?._id,
        //     stylist_id: collectionitem?.stylist_id,
        //     media_id: selecteditem?._id
        // }
        try {
            // setShowPost(false)
            dispatch(setLoading(true))
            let res = await LikeUnlike(body)
            if (res?.data?.status) {
                get_post()
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function on_message() {
        // let item = selecteditem
        // console.log(item);
        return
        let room = [item?.stylist_id, user?._id].sort().join("_")
        const message = {
            _id: moment().unix(),
            text: 'Picture',
            type: "image",
            image: fileUrl + item?.media_data[0]?.media_name,
            imageData: item?.media_data[0],
            collectionitem: item,
            isConfirmed: 0,
            createdAt: moment().unix(),
            user: {
                _id: user?._id,
                firstName: user?.full_name,
                profilePic: user?.profile_pic
            }
        }
        firestore().collection('chats').doc(room).get().then(documentSnapshot => {
            if (documentSnapshot.data()) {
                let current = item?.media_data[0]
                let productList = documentSnapshot?._data?.products
                let temp = productList?.filter(x => x?.id == current?._id)
                if (temp?.length == 0) {
                    firestore().collection('chats').doc(room).collection("messages").add(message)
                    firestore().collection('chats').doc(room).set({
                        users: [user, item.stylist_data[0]],
                        unreadCount: {
                            [`${user?._id}`]: 0,
                            [`${item?.stylist_id}`]: firestore.FieldValue.increment(1),
                        },
                        userIds: [user?._id, item?.stylist_id],
                        lastMessage: message,
                        type: "single",
                        products: [...productList, { "id": current?._id, isConfirmed: 0 }]
                    }, { merge: true }).then((res) => {
                        console.log(res, "---resss")
                        // let _res = await SendNotification({ user_type: 'stylist', user_id: item?.stylist_id, payload: { title: 'New Message', body: user?.full_name+' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type:'client', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
                        navigation.navigate('ClientChat', { item: item?.stylist_data[0] })
                    })
                } else {
                    if (temp[0]?.isConfirmed == 0) {
                        navigation.navigate('ClientChat', { item: item?.stylist_data[0] })
                    } else {
                        let newArr = []
                        newArr = productList.filter(x => x?.id != current?._id)
                        newArr.push({ "id": current?._id, isConfirmed: 0 })
                        firestore().collection('chats').doc(room).collection("messages").add(message)
                        firestore().collection('chats').doc(room).set({
                            users: [user, item.stylist_data[0]],
                            unreadCount: {
                                [`${user?._id}`]: 0,
                                [`${item?.stylist_id}`]: firestore.FieldValue.increment(1),
                            },
                            userIds: [user?._id, item?.stylist_id],
                            lastMessage: message,
                            type: "single",
                            products: [...newArr]
                        }, { merge: true }).then((res) => {
                            console.log(res, "---resss")
                            navigation.navigate('ClientChat', { item: item?.stylist_data[0] })
                        })
                    }
                }
                // navigation.navigate('ClientChat', { item: item.stylist_data[0] })
            }
            else {
                // const message = {
                //     _id: moment().unix(),
                //     text: 'Picture',
                //     type: "image",
                //     image: fileUrl + item?.media_data[activeIndex]?.media_name,
                //     collectionitem: item,
                //     isConfirmed: 0,
                //     createdAt: moment().unix(),
                //     user: {
                //         _id: user?._id,
                //         firstName: user?.full_name,
                //         profilePic: user?.profile_pic
                //     }
                // }
                console.log(message, 'message')
                firestore().collection('chats').doc(room).collection("messages").add(message)
                firestore().collection('chats').doc(room).set({
                    users: [user, item.stylist_data[0]],
                    unreadCount: {
                        [`${user?._id}`]: 0,
                        [`${item?.stylist_id}`]: firestore.FieldValue.increment(1),
                    },
                    userIds: [user?._id, item?.stylist_id],
                    lastMessage: message,
                    type: "single",
                    products: [{ "id": item?.media_data[0]?._id, isConfirmed: 0 }]
                }, { merge: true }).then((res) => {
                    console.log(res)
                    navigation.navigate('ClientChat', { item: item?.stylist_data[0] })
                })
                // sendNotification({
                //     userIds: [user?._id],
                //     title: userMine?.firstName,
                //     body: messages[0].type == "image" ? "Image" : messages[0].text.toString(),
                //     chat_id: roomId,
                //     notiType: "5"
                // })
            }
        });

    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Posts You've Liked"} showBack={mode == 1 ? true : false} onBackPress={() => { setMode(0) }} />
            {mode == 0 ?
                <FlatList
                    data={likedItems}
                    numColumns={3}
                    ListEmptyComponent={() => {
                        return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, marginTop: 10, textAlign: 'center' }]}>No data found</Text>)
                    }}
                    contentContainerStyle={{ marginHorizontal: 18, paddingVertical: 20, rowGap: 8 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        let url = []
                        if (typeof item?.collection_data == 'string') {
                            url = JSON.parse(item.media_data)
                        }
                        else {
                            url = item?.media_data
                        }
                        return (
                            <Pressable
                                onPress={() => {
                                    setInitialRenderIndex(index)
                                    setMode(1)
                                    // return
                                    // setselecteditem(url[0])
                                    // setStylistDetail(item?.stylist_data?.[0])
                                    // setShowPost(true)
                                    // setcollectionitem(item?.collection_data[0])
                                }}
                            >
                                <MediaDisplay media={url[0]}
                                    styleImage={{ height: 120, width: widthPercentageToDP(29.2), marginRight: 8, resizeMode: 'cover' }}
                                    styleVideo={{ height: 120, width: widthPercentageToDP(29.2), marginRight: 8, resizeMode: 'cover' }}
                                />
                            </Pressable>
                        )
                    }}
                    onEndReached={() => { checkForMoreData() }}
                />
                :
                <ShowVertical
                    list={likedItems}
                    initialRenderIndex={initialRenderIndex}
                    onEndReached={() => { checkForMoreData() }}
                    onPressLike={(item) => {
                        onPressLike({ collection_id: item?.collection_data?.[0]?._id, stylist_id: item?.collection_data?.[0]?.stylist_id, media_id: item?.media_data?.[0]?._id })
                    }}
                />
            }

            {/* <View style={{ height: 20 }} /> */}
            {/* <LikedItemModal
                item={selecteditem}
                vis={showPost}
                like
                stylistDetail={stylistDetail}
                mainitem={collectionitem}
                onPressOut={() => setShowPost(false)}
                onPressLike={() => {
                    if (connected) {
                        onPressLike()
                    } else {
                        Alert.alert('No internet connection')
                    }
                }}
                onPressMessage={() => { }}
            /> */}
            {/* <FlatList
                    data={likedItems}
                    numColumns={3}
                    ListEmptyComponent={() => {
                        return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, marginTop: 10, textAlign: 'center' }]}>No data found</Text>)
                    }}
                    contentContainerStyle={{ marginHorizontal: 18, paddingVertical: 20, rowGap: 8 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                        let url = []
                        if (typeof item?.collection_data == 'string') {
                            url = JSON.parse(item.media_data)
                        }
                        else {
                            url = item?.media_data
                        }
                        return (
                            <Pressable
                                onPress={() => {
                                    setselecteditem(url[0])
                                    setStylistDetail(item?.stylist_data?.[0])
                                    setShowPost(true)
                                    setcollectionitem(item?.collection_data[0])
                                }}
                            >
                                <MediaDisplay media={url[0]}
                                    styleImage={{ height: 120, width: widthPercentageToDP(29.2), marginRight: 8, resizeMode: 'cover' }}
                                    styleVideo={{ height: 120, width: widthPercentageToDP(29.2), marginRight: 8, resizeMode: 'cover' }}
                                />
                            </Pressable>
                        )
                    }}
                    onEndReached={() => { checkForMoreData() }}
                /> */}
        </ImageBackground>
    )
}

export default LikeC

const styles = StyleSheet.create({})

const ShowVertical = ({ list, onPress, onEndReached, onPressLike, initialRenderIndex }) => {
    const { Appcolor } = useTheme()
    return (
        <FlatList
            data={list}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={initialRenderIndex}
            getItemLayout={(data, index) => { return { length: heightPercentageToDP(65), index, offset: heightPercentageToDP(65) * index } }}
            renderItem={({ item, index }) => {
                let url = []
                if (typeof item?.collection_data == 'string') {
                    url = JSON.parse(item.media_data)
                }
                else {
                    url = item?.media_data
                }
                return (
                    <Pressable style={{ backgroundColor: Appcolor?.modal, paddingVertical: 8, marginBottom: 16 }}
                    // onPress={() => { onPress(index) }}
                    >
                        <MediaDisplay media={url[0]}
                            resizeimage={"contain"}
                            styleImage={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0, resizeMode: 'cover' }}
                            styleVideo={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0, resizeMode: 'cover' }}
                        />
                        <View style={{ paddingHorizontal: 16 }}>
                            <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 14, marginTop: 10 }]}>{item?.stylist_data?.[0]?.full_name}</Text>
                            <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 12, marginTop: 6 }]}>{item?.collection_data?.[0]?.name}</Text>
                            <Text style={[Commonstyles(Appcolor).regular12]}>{item?.collection_data?.[0]?.description}</Text>
                            <Pressable onPress={() => onPressLike(item)} style={{ marginTop: 10 }}>
                                <Image source={Appimg.like} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                            </Pressable>
                            <LinkBlock styleMain={{ alignSelf: "flex-end" }} link={item?.media_data[0]?.link} />
                        </View>
                    </Pressable>
                )
            }}
            onEndReached={onEndReached}
        />
    )
}

const HorizontalMode = ({ list, onEndReached, onPress }) => {
    const { Appcolor } = useTheme()

    return (
        <FlatList
            data={list}
            numColumns={3}
            ListEmptyComponent={() => {
                return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, marginTop: 10, textAlign: 'center' }]}>No data found</Text>)
            }}
            contentContainerStyle={{ marginHorizontal: 18, paddingVertical: 20, rowGap: 8 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
                let url = []
                if (typeof item?.collection_data == 'string') {
                    url = JSON.parse(item.media_data)
                }
                else {
                    url = item?.media_data
                }
                return (
                    <Pressable onPress={() => { onPress(index) }}>
                        <MediaDisplay media={url[0]}
                            styleImage={{ height: 1000, width: widthPercentageToDP(100), resizeMode: 'cover' }}
                            styleVideo={{ height: 120, width: widthPercentageToDP(100), resizeMode: 'cover' }}
                        />
                    </Pressable>
                )
            }}
            // onEndReached={onEndReached}
            onEndReached={() => {
                console.log("her");
            }}
        />
    )
}