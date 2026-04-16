import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Appimg from '../../constants/Appimg'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@react-navigation/native'
import en from '../../translation'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import Commonstyles from '../../constants/Commonstyles'
import Appfonts from '../../constants/Appfonts'
import { signout } from '../../redux/auth'
import { abbreviateNumber } from '../../utils/utilities'
import { RFValue } from 'react-native-responsive-fontsize'
import { FollowerBlock, FollowingBlock } from '../Stylist/ProfileS'
import { followersList, getProfileDetail } from '../../apimanager/brandServices'
import showToast from '../../CustomToast'

const ProfileB = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme?.theme);
    const user = useSelector((state) => state?.auth?.user);

    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [profilepic, setProfilepic] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const [followData, setFollowData] = useState(null)
    const [type, setType] = useState("Account")
    const [client, setclient] = useState([])
    const [followingUsers, setFollowinguser] = useState([])
    const limit = 16
    const limit1 = 16
    const [pageOrders, setPageOrders] = useState({ page: 0, totalPage: 0 })
    const [pagefollowingOrders, setPageFollowingOrders] = useState({ page: 0, totalPage: 0 })

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
    useEffect(() => {
        getFollowList()
        getFollowData()
    }, [])

    const getFollowList = async () => {
        try {
            let res = await followersList()
            if (res?.data?.status) {
                setclient(res?.data?.data?.total_followers)
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
            console.error(e);
        }
    }
    const getFollowData = async () => {
        try {
            let res = await getProfileDetail()
            if (res?.data?.status) {
                let data = res?.data?.data
                let temp = { followers: data?.total_followers, likes: data?.total_likes }
                setFollowData(temp)
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
            console.error(e);
        }
    }
    const checkForMoreData = () => {
        let { page, totalPage } = pageOrders
        if (page < totalPage) {
            getNextFollowers(page + 1)
        }
    }
    const getNextFollowers = async (page) => {
        // try {
        //     let res = await getAllFollowData("follower", page, limit)
        //     if (res?.data?.status) {
        //         let data = [...client]
        //         data = data?.concat(res?.data?.data)
        //         setclient(data)
        //         let temp = res?.data?.other
        //         setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
        //     }
        // } catch (e) {
        //     console.error(e);
        // } finally {
        // }
    }

    return (
        <ImageBackground source={theme == "dark" ? Appimg?.darkbg : Appimg.bg} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header
                showBack={true}
                onBackPress={() => {
                    type != "Account" ? setType("Account") : navigation.goBack()
                }}
                title={en?.profile}
            />
            <View style={{ height: 100, width: 100, alignSelf: 'center', borderWidth: 0.6, borderColor: Appcolor.primary, marginVertical: 16, borderRadius: 100 }}>
                <FastImage source={profilepic ? { uri: fileUrl + profilepic } : Appimg.avatar} style={{ height: "100%", borderRadius: 100, width: "100%" }} />
            </View>
            <Text style={[Commonstyles(Appcolor).mediumText14, { textAlign: 'center' }]}>{fullname}</Text>
            <View style={[Commonstyles(Appcolor).row, { justifyContent: 'space-between', paddingHorizontal: 20, marginVertical: 10 }]}>
                {/* <Pressable style={[styles.box]}
                    onPress={() => setType('Following')}
                >
                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 16 }]}>{abbreviateNumber(followData?.following || 0)}</Text>
                    <Text style={[Commonstyles(Appcolor).mediumText12]}>Following</Text>
                </Pressable> */}
                <Pressable style={[styles.box, { borderRightWidth: 1, borderColor: Appcolor.txt }]}
                    onPress={() => setType('Followers')}
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
            {
                type == 'Account' ?
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
                            <Pressable style={{ width: '16%', height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.grad1, backgroundColor: Appcolor.white }}>
                                <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                                    {countryCode}
                                </Text>
                            </Pressable>
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
                                />
                                <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                            </View>
                        </View>
                        <Btn transparent={Appcolor.blackop} title={en?.edit} twhite styleMain={{ alignSelf: "center", marginTop: 60 }}
                            onPress={() => navigation.navigate("EditProfileB")}
                        />
                    </>
                    :
                    <FlatList
                        data={client}
                        scrollEnabled={false}
                        style={{ marginTop: 20 }}
                        onEndReached={() => checkForMoreData()}

                        ListEmptyComponent={() => {
                            return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Followers found</Text>)
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
                                        navigation?.navigate("ProfileClientStylist", { uId: data?._id, userType: item?.follow_by })
                                        // return
                                        // let data = item?.follow_by == "stylist" ? item?.stylisy_detail[0] : item?.client_detail[0]
                                        // if (item?.follow_by == "stylist") {
                                        //     navigation.navigate("OtherStylist", { stylist: data?._id })
                                        // } else {
                                        //     navigation.navigate("ClientProfile", { item: data })
                                        // }
                                    }}
                                    onPressBtn={() => {
                                        send_request(item?.stylisy_detail[0]?._id)
                                    }}
                                />
                            )
                        }}
                    />
            }
            {/* <Btn transparent={Appcolor.blackop} title={en?.logout} twhite styleMain={{ alignSelf: "center", marginTop: 20 }}
                onPress={() => {
                    navigation.replace("LoginB")
                    dispatch(signout())
                }}
            /> */}
        </ImageBackground>

    )
}

export default ProfileB

const styles = StyleSheet.create({
    box: { alignItems: 'center', width: "50%" }
})