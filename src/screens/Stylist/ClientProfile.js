import { FlatList, Image, Pressable, StyleSheet, Text, View, ImageBackground, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import Header from '../../components/Header'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import Appfonts from '../../constants/Appfonts'
import MasonryList from '@react-native-seoul/masonry-list';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import en from '../../translation'
import { RFValue } from 'react-native-responsive-fontsize'
import LinearGradient from 'react-native-linear-gradient'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { fetchClientDetail, getClientStylistDetail, getLikedDataOfClient, GetStylistClientOrder, SendFollowRequest, updateClientMeasurement } from '../../apimanager/httpServices'
import ClientBlock from '../../components/ClientBlock'
import { fileUrl } from '../../apimanager/httpmanager'
import OrderDetailModal from '../../components/OrderDetailModal'
import FastImage from 'react-native-fast-image'
import Pinchable from 'react-native-pinchable';
import VideoThumb from '../../components/VideoThumb'
import Btn from '../../components/Btn'
import { Measurements } from '../Client/MeasurementC'
import showToast from '../../CustomToast'
import { convertLen, handleInputChange } from '../../utils/utilities'
import AddMeasureMentModal from '../../components/AddMeasureMentModal'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Tinput from '../../components/Tinput'

export default function ClientProfile({ navigation, route }) {
    const { item } = route.params ?? {}
    const user = useSelector((state) => state?.auth?.user);
    const load = useSelector(state => state.load?.isLoading)
    let theme = useSelector(state => state.theme?.theme)

    let dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const [order, setOrders] = useState([])
    const [likedLoader, setLikedLoader] = useState(false)
    const [likedList, setLikedList] = useState([])
    const [showType, setShowType] = useState("Confirmed Orders")
    const [orderPage, setOrderPage] = useState({ page: 0, totalPage: 0 })
    const [likedPage, setLikedPage] = useState({ page: 0, totalPage: 0 })
    const limit = 10
    const [mode, setMode] = useState(0)
    const [initialRenderIndex, setInitialRenderIndex] = useState(0)
    const [clientDetails, setClientDetails] = useState(null)
    const [addNewModal, setAddNewModal] = useState(false)

    useFocusEffect(useCallback(() => {
        if (item?._id) {
            get_order()
            getLikedData(1)
            getClientDetail()
        }
    }, [item]))

    async function get_order() {
        try {
            dispatch(setLoading(true))
            let res = await GetStylistClientOrder(item?._id, 1, limit)
            if (res?.data?.status) {
                let temp = res?.data?.other
                setOrders([...res.data.data])
                setOrderPage({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
                setOrders([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreOrders = () => {
        let { page, totalPage } = orderPage
        if (page < totalPage) {
            getMoreOrders(page + 1)
        }
    }
    const getMoreOrders = async (page) => {
        try {
            let res = await GetStylistClientOrder(item?._id, page, limit)
            if (res?.data?.status) {
                let allorders = [...order]
                setOrders(allorders.concat(res.data.data))
                let temp = res?.data?.other
                setOrderPage({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
            }
        } catch (e) {
        } finally {
        }
    }
    const getLikedData = async (page) => {
        try {
            setLikedLoader(true)
            let res = await getLikedDataOfClient(item?._id, page, limit)
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
        } finally {
            setLikedLoader(false)
        }
    }
    const getClientDetail = async () => {
        try {
            let res = await fetchClientDetail(item?._id)
            if (res?.data?.status) {
                setClientDetails(res?.data?.data)
            } else {
                showToast(res?.data?.message ?? "Something went worng.")
            }
        } catch (e) {
            console.error(e);
        }
    }

    const renderItem = ({ item, i }) => {
        return (
            <FurnitureCard item={item} index={i} style={{ marginLeft: i % 2 === 0 ? 0 : 8 }}
                onPress={() => {
                    setInitialRenderIndex(i)
                    setMode(1)
                }}
            />
        );
    };
    const resetMode = () => {
        setMode(0)
        setInitialRenderIndex(0)
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header title={mode == 0 ? en?.ClientProfile : showType} showBack={true}
                onBackPress={() => {
                    if (mode == 1) {
                        resetMode()
                        return
                    }
                    navigation.goBack()
                }}
                plusimage={showType == "Measurement"}
                onAddPress={() => {
                    setAddNewModal(true)
                }}
            />
            <View style={{ marginTop: 20 }} />
            {mode == 0 ? <>
                <ClientBlock item={item} styleMain={{ marginRight: 0 }} />
                {/* <Text style={{ fontSize: 10, textAlign: "center", fontFamily: Appfonts.regular, color: Appcolor.primary }}>{item.email}</Text> */}
                {/* <Text style={{ fontSize: 16, textAlign: "center", fontFamily: Appfonts.regular, color: Appcolor.primary }}>View Measurement</Text> */}
                <View style={{ backgroundColor: "transparent", borderWidth: 0.6, borderColor: Appcolor.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: 12, marginHorizontal: 16 }}>
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
                    <LinearGradient colors={[showType != "Measurement" ? Appcolor.white : Appcolor.primop, showType != "Measurement" ? Appcolor.white : Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.userType}>
                        <Pressable style={{ height: "100%", width: '100%', justifyContent: "center", alignItems: "center", }}
                            onPress={() => {
                                setShowType("Measurement")
                            }}
                        >
                            <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Measurement" ? Appcolor.white : Appcolor.txt }]}>Measurement</Text>
                        </Pressable>
                    </LinearGradient>
                </View>
                <Text style={[Commonstyles.bold20, { fontSize: 16, color: Appcolor.txt, width: '92%', alignSelf: 'center', marginTop: 20 }]}>{showType}</Text>
                {showType == "Confirmed Orders" ?
                    <MasonryList
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={<View />}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            alignSelf: 'stretch',
                        }}
                        style={{ alignSelf: "stretch" }}
                        onEndReached={() => {
                            checkForMoreOrders()
                        }}
                        numColumns={2}
                        data={order}
                        ListEmptyComponent={() => {
                            return (load ? null : <Text style={[Commonstyles.bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Confirmed order</Text>)
                        }}
                        renderItem={renderItem}
                    />
                    :
                    showType == "Liked" ?
                        <>
                            <FlatList
                                data={likedList}
                                numColumns={2}
                                contentContainerStyle={{ paddingBottom: 26 }}
                                renderItem={({ item, index }) => {
                                    return (
                                        <LikedProduct
                                            item={item} index={index}
                                            onPress={() => {
                                                setInitialRenderIndex(index)
                                                setMode(1)
                                            }}
                                        />
                                    )
                                }}
                                onEndReached={() => {
                                    if (likedPage?.page < likedPage?.totalPage) {
                                        getLikedData(likedPage?.page + 1)
                                    }
                                }}
                            />
                            {likedLoader && <ActivityIndicator color={Appcolor.primary} size={"large"} />}
                        </>
                        :
                        <MeasurementClient clientDetails={clientDetails} addNewModal={addNewModal} setAddNewModal={setAddNewModal} />
                }
            </>
                :
                <>
                    <VerticalMode list={showType == "Confirmed Orders" ? order : likedList} navigation={navigation} showType={showType} initialRenderIndex={initialRenderIndex}
                        onEndReached={() => {
                            if (showType == "Confirmed Orders") {
                                checkForMoreOrders()
                            } else {
                                if (likedPage?.page < likedPage?.totalPage) {
                                    getLikedData(likedPage?.page + 1)
                                }
                            }
                        }}
                    />
                </>
            }
        </ImageBackground>
    )

}

const styles = StyleSheet.create({
    userType: {
        height: 40, width: "33.33%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
    userType2: {
        height: 40, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
})

const FurnitureCard = ({ item, style, index, onPress }) => {
    // const randomBool = useMemo(() => Math.random() < 0.5, []);
    let randomBool = index
    const [showModal, setShowModal] = useState(false)
    return (
        <Pressable onPress={onPress} style={[{ marginTop: 12, flex: 1, justifyContent: "center", alignItems: "center" }, style]}>
            <OrderDetailModal vis={showModal} item={item} closeModal={() => setShowModal(false)} />
            {(item?.media_data?.[0]?.media_type == "video" && !item?.media_data?.[0]?.thumbnail) ?
                <VideoThumb source={item?.media_data?.[0]?.media_name} styleMain={{ height: randomBool == 1 ? 150 : 280, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10, overflow: "hidden" }} resizeMode={"stretch"} />
                :
                <FastImage
                    source={item?.media_data?.[0]?.media_type == "video" ? { uri: fileUrl + item?.media_data[0]?.thumbnail } : { uri: fileUrl + item?.media_data[0]?.media_name }}
                    style={{ height: randomBool == 1 ? 150 : 280, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10, overflow: "hidden" }}
                    resizeMode="cover"
                />}
            {item?.media_data?.[0]?.media_type == "video" && <Image source={Appimg.play} style={{ height: 30, width: 30, position: "absolute", zIndex: 10 }} />}
        </Pressable>
    );
};
const LikedProduct = ({ item, index, onPress }) => {
    const [showModal, setShowModal] = useState(false)
    return (
        <Pressable onPress={onPress} style={{ justifyContent: "center", alignItems: "center" }}>
            {/* <OrderDetailModal vis={showModal} item={item} closeModal={() => setShowModal(false)} /> */}
            {item?.media_data?.media_type == "video" ?
                <VideoThumb source={item?.media_data?.media_name} styleMain={{ height: 280, width: widthPercentageToDP(45), marginLeft: widthPercentageToDP(3), marginVertical: 8, borderRadius: 8 }} resizeMode={"stretch"} />
                :
                <FastImage source={item?.media_data?.media_type == "video" ? { uri: fileUrl + item?.media_data?.thumbnail } : { uri: fileUrl + item?.media_data?.media_name }} style={{ height: 280, width: widthPercentageToDP(45), marginLeft: widthPercentageToDP(3), marginVertical: 8, borderRadius: 8 }} />}
            {item?.media_data?.media_type == "video" && <Image source={Appimg.play} style={{ height: 30, width: 30, position: "absolute", zIndex: 10 }} />}
        </Pressable>
    )
}

export const VerticalMode = ({ list, initialRenderIndex, showType, navigation, onEndReached }) => {
    const { Appcolor } = useTheme()
    const renderItem = ({ item, index }) => {
        const mediaData = (showType == "Confirmed Orders") ? item?.media_data?.[0] : item?.media_data
        const collectionData = (showType == "Confirmed Orders") ? item?.collection_data?.[0] : item?.collection_data
        return (
            <View style={[{ marginTop: widthPercentageToDP(4), width: widthPercentageToDP(100), paddingVertical: 8, backgroundColor: Appcolor.modal }]}>
                <View style={{ height: heightPercentageToDP(60), width: "100%", justifyContent: "center", alignItems: "center" }}>
                    {
                        mediaData?.media_type == "video" ?
                            <VideoThumb source={mediaData?.media_name} styleMain={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), }} resizeMode={"stretch"} />
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

const MeasurementClient = ({ clientDetails, addNewModal, setAddNewModal }) => {
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()
    const [showType, setShowType] = useState("Men")
    const [maleM, setMaleM] = useState([])
    const [femaleM, setFemaleM] = useState([])
    // const [addNewModal, setAddNewModal] = useState(false)
    const [notes, setNotes] = useState("")

    const scrollRef = useRef(false)

    React.useEffect(() => {
        if (clientDetails?.male_measurment_detail) {
            setMaleM(clientDetails?.male_measurment_detail)
        }
        if (clientDetails?.female_measurment_detail) {
            setFemaleM(clientDetails?.female_measurment_detail)
        }
        if (clientDetails?.notes) {
            setNotes(clientDetails?.notes)
        }
    }, [clientDetails])

    const updateSize = useCallback((newVal, name) => {
        if (showType == "Men") {
            let temp = [...maleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            obj = { ...obj, size: handleInputChange(newVal) }
            temp.splice(ind, 1, obj)
            setMaleM(temp)
        } else {
            let temp = [...femaleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            obj = { ...obj, size: handleInputChange(newVal) }
            temp.splice(ind, 1, obj)
            setFemaleM(temp)
        }
    }, [showType, maleM, femaleM])
    const updateUnit = useCallback((newVal, name) => {
        if (showType == "Men") {
            let temp = [...maleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            let size = convertLen(obj?.size, newVal, obj?.unit)
            obj = { ...obj, unit: newVal, size }
            temp.splice(ind, 1, obj)
            setMaleM(temp)
        } else {
            let temp = [...femaleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            let size = convertLen(obj?.size, newVal, obj?.unit)
            obj = { ...obj, unit: newVal, size }
            temp.splice(ind, 1, obj)
            setFemaleM(temp)
        }
    }, [showType, maleM, femaleM])
    const onPressUpdate = async () => {
        try {
            dispatch(setLoading(true))
            let body = { male_measurment_detail: JSON.stringify(maleM), female_measurment_detail: JSON.stringify(femaleM), notes, clientId: clientDetails?._id }
            let res = await updateClientMeasurement(body)
            if (res?.data?.status) {
                showToast(res?.data?.message)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const addCustomM = (data) => {
        if (showType == "Men") {
            let temp = [...maleM]
            let ind = temp?.findIndex(x => x?.name == data?.name)
            if (ind == -1) {
                temp.push(data)
                setMaleM(temp)
            } else {
                showToast("Attribute already exists")
            }
        } else {
            let temp = [...femaleM]
            let ind = temp?.findIndex(x => x?.name == data?.name)
            if (ind == -1) {
                temp.push(data)
                setFemaleM(temp)
            } else {
                showToast("Attribute already exists")
            }
        }
    }

    return (
        <KeyboardAwareScrollView extraScrollHeight={10} keyboardOpeningTime={Number.MAX_VALUE} style={{ flex: 1 }}>
            <AddMeasureMentModal vis={addNewModal} onPressOut={() => setAddNewModal(false)} onSubmit={addCustomM} />
            <View style={{ backgroundColor: "transparent", borderWidth: 0.6, borderColor: Appcolor.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: 20, marginHorizontal: 16 }}>
                <Pressable
                    style={{ ...styles.userType2, backgroundColor: showType == "Men" ? Appcolor.yellowop : null, }}
                    onPress={() => {
                        setShowType("Men")
                    }}
                >
                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Men" ? Appcolor.white : Appcolor.txt }]}>Men</Text>
                </Pressable>
                <Pressable
                    style={{ ...styles.userType2, backgroundColor: showType == "Women" ? Appcolor.yellowop : null, }}
                    onPress={() => {
                        setShowType("Women")
                    }}
                >
                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Women" ? Appcolor.white : Appcolor.txt }]}>Women</Text>
                </Pressable>
            </View>
            {(showType == "Men" ? maleM : femaleM)?.map((item, index) => {
                return <Measurements key={item?.name} item={item} index={index} updateSize={updateSize} updateUnit={updateUnit}
                // To make the inputs not editable uncomment the line below
                // editable={false} 
                />
            })}
            <Tinput
                place={"Notes"}
                value={notes}
                onChangeText={(t) => setNotes(t)}
                multiline={true}
                styleMain={{ marginTop: 20 }}
                styleInput={{ minHeight: 120 }}
                textInputProps={{
                    scrollEnabled: scrollRef.current,
                    onFocus: () => { scrollRef.current = true }
                }}
            />
            <Btn title={"Update"} twhite styleMain={{ alignSelf: "center", marginTop: 26 }} onPress={() => { onPressUpdate() }} />
            <View style={{ height: 60 }} />
        </KeyboardAwareScrollView>
        // <KeyboardAvoidingView behavior={Platform?.OS == "ios" ? "padding" : null} keyboardVerticalOffset={40} style={{ flex: 1 }}>
        //     <FlatList
        //         data={showType == "Men" ? maleM : femaleM}
        //         renderItem={({ item, index }) => {
        //             return (
        //                 <Measurements item={item} index={index}
        //                     updateSize={updateSize} updateUnit={updateUnit}
        // To make the inputs not editable uncomment the line below
        // editable={false} 
        //                 />
        //             )
        //         }}
        //     />
        // </KeyboardAvoidingView>
    )
}
