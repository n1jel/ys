import { ActivityIndicator, FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { getClientDetail, getClientLikedPost, getClientOrders, getStylistDetail, getStylistLikedPost } from '../../apimanager/brandServices'
import Header from '../../components/Header'
import Appimg from '../../constants/Appimg'
import { useDispatch, useSelector } from 'react-redux'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import { useTheme } from '@react-navigation/native'
import Commonstyles from '../../constants/Commonstyles'
import showToast from '../../CustomToast'
import LinearGradient from 'react-native-linear-gradient'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Pinchable from 'react-native-pinchable';
import VideoThumb from '../../components/VideoThumb'
import { setLoading } from '../../redux/load'
import Appfonts from '../../constants/Appfonts'
import Btn from '../../components/Btn'

const ProfileClientStylist = ({ route, navigation }) => {
    const { userType } = route?.params
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()

    const theme = useSelector(state => state.theme)?.theme

    const [uId, setUId] = useState(route?.params?.uId)
    const [userDetails, setUserDetails] = useState(null)
    const [order, setOrders] = useState([])
    const [orderLoader, setOrderLoader] = useState(false)
    const [likedLoader, setLikedLoader] = useState(false)
    const [likedList, setLikedList] = useState([])
    const [showType, setShowType] = useState("Confirmed Orders")
    const [orderPage, setOrderPage] = useState({ page: 0, totalPage: 0 })
    const [likedPage, setLikedPage] = useState({ page: 0, totalPage: 0 })
    const limit = 10
    const [mode, setMode] = useState(0)
    const [initialRenderIndex, setInitialRenderIndex] = useState(0)

    useEffect(() => {
        getUserDetail()
    }, [uId])

    const getUserDetail = async () => {
        try {
            dispatch(setLoading(true))
            let res
            if (userType == "stylist") {
                setShowType("Liked")
                res = await getStylistDetail(uId)
            } else {
                res = await getClientDetail(uId)
            }
            if (res?.data?.status) {
                setUserDetails(res?.data?.data)
                getLikedPost(1)
                if (userType != "stylist") {
                    get_order()
                }
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function get_order() {
        try {
            setOrderLoader(true)
            let res = await getClientOrders(uId, 1, limit)
            if (res?.data?.status) {
                let temp = res?.data?.other
                setOrders([...res.data.data])
                setOrderPage({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
                setOrders([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            setOrderLoader(false)
        }
    }
    async function getMoreOrders(pg) {
        try {
            let res = await getClientOrders(uId, pg, limit)
            if (res?.data?.status) {
                let allorders = [...order]
                setOrders(allorders.concat(res.data.data))
                let temp = res?.data?.other
                setOrderPage({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const getLikedPost = async (page) => {
        try {
            page == 1 && setLikedLoader(true)
            let res
            if (userType != "stylist") {
                res = await getClientLikedPost(uId, page, limit)
            } else {
                res = await getStylistLikedPost(uId, page, limit)
            }
            if (res?.data?.status) {
                if (page == 1) {
                    setLikedList([...res.data.data])
                } else {
                    setLikedList(likedList.concat(res.data.data))
                }
                let temp = res?.data?.other
                setLikedPage({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLikedLoader(false)
        }
    }
    async function getMoreLikedData(pg) {
        try {
            let res = await getClientOrders(uId, pg, limit)
            if (res?.data?.status) {
                let allorders = [...order]
                setOrders(allorders.concat(res.data.data))
                let temp = res?.data?.other
                setOrderPage({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const checkForMore = useCallback(() => {
        if (showType == "Confirmed Orders") {
            let { page, totalPage } = orderPage
            if (page < totalPage) {
                getMoreOrders(page + 1)
            }
        } else {
            if (likedPage?.page < likedPage?.totalPage) {
                getMoreLikedData(likedPage?.page + 1)
            }
        }
    }, [showType, orderPage, likedPage])

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg?.darkbg} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Your Season"}
                showBack={true}
                onBackPress={() => {
                    if (mode == 1) {
                        setMode(0)
                    } else {
                        navigation?.goBack()
                    }
                }}
            />
            {mode == 0 ? <>
                <View style={{ justifyContent: "center", alignItems: 'center', padding: 8 }}>
                    <FastImage source={userDetails?.profile_pic ? { uri: fileUrl + userDetails?.profile_pic } : Appimg?.avatar} style={{ height: 100, width: 100, borderRadius: 100 }} />
                    <Text style={[{ marginTop: 6 }, Commonstyles(Appcolor).mediumText14]}>{userDetails?.full_name}</Text>
                    {/* <Text style={[Commonstyles(Appcolor).mediumText14, { marginTop: 6, color: Appcolor.primary },]}>{userDetails?.email}</Text> */}
                    <Btn
                        title={"Messsage"}
                        twhite
                        styleMain={{ height: 40, width: "50%", borderRadius: 6, marginTop: 6 }}
                        onPress={() => {
                            navigation?.navigate("BrandChat", { item: userDetails })
                        }}
                    />
                </View>
                {userType != "stylist" && <View style={{ backgroundColor: "transparent", borderWidth: 0.6, borderColor: Appcolor.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginVertical: 12, marginHorizontal: 16 }}>
                    <LinearGradient colors={[showType != "Confirmed Orders" ? Appcolor.white : Appcolor.primop, showType != "Confirmed Orders" ? Appcolor.white : Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.userType}>
                        <Pressable style={{ height: "100%", width: '100%', justifyContent: "center", alignItems: "center", }}
                            onPress={() => {
                                setShowType("Confirmed Orders")
                            }}
                        >
                            <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Confirmed Orders" ? Appcolor.white : Appcolor.txt }]}>Confirmed Orders</Text>
                        </Pressable>
                    </LinearGradient>
                    <LinearGradient colors={[showType != "Liked" ? Appcolor.white : Appcolor.primop, showType != "Liked" ? Appcolor.white : Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.userType}>
                        <Pressable style={{ height: "100%", width: '100%', justifyContent: "center", alignItems: "center", }}
                            onPress={() => {
                                setShowType("Liked")
                            }}
                        >
                            <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Liked" ? Appcolor.white : Appcolor.txt }]}>Liked</Text>
                        </Pressable>
                    </LinearGradient>
                </View>}
                {(orderLoader || likedLoader) ?
                    <View style={{ marginTop: 26 }}>
                        <ActivityIndicator size={"large"} color={Appcolor.primary} />
                    </View>
                    :
                    <HorizontalMode
                        list={showType == "Confirmed Orders" ? order : likedList}
                        navigation={navigation}
                        showType={showType}
                        onEndReached={() => { checkForMore() }}
                        onPress={(item, index) => {
                            setInitialRenderIndex(index)
                            setMode(1)
                        }}
                    />
                }
            </>
                :
                <VerticalMode
                    list={showType == "Confirmed Orders" ? order : likedList}
                    navigation={navigation}
                    showType={showType}
                    initialRenderIndex={initialRenderIndex}
                    onEndReached={() => { checkForMore() }}
                />
            }
        </ImageBackground>
    )
}

export default ProfileClientStylist

const styles = StyleSheet.create({
    userType: {
        height: 40, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
})

const HorizontalMode = ({ list, initialRenderIndex, showType, navigation, onEndReached, onPress }) => {
    const { Appcolor } = useTheme()
    const renderItem = ({ item, index }) => {
        const mediaData = (showType == "Confirmed Orders") ? item?.media_data?.[0] : item?.media_data
        // const collectionData = (showType == "Confirmed Orders") ? item?.collection_data?.[0] : item?.collection_data
        return (
            <Pressable onPress={() => onPress(item, index)} style={[{ marginTop: 20, width: widthPercentageToDP(44), marginLeft: widthPercentageToDP(4), justifyContent: "center", alignItems: "center" }]}>
                {mediaData?.media_type == "video" ?
                    <VideoThumb source={mediaData?.media_name} styleMain={{ height: 280, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10, overflow: "hidden" }} resizeMode={"stretch"} />
                    :
                    <Pinchable>
                        <FastImage source={{ uri: fileUrl + mediaData?.media_name }} style={{ height: 280, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10, overflow: "hidden" }} resizeMode='cover' />
                    </Pinchable>
                }
                {mediaData?.media_type == "video" && <Image source={Appimg.play} style={{ height: 30, width: 30, position: "absolute", zIndex: 10 }} />}
            </Pressable>
        );
    };
    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={list}
            renderItem={renderItem}
            numColumns={2}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
            // ListEmptyComponent={() => (<Text style={[Commonstyles(Appcolor).bold20, { textAlign: "center", margin: 16 }]}>No data found.</Text>)}
            getItemLayout={(data, index) => { return { length: heightPercentageToDP(66), index, offset: heightPercentageToDP(70) * index } }}
            onEndReached={onEndReached}
        />
    )
}
const VerticalMode = ({ list, initialRenderIndex, showType, navigation, onEndReached }) => {
    const { Appcolor } = useTheme()
    const renderItem = ({ item, index }) => {
        const mediaData = (showType == "Confirmed Orders") ? item?.media_data?.[0] : item?.media_data
        const collectionData = (showType == "Confirmed Orders") ? item?.collection_data?.[0] : item?.collection_data
        return (
            <View style={[{ marginTop: widthPercentageToDP(4), width: widthPercentageToDP(100), paddingVertical: 8, backgroundColor: Appcolor.modal }]}>
                <View style={{ height: heightPercentageToDP(60), width: "100%", justifyContent: "center", alignItems: "center" }}>
                    {
                        mediaData?.media_type == "video" ?
                            <VideoThumb source={mediaData?.media_name} styleMain={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), }} resizeMode={"contain"} />
                            :
                            <Pinchable>
                                <FastImage source={mediaData?.media_type == "video" ? { uri: fileUrl + mediaData?.thumbnail } : { uri: fileUrl + mediaData?.media_name }} style={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), }} resizeMode='contain' />
                            </Pinchable>
                    }
                    {mediaData?.media_type == "video" &&
                        <Pressable onPress={() => {
                            navigation?.navigate("VideoPlayer", { media: mediaData?.media_name })
                        }}
                            style={{ position: "absolute", zIndex: 10 }}
                        >
                            <Image source={Appimg.play} style={{ tintColor: Appcolor.txt, height: 100, width: 100, }} />
                        </Pressable>
                    }
                </View>
                <View style={{ margin: 16 }}>
                    <Text style={{ fontFamily: Appfonts.semiBold, fontSize: 14, color: Appcolor.txt, marginTop: 8 }}>{collectionData?.name}</Text>
                    <Text style={{ fontFamily: Appfonts.regular, fontSize: 14, color: Appcolor.txt, marginTop: 4 }} numberOfLines={2}>{collectionData?.description}</Text>
                </View>
            </View>
        )
    }
    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={list}
            renderItem={renderItem}
            initialScrollIndex={initialRenderIndex}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
            getItemLayout={(data, index) => { return { length: heightPercentageToDP(66), index, offset: heightPercentageToDP(70) * index } }}
            onEndReached={onEndReached}
        />
    )
}