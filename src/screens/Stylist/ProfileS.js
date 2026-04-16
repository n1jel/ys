import { FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import en from '../../translation'
import FastImage from 'react-native-fast-image'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import Appfonts from '../../constants/Appfonts'
import { useDispatch, useSelector } from 'react-redux'
import { fileUrl } from '../../apimanager/httpmanager'
import ClientBlock from '../../components/ClientBlock'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { GetMyClient, SendFollowRequestStylist, getAllFollowData } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import { abbreviateNumber } from '../../utils/utilities'
import showToast from '../../CustomToast'
import { widthPercentageToDP } from 'react-native-responsive-screen'

const ProfileS = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme?.theme);
    const user = useSelector((state) => state?.auth?.user);
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [profilepic, setProfilepic] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const [client, setclient] = useState([])
    const [followingUsers, setFollowinguser] = useState([])
    const [followData, setFollowData] = useState(null)
    const [type, setType] = useState("Account")
    const limit = 16
    const limit1 = 16
    const [pageOrders, setPageOrders] = useState({ page: 0, totalPage: 0 })
    const [pagefollowingOrders, setPageFollowingOrders] = useState({ page: 0, totalPage: 0 })

    useFocusEffect(
        useCallback(() => {
            get_client()
            getFollowers()
            getFollowings()
            setType("Account")
        }, [])
    )
    useEffect(() => {
        if (user?.full_name) {
            setFullname(user?.full_name)
        }
        if (user?.email) {
            setEmail(user?.email)
        }
        if (user?.phone_number) {
            setPhone(user?.phone_number)
        }
        if (user?.profile_pic) {
            setProfilepic(user?.profile_pic)
        }
        if (user?.country_code) {
            setCountryCode(user?.country_code)
        }
    }, [user])

    async function get_client() {
        try {
            let res = await GetMyClient()
            if (res?.data?.status) {
                let data = res?.data?.data
                let temp = { following: data?.total_followings, followers: data?.total_followers, likes: data?.total_likes }
                setFollowData(temp)
            } else {
                setCollection([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const getFollowers = async () => {
        try {
            dispatch(setLoading(true))
            let res = await getAllFollowData("follower", 1, limit)
            if (res?.data?.status) {
                setclient([...res?.data?.data])
                let temp = res?.data?.other
                setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
                setclient([])
                // showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const getFollowings = async () => {
        try {
            dispatch(setLoading(true))
            let res = await getAllFollowData("following", 1, limit1)
            if (res?.data?.status) {
                setFollowinguser([...res?.data?.data])
                let temp = res?.data?.other
                setPageFollowingOrders({ page: temp?.current_page, totalPage: temp?.total_page })

            } else {
                setclient([])
                // showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreFollowingData = () => {
        let { page, totalPage } = pagefollowingOrders
        if (page < totalPage) {
            getNextFollowings(page + 1)
        }
    }
    const getNextFollowings = async (page) => {
        try {
            let res = await getAllFollowData("following", page, limit1)
            if (res?.data?.status) {
                let data = [...followingUsers]
                data = data?.concat(res?.data?.data)
                setFollowinguser(data)
                let temp = res?.data?.other
                setPageFollowingOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
        } finally {
        }
    }
    const checkForMoreData = () => {
        let { page, totalPage } = pageOrders
        if (page < totalPage) {
            getNextFollowers(page + 1)
        }
    }
    const getNextFollowers = async (page) => {
        try {
            let res = await getAllFollowData("follower", page, limit)
            if (res?.data?.status) {
                let data = [...client]
                data = data?.concat(res?.data?.data)
                setclient(data)
                let temp = res?.data?.other
                setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
        } finally {
        }
    }
    async function send_request(id) {
        try {
            let _data = {
                'follow_stylist_id': id
            }
            dispatch(setLoading(true))
            let res = await SendFollowRequestStylist(_data)
            if (res?.data?.status) {
                getFollowers()
                getFollowings()
                get_client()
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={theme == "dark" ? Appimg?.darkbg : Appimg.bg} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header showBack={true}
                onBackPress={() => {
                    type == "Clients" ? setType("Account") : navigation.goBack()
                }}
                title={en?.profile}
            />
            {/* <FastImage source={{ uri: "https://d1ibgiujerad7s.cloudfront.net/multi_media/images_multi/1692691208586.webp" }} style={{ height: 160, width: 180, backgroundColor: 'red' }} /> */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ height: 100, width: 100, alignSelf: 'center', borderWidth: 0.6, borderColor: Appcolor.primary, marginVertical: 16, borderRadius: 100 }}>
                    <FastImage source={profilepic ? { uri: fileUrl + profilepic } : Appimg.avatar} style={{ height: "100%", borderRadius: 100, width: "100%" }} />
                </View>
                <Text style={[Commonstyles(Appcolor).mediumText14, { textAlign: 'center' }]}>{fullname} {user?.stylist_type == "company" && "(" + user?.company_name + ")"}</Text>
                <View style={[Commonstyles(Appcolor).row, { justifyContent: 'space-between', paddingHorizontal: 20, marginVertical: 10 }]}>
                    <Pressable style={[styles.box]}
                        onPress={() => setType('Following')}
                    >
                        <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 16 }]}>{abbreviateNumber(followData?.following || 0)}</Text>
                        <Text style={[Commonstyles(Appcolor).mediumText12]}>Following</Text>
                    </Pressable>
                    <Pressable style={[styles.box, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Appcolor.txt }]}
                        onPress={() => setType('Clients')}
                    >
                        <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 16 }]}>{abbreviateNumber(followData?.followers || 0)}</Text>
                        <Text style={[Commonstyles(Appcolor).mediumText12]}>Followers</Text>
                    </Pressable>
                    <Pressable style={[styles.box]}
                        onPress={() => navigation.navigate("TotalLikes")}
                    >
                        <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 16 }]}>{abbreviateNumber(followData?.likes || 0)}</Text>
                        <Text style={[Commonstyles(Appcolor).mediumText12]}>Likes</Text>
                    </Pressable>
                </View>
                {type == 'Account' &&
                    <>
                        <Tinput
                            place={en?.email}
                            img={Appimg.mail}
                            styleMain={{ marginTop: 16 }}
                            value={email}
                            editable={false}
                        />
                        <Text style={{ color: Appcolor.txt, fontSize: 10, fontFamily: Appfonts.medium, marginTop: 16, marginLeft: 18 }}>{en?.phonenumber}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, marginHorizontal: 18, marginTop: 10 }} >
                            <TouchableOpacity style={{ width: '16%', height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.grad1, backgroundColor: Appcolor.white }}>
                                <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                                    {countryCode}
                                </Text>
                            </TouchableOpacity>
                            <View style={{
                                height: 48, width: "80%", borderColor: Appcolor.grad1, borderRadius: 4, borderWidth: 0.8,
                                color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium, flexDirection: "row",
                                paddingLeft: 8, justifyContent: "center", alignItems: "center", backgroundColor: Appcolor.white
                            }}>
                                <TextInput
                                    place={en?.phonenumber}
                                    placeholderTextColor={Appcolor.txt}
                                    value={phone}
                                    onChangeText={t => setPhone(t)}
                                    keyboardType={"numeric"}
                                    maxLength={10}
                                    style={{
                                        height: 48, width: "90%", color: Appcolor.txt, fontSize: 14, paddingLeft: 8, fontFamily: Appfonts.medium
                                    }}
                                    autoCapitalize={"none"}
                                    editable={false}
                                >
                                </TextInput>
                                <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                            </View>
                        </View>
                        <Btn transparent={Appcolor.blackop} title={en?.edit} twhite styleMain={{ alignSelf: "center", marginVertical: 60 }}
                            onPress={() => navigation.navigate("EditProfileS")}
                        />
                    </>
                }
                {type == 'Clients' &&
                    <FlatList
                        data={client}
                        scrollEnabled={false}
                        style={{ marginTop: 20 }}
                        onEndReached={() => checkForMoreData()}

                        ListEmptyComponent={() => {
                            return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Client found</Text>)
                        }}
                        ListHeaderComponent={() => {
                            return <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), marginBottom: 10, textAlign: "center" }]}>Followers</Text>
                        }}
                        renderItem={({ item, index }) => {
                            return (
                                <FollowerBlock
                                    item={item} index={index}
                                    onPress={() => {
                                        let data = item?.follow_by == "stylist" ? item?.stylisy_detail[0] : item?.client_detail[0]
                                        if (item?.follow_by == "stylist") {
                                            navigation.navigate("OtherStylist", { stylist: data?._id })
                                        } else {
                                            navigation.navigate("ClientProfile", { item: data })
                                        }
                                    }}
                                    onPressBtn={() => {
                                        send_request(item?.stylisy_detail[0]?._id)
                                    }}
                                />
                            )
                        }}
                    />
                }
                {type == 'Following' &&
                    <FlatList
                        data={followingUsers}
                        scrollEnabled={false}
                        style={{ marginTop: 20 }}
                        onEndReached={() => checkForMoreFollowingData()}

                        ListEmptyComponent={() => {
                            return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Data found</Text>)
                        }}
                        ListHeaderComponent={() => {
                            return <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), marginBottom: 10, textAlign: "center" }]}>Following</Text>
                        }}
                        renderItem={({ item, index }) => {
                            return (
                                <FollowingBlock item={item} index={index}
                                    onPress={() => {
                                        navigation.navigate("OtherStylist", { stylist: item?.stylisy_detail[0]?._id })
                                    }}
                                    onPressBtn={() => {
                                        send_request(item?.stylisy_detail[0]?._id)
                                    }}
                                />
                            )
                        }}
                    />
                }
            </ScrollView>
        </ImageBackground>
    )
}

export default ProfileS

const styles = StyleSheet.create({
    box: { alignItems: 'center', width: "33%" }
})

export const FollowingBlock = ({ item, index, onPress, onPressBtn }) => {
    const { Appcolor } = useTheme()
    let data = item?.brand_detail[0]
    return (
        <Pressable style={{ marginBottom: 8, borderBottomWidth: 1, borderColor: Appcolor.blackop, padding: 8, borderRadius: 4, marginHorizontal: 16, flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', width: "92%" }}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FastImage source={data?.profile_pic ? { uri: fileUrl + data?.profile_pic } : Appimg?.avatar} style={{ height: 60, width: 60, borderRadius: 100, marginRight: 8 }} />
                <Text style={[Commonstyles(Appcolor).mediumText16, { marginTop: 4 }]}>{data?.full_name}</Text>
            </View>
            <Btn styleMain={{ width: widthPercentageToDP(26), height: 30, borderRadius: 4 }}
                title={"Unfollow"}
                twhite
                onPress={onPressBtn}
            />
        </Pressable>
    )
}

export const FollowerBlock = ({ item, index, onPress, onPressBtn }) => {
    const { Appcolor } = useTheme()
    let data = item?.follow_by == "stylist" ? item?.stylisy_detail[0] : item?.client_detail[0]
    return (
        <Pressable
            style={{ marginBottom: 8, borderBottomWidth: 1, borderColor: Appcolor.blackop, padding: 8, borderRadius: 4, marginHorizontal: 16, flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FastImage source={data?.profile_pic ? { uri: fileUrl + data?.profile_pic } : Appimg?.avatar} style={{ height: 60, width: 60, borderRadius: 100, marginRight: 8 }} />
                <Text style={[Commonstyles(Appcolor).mediumText16, { marginTop: 4 }]}>{data?.full_name}</Text>
                {/* {item?.follow_by == "stylist" && <Text style={{ color: "white" }}>Stylist</Text>} */}
            </View>
            {item?.follow_by == "stylist" && item?.stylisy_detail[0]?.follow_data?.length == 0 &&
                <Btn styleMain={{ width: widthPercentageToDP(26), height: 30, borderRadius: 4 }}
                    title={item?.stylisy_detail[0]?.follow_data[0]?.follow_status == "pending" ? "Pending" : "Follow"} twhite
                    onPress={onPressBtn}
                />
            }
        </Pressable>
    )
}