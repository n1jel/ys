import { FlatList, Image, Pressable, StyleSheet, Text, View, ImageBackground, Alert, Keyboard, ActivityIndicator, Modal } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import StylistBlock from '../../components/StylistBlock'
import Appimg from '../../constants/Appimg'
import AlbumBlock from '../../components/AlbumBlock'
import Appcolor from '../../constants/Appcolor'
import Commonstyles from '../../constants/Commonstyles'
import Header from '../../components/Header'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import Appfonts from '../../constants/Appfonts'
import MasonryList from '@react-native-seoul/masonry-list';
import { widthPercentageToDP } from 'react-native-responsive-screen'
import en from '../../translation'
import { RFValue } from 'react-native-responsive-fontsize'
import Searchbar from '../../components/Searchbar'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { getClientStylistCollection, getClientStylistDetail, getConfirmedOrders, SendFollowRequest } from '../../apimanager/httpServices'
import { fileUrl } from '../../apimanager/httpmanager'
import Btn from '../../components/Btn'
import FastImage from 'react-native-fast-image'
import MediaDisplay from '../../components/MediaDisplay'
import { OrdersModal } from '../../components/LikedItemModal'
import { VerticalMode } from '../Stylist/ClientProfile'

const StylishProfile = ({ navigation, route }) => {
    // const { id } = route.params ?? {}
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const theme = useSelector(state => state.theme?.theme)

    const [id, setId] = useState(null)
    const [albums, setAlbums] = useState([])
    const [detail, setDetail] = useState({})
    const [orders, setOrders] = useState([])
    const [showType, setShowType] = useState("Albums")
    const [isFollowed, setIsFollowed] = useState(false)
    const limit = 20
    const [paginationAlbums, setPaginationAlbums] = useState({ page: 0, totalPage: 0 })
    const [paginationOrders, setPaginationOrders] = useState({ page: 0, totalPage: 0 })
    const [albumsLoading, setAlbumsLoading] = useState(false)
    const [mode, setMode] = useState(0)
    const [initialRenderIndex, setInitialRenderIndex] = useState(0)

    useEffect(() => {
        if (route?.params?.id) {
            setId(route?.params?.id)
        }
    }, [route?.params?.id])
    useFocusEffect(useCallback(() => {
        if (id) {
            get_detail()
        }
    }, [id]))

    async function get_detail() {
        try {
            dispatch(setLoading(true))
            let res = await getClientStylistDetail(id)
            if (res?.data?.status) {
                setDetail(res.data.data)
                get_collection(res.data.data)
            } else {
                setDetail({})
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function get_collection(item) {
        let type = 'unfollow'
        if (item?.follow_data?.length > 0 && item?.follow_data[0]?.follow_status == 'accepted') {
            type = 'follow'
            setIsFollowed(true)
        }
        try {
            setAlbumsLoading(true)
            let res = await getClientStylistCollection(item?._id, type, 1, limit)
            if (res?.data?.status) {
                setAlbums(res?.data?.data)
                let pagedata = res?.data?.other
                setPaginationAlbums({ page: pagedata?.current_page, totalPage: pagedata?.total_page })
                getOrders(item?._id)
            } else {
                setAlbums([])
            }
        } catch (e) {
        } finally {
            setAlbumsLoading(false)
        }
    }
    const checkForMoreAlbums = () => {
        let { page, totalPage } = paginationAlbums
        if (page < totalPage) {
            get_more_collection(detail, (page + 1))
        }
    }
    async function get_more_collection(item, page) {
        let type = 'unfollow'
        if (item?.follow_data?.length > 0 && item?.follow_data[0]?.follow_status == 'accepted') {
            type = 'follow'
            setIsFollowed(true)
        }
        try {
            setAlbumsLoading(true)
            let res = await getClientStylistCollection(item?._id, type, page, limit)
            if (res?.data?.status) {
                let temp = [...albums]
                temp = temp.concat(res?.data?.data)
                setAlbums(temp)
                let pagedata = res?.data?.other
                setPaginationAlbums({ page: pagedata?.current_page, totalPage: pagedata?.total_page })
            }
        } catch (e) {
        } finally {
            setAlbumsLoading(false)
        }
    }
    const getOrders = async (item) => {
        try {
            let res = await getConfirmedOrders({ stylist_id: item, page: 1, limit })
            if (res?.data?.status) {
                setOrders([...res?.data?.data])
                let pagedata = res?.data?.other
                setPaginationOrders({ page: pagedata?.current_page, totalPage: pagedata?.total_page })
            } else {
                setOrders([])
            }
        } catch (e) {
        } finally {
        }
    }
    const checkForMoreOrders = () => {
        let { page, totalPage } = paginationOrders
        if (page < totalPage) {
            getMoreOrders(detail, (page + 1))
        }
    }
    const getMoreOrders = async (item, page) => {
        try {
            let res = await getConfirmedOrders({ stylist_id: item?._id, page, limit })
            if (res?.data?.status) {
                let temp = [...orders]
                temp = temp?.concat(res?.data?.data)
                setOrders(temp)
                let pagedata = res?.data?.other
                setPaginationOrders({ page: pagedata?.current_page, totalPage: pagedata?.total_page })
            } else {
                setOrders([])
            }
        } catch (e) {
        } finally {
        }
    }
    async function send_request() {
        try {
            let _data = {
                'stylist_id': detail?._id
            }
            dispatch(setLoading(true))
            let res = await SendFollowRequest(_data)
            if (res?.data?.status) {
                get_detail()
                // get_collection(detail?._id)
            } else {
                get_detail()
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetMode = () => {
        setMode(0)
        setInitialRenderIndex(0)
    }
    const renderItem = ({ item, index }) => {
        return (
            <FurnitureCard item={item} index={index} style={{ marginLeft: index % 2 === 0 ? 0 : 8 }}
                onPress={() => {
                    setInitialRenderIndex(index)
                    setMode(1)
                }}
            />
        );
    };
    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header title={mode == 1 ? "Confirmed Orders" : "Stylist Profile"} onBackPress={() => {
                if (mode == 1) {
                    resetMode()
                    return
                }
                navigation.goBack()
            }}
                showBack={true}
            />

            {(detail && detail?._id && mode == 0) &&
                <>
                    <View style={{ marginTop: 20 }} />
                    <StylistBlock item={detail} styleMain={{ marginRight: 0 }} />
                    {/* <Text style={{ fontSize: 10, textAlign: "center", fontFamily: Appfonts.regular, color: Appcolor.primary }}>{detail?.email}</Text> */}
                    <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'center', marginTop: 10 }}>
                        <LinearGradient colors={[Appcolor.primop, Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: isFollowed ? "44%" : "70%", height: 36, borderRadius: 3, alignSelf: "center", borderWidth: detail?.follow_data[0]?.follow_status == 'pending' || detail?.follow_data[0]?.follow_status == 'accepted' ? null : 1, borderColor: Appcolor.primary }}>
                            <Pressable style={{ width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center', backgroundColor: detail?.follow_data[0]?.follow_status == 'pending' || detail?.follow_data[0]?.follow_status == 'accepted' ? 'transparent' : Appcolor.white }}
                                onPress={() => {
                                    send_request()
                                }}
                            >
                                <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: detail?.follow_data[0]?.follow_status == 'pending' || detail?.follow_data[0]?.follow_status == 'accepted' ? Appcolor.white : Appcolor.primary }]}>{detail?.follow_data[0]?.follow_status == 'pending' ? "Requested" : detail?.follow_data[0]?.follow_status == 'accepted' ? 'Unfollow' : "Follow"}</Text>
                            </Pressable>
                        </LinearGradient>
                        {isFollowed && <Btn transparent={Appcolor.primop} transparent2={Appcolor.yellowop} twhite title={en?.message}
                            styleMain={{ height: 36, width: "44%", alignSelf: 'center', borderRadius: 3, marginLeft: 10 }}
                            onPress={() => {
                                navigation.navigate('ClientChat', { item: detail })
                            }}
                        />
                        }
                    </View>
                </>
            }
            {mode == 0 ?
                isFollowed ?
                    <>
                        <View style={{ backgroundColor: "transparent", borderWidth: 0.6, borderColor: Appcolor.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: 12, marginHorizontal: 16 }}>
                            <LinearGradient colors={[showType != "Albums" ? Appcolor.white : Appcolor.primop, showType != "Albums" ? Appcolor.white : Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.userType}>
                                <Pressable style={{ height: "100%", width: '100%', justifyContent: "center", alignItems: "center", }}
                                    onPress={() => {
                                        setShowType("Albums")
                                    }}
                                >
                                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Albums" ? Appcolor.white : Appcolor.txt }]}>Albums</Text>
                                </Pressable>
                            </LinearGradient>
                            <LinearGradient colors={[showType != "Confirmed Orders" ? Appcolor.white : Appcolor.primop, showType != "Confirmed Orders" ? Appcolor.white : Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.userType}>
                                <Pressable style={{ height: "100%", width: '100%', justifyContent: "center", alignItems: "center", }}
                                    onPress={() => {
                                        setShowType("Confirmed Orders")
                                    }}
                                >
                                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Confirmed Orders" ? Appcolor.white : Appcolor.txt }]}>Confirmed Orders</Text>
                                </Pressable>
                            </LinearGradient>
                        </View>
                        {showType == "Albums" ?
                            <FlatList
                                data={albums}
                                keyExtractor={(item) => item._id}
                                numColumns={2}
                                ListEmptyComponent={() => {
                                    return (
                                        albumsLoading ?
                                            <View style={{ marginTop: 8 }}>
                                                <ActivityIndicator size={"large"} color={Appcolor.primary} />
                                            </View>
                                            :
                                            <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Collection found</Text>
                                    )
                                }}
                                contentContainerStyle={{ justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 }}
                                renderItem={({ item, index }) => {
                                    return (
                                        <AlbumBlock
                                            item={item} index={index}
                                            onPress={() => {
                                                // console.log(detail);
                                                navigation.navigate('CollectionsC', { _item: { ...item, stylist_data: [detail] } })
                                            }}
                                        />
                                    )
                                }}
                                onEndReached={() => checkForMoreAlbums()}
                            />
                            :
                            <FlatList
                                data={orders}
                                numColumns={2}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={{ paddingHorizontal: 16, alignSelf: 'stretch', }}
                                onEndReached={() => checkForMoreOrders()}
                            />
                        }
                        {showType == "Albums" && albumsLoading && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
                    </>
                    :
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 12, flexDirection: 'row' }}>
                        <FastImage source={Appimg.lock} style={{ height: 20, width: 20, marginRight: 20 }} resizeMode='contain' />
                        <View>
                            <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 16 }]}>This account is private</Text>
                            <Text style={[Commonstyles(Appcolor).mediumText14]}>Follow to see their collection.</Text>
                        </View>
                    </View>
                :
                <VerticalMode list={orders} showType={"Confirmed Orders"} navigation={navigation} initialRenderIndex={initialRenderIndex} />
            }
        </ImageBackground>
    )
}

export default StylishProfile

const FurnitureCard = ({ item, style, index, onPress }) => {
    let randomBool = index
    const [vis, setVis] = useState(false)
    return (
        <Pressable style={[{ marginTop: 12, flex: 1 }, style]}
            onPress={onPress}
        >
            {/* <OrdersModal vis={vis} item={item} onPressOut={() => setVis(false)} /> */}
            <MediaDisplay
                resizeimage={"contain"}
                media={item?.media_data[0]}
                styleImage={{ height: 280, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10 }}
                styleVideo={{ height: 280, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10 }}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    userType: {
        height: 40, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    }
})
