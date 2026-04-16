import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground, Pressable, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Appimg from "../../constants/Appimg";
import Header from "../../components/Header";
import FastImage from "react-native-fast-image";
import { get_particular_stylist_detail } from "../../apimanager/httpServices";
import showToast from "../../CustomToast";
import Commonstyles from "../../constants/Commonstyles";
import { useNavigation, useTheme } from "@react-navigation/native";
import { fileUrl } from "../../apimanager/httpmanager";
import { setLoading } from "../../redux/load";
import { widthPercentageToDP } from "react-native-responsive-screen";
import LinearGradient from "react-native-linear-gradient";
import { SendFollowRequestStylist } from "../../apimanager/httpServices";

const OtherStylist = ({ route, navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const { stylist } = route?.params ?? {}
    const theme = useSelector(state => state.theme)?.theme
    const [stylistDetail, setStylistDetail] = useState(null)
    const [stylistCollection, setStylistCollection] = useState([])
    const [isFollowed, setIsFollowed] = useState(false)

    useEffect(() => {
        if (stylist) {
            getStylistDetail(stylist)
        }
    }, [stylist])

    const getStylistDetail = async (id) => {
        try {
            dispatch(setLoading(true))
            let res = await get_particular_stylist_detail(id)
            if (res?.data?.status) {
                setStylistDetail(res?.data?.data)
                let temp = []
                res?.data?.data?.collection_data?.forEach(e => {
                    if (e?.display_type == "public") {
                        temp.push(e)
                    }
                });
                setStylistCollection(temp)
                if (res?.data?.data.follow_data?.length > 0 && res?.data?.data?.follow_data[0]?.follow_status == 'accepted') {
                    setIsFollowed(true)
                } else {
                    setIsFollowed(false)
                }
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function send_request(item) {
        try {
            let _data = {
                'follow_stylist_id': item?._id
            }
            dispatch(setLoading(true))
            let res = await SendFollowRequestStylist(_data)
            if (res?.data?.status) {
                getStylistDetail(item?._id)
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Stylist"} showBack onBackPress={() => navigation?.pop()} />
            <View style={{ justifyContent: "center", alignItems: 'center', padding: 8 }}>
                <FastImage source={stylistDetail?.profile_pic ? { uri: fileUrl + stylistDetail?.profile_pic } : Appimg?.avatar} style={{ height: 100, width: 100, borderRadius: 100 }} />
                <Text style={[{ marginTop: 6 }, Commonstyles(Appcolor).mediumText14]}>{stylistDetail?.full_name} {stylistDetail?.stylist_type == "company" && "(" + stylistDetail?.company_name + ")"}</Text>
            </View>
            <LinearGradient colors={[Appcolor.primop, Appcolor.yellowop]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: isFollowed ? "44%" : "70%", height: 36, borderRadius: 3, alignSelf: "center", }}>
                <Pressable style={{ width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center', }}
                    onPress={() => {
                        send_request(stylistDetail)
                    }}
                >
                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: Appcolor.white }]}>{stylistDetail?.follow_data[0]?.follow_status == 'pending' ? "Requested" : stylistDetail?.follow_data[0]?.follow_status == 'accepted' ? 'Unfollow' : "Follow"}</Text>
                </Pressable>
            </LinearGradient>
            {
                isFollowed ?
                    <>
                        <Text style={[Commonstyles(Appcolor).mediumText16, { margin: 16 }]}>Collection</Text>
                        <FlatList
                            data={stylistCollection}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                let data = item?.media_data
                                // console.log(item);
                                return (
                                    <Pressable style={{ marginHorizontal: widthPercentageToDP(2.5), width: widthPercentageToDP(45), padding: 8, marginBottom: 8, borderRadius: 4, backgroundColor: Appcolor.white }}
                                        onPress={() => { navigation?.navigate("ProductScreen", { _item: item }) }}
                                    >
                                        <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 14, marginBottom: 4 }]}>{item?.name}</Text>
                                        <FastImage source={{ uri: fileUrl + data?.gallery_data?.media_name }} style={{ width: "100%", height: widthPercentageToDP(38), borderRadius: 4 }} />
                                    </Pressable>
                                )
                            }}
                        />
                    </>
                    :
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 12, flexDirection: 'row' }}>
                        <FastImage source={Appimg.lock} style={{ height: 20, width: 20, marginRight: 20 }} resizeMode='contain' />
                        <View>
                            <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 16 }]}>This account is private</Text>
                            <Text style={[Commonstyles(Appcolor).mediumText14]}>Follow to see their collection.</Text>
                        </View>
                    </View>
            }

        </ImageBackground>
    )
}
export default OtherStylist;