import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ImageBackground, Modal, Pressable, Text, View } from "react-native";
import Header from "../../components/Header";
import { useDispatch, useSelector } from "react-redux";
import Appimg from "../../constants/Appimg";
import { get_confirm_order_list, orderCancel } from "../../apimanager/httpServices";
import { setLoading } from "../../redux/load";
import showToast from "../../CustomToast";
import FastImage from "react-native-fast-image";
import { fileUrl } from "../../apimanager/httpmanager";
import moment from "moment";
import Commonstyles from "../../constants/Commonstyles";
import Btn from "../../components/Btn";
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen";
import Searchbar from "../../components/Searchbar";
import Tinput from "../../components/Tinput";

const ConfirmedOrders = ({ navigation }) => {
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()
    const theme = useSelector(state => state.theme)?.theme;
    const [allOrders, setAllOrders] = useState([])
    const [filterOrders, setFilterOrders] = useState([])
    const [cancelModal, setCancelModal] = useState(false)
    const [mediaDetail, setMediaDetail] = useState(null)
    const [search, setSearch] = useState("")
    const limit = 16
    const [pageOrders, setPageOrders] = useState({ page: 0, totalPage: 0 })

    useEffect(() => {
        getAllOrders()
    }, [])

    useEffect(() => {
        if (search?.trim() != "") {
            let temp = allOrders?.filter(x => x?.client_data?.full_name?.toLowerCase()?.includes(search?.toLowerCase()) || x?.collection_data?.name?.toLowerCase()?.includes(search?.toLowerCase()))
            setFilterOrders(temp ?? [])
        }
        if (search?.trim() == "") {
            setFilterOrders([])
        }
    }, [search])

    const getAllOrders = async () => {
        try {
            dispatch(setLoading(true))
            let res = await get_confirm_order_list({ page: 1, limit })
            if (res?.data?.status) {
                setAllOrders(res?.data?.data)
                let temp = res?.data?.other
                setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
                setAllOrders([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    const checkForMoreData = () => {
        let { page, totalPage } = pageOrders
        if (page < totalPage) {
            getMoreOrders(page + 1)
        }
    }

    const getMoreOrders = async (page) => {
        try {
            let res = await get_confirm_order_list({ page: page, limit })
            if (res?.data?.status) {
                let data = [...allOrders]
                data = data?.concat(res?.data?.data)
                setAllOrders(data)
                let temp = res?.data?.other
                setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
        } finally {
        }
    }

    const cancelingOrder = async (id, reason) => {
        let body = {
            order_id: id, current_date_time: moment().date()
        }
        if (reason?.trim() != "") {
            body = { ...body, cancel_reason: reason }
        }
        try {
            dispatch(setLoading(true))
            let res = await orderCancel(body)
            if (res?.data?.status) {
                showToast(res?.data?.message ?? "Canceled")
                setTimeout(() => {
                    getAllOrders()
                }, 400);
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
        }
    }
    return (
        <ImageBackground source={theme == "dark" ? Appimg?.darkbg : Appimg.bg} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header showBack={true}
                onBackPress={() => {
                    navigation.goBack()
                }}
                title={"Confirmed Orders"}
            />
            <Searchbar styleMain={{ marginTop: 10 }}
                place={"Search"}
                value={search} onChangeText={(t) => { setSearch(t) }}
                showCancel={search?.length > 0 ? true : false}
                onPressBtn={() => setSearch("")}
            />
            <CancelOrder vis={cancelModal} mediaDetail={mediaDetail}
                onPressNo={() => {
                    setCancelModal(false)
                    setMediaDetail(null)
                }}
                onPressYes={(id, reason) => {
                    setCancelModal(false)
                    setMediaDetail(null)
                    cancelingOrder(id, reason)
                }}
            />
            <FlatList
                data={search?.trim() == "" ? allOrders : filterOrders}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    return (
                        <OrderBlock
                            item={item}
                            index={index}
                            onPressCancel={() => {
                                setCancelModal(true)
                                setMediaDetail({ _id: item?._id, media_data: item?.media_data })
                            }}
                        />
                    )
                }}
                onEndReached={() => checkForMoreData()}
            />
        </ImageBackground>
    )
}
export default ConfirmedOrders;

const OrderBlock = ({ item, index, onPressCancel }) => {
    const { Appcolor } = useTheme()
    return (
        <View style={{ backgroundColor: Appcolor.lessDark, marginTop: 10, width: widthPercentageToDP(48), padding: 6, marginLeft: widthPercentageToDP(1.5), borderRadius: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <FastImage source={item?.client_data?.profile_pic ? { uri: fileUrl + item?.client_data?.profile_pic } : Appimg?.avatar} style={{ height: 40, width: 40, borderRadius: 80 }} />
                <View style={{ marginLeft: 6, width: "74%" }}>
                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 16 }]}>{item?.client_data?.full_name}</Text>
                </View>
            </View>
            <View style={{ height: widthPercentageToDP(34), width: "100%", alignSelf: "center", marginTop: 8, borderRadius: 4, justifyContent: "center", alignItems: "center" }}>
                <FastImage source={item?.media_data?.media_type == "video" ? { uri: fileUrl + item?.media_data?.thumbnail } : { uri: fileUrl + item?.media_data?.media_name }} style={{ height: "100%", width: "100%" }} />
                {item?.media_data?.media_type == "video" && <Image source={Appimg.play} style={{ height: 38, width: 38, resizeMode: "contain", position: "absolute" }} />}
            </View>
            <Text style={[Commonstyles(Appcolor).semiBold26, { marginTop: 4, fontSize: 14 }]}>{item?.collection_data?.name}</Text>
            <Text style={[Commonstyles(Appcolor).mediumText12, { marginBottom: 4 }]}>Order date: <Text style={[Commonstyles(Appcolor).regular12]}>{moment(item?.updated_at).format("Do MMM")}</Text></Text>
            <Text style={[Commonstyles(Appcolor).mediumText12, { marginBottom: 4 }]}>Order time: <Text style={[Commonstyles(Appcolor).regular12]}>{moment(item?.updated_at).format("hh:mm a")}</Text></Text>
            <Btn
                transparent={Appcolor.primop}
                transparent2={Appcolor.yellowop}
                title={"Cancel Order"} twhite
                styleMain={{ alignSelf: 'center', marginVertical: 8, width: "70%", height: 36, borderRadius: 4 }}
                txtStyle={{ fontSize: 12 }}
                onPress={() => {
                    onPressCancel()
                }}
            />
        </View>
    )
}

const CancelOrder = ({ vis, mediaDetail, onPressYes, onPressNo }) => {
    const { Appcolor } = useTheme()
    const [reason, setReason] = useState("")
    useEffect(() => {
        return () => {
            setReason("")
        }
    }, [])
    return (
        <Modal
            visible={vis}
            transparent={true}
        >
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center", }}
                onPress={() => { onPressNo(); setReason("") }}
            >
                <Pressable style={[{ backgroundColor: Appcolor.modal, minHeight: 170, width: "96%", padding: 10 }]}>
                    <FastImage source={Appimg.cancelorder} style={{ height: 180, width: '90%', alignSelf: "center" }} resizeMode="contain" />
                    <Text style={[Commonstyles(Appcolor).semiBold26, { textAlign: "center", marginTop: 8 }]}>Cancel order</Text>
                    <Text style={[Commonstyles(Appcolor).mediumText14, { textAlign: "center" }]}>Are you sure you want to cancel this order?</Text>
                    <Tinput placespecific={"Type your reason..."} value={reason} onChangeText={t => { setReason(t) }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 16 }}>
                        <Btn styleMain={{ width: "40%" }} transparent={Appcolor.primop} transparent2={Appcolor.yellowop}
                            title={"Yes"} twhite
                            onPress={() => {
                                if (reason?.trim() == "") {
                                    onPressNo();
                                    showToast("Add a reason.")
                                    return
                                }
                                onPressYes(mediaDetail?._id, reason); setReason("")
                            }}
                        />
                        <Btn transparent={Appcolor.txt} styleMain={{ width: "40%" }}
                            title={"Cancel"} twhite
                            onPress={() => { onPressNo(); setReason("") }}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}