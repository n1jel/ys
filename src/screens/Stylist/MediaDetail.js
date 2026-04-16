import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Appimg from "../../constants/Appimg";
import Header from "../../components/Header";
import { getMediaDetail } from "../../apimanager/httpServices";
import showToast from "../../CustomToast";
import Commonstyles from "../../constants/Commonstyles";
import { useTheme } from "@react-navigation/native";
import moment from "moment";
import { fileUrl } from "../../apimanager/httpmanager";
import FastImage from "react-native-fast-image";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { setLoading } from "../../redux/load";
import VideoThumb from "../../components/VideoThumb";

const MediaDetail = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const id = route?.params?.media_id

    const theme = useSelector(state => state.theme)?.theme
    const user = useSelector(state => state?.auth?.user)

    const [post, setPost] = useState()

    useEffect(() => {
        if (id) {
            getAllData(id)
        }
    }, [id])

    const getAllData = async (id) => {
        try {
            dispatch(setLoading(true))
            let res = await getMediaDetail(id)
            if (res?.data?.status) {
                setPost(res?.data?.data)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Liked Post"} showBack onBackPress={() => navigation?.navigate("BottomTabS")} />
            <View style={{ backgroundColor: Appcolor.white, marginTop: 10 }}>
                <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
                    <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", }]}>
                        <View style={[Commonstyles(Appcolor).row]}>
                            <FastImage source={post?.stylist_data?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + post?.stylist_data?.profile_pic }} style={{ height: 40, width: 40, borderRadius: 60 }} />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={[Commonstyles(Appcolor).bold20, styles?.userName]}>{post?.stylist_data?.full_name}</Text>
                                <Text style={[Commonstyles(Appcolor).mediumText10]}>{moment(post?.collection_data?.created_at)?.fromNow()}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[Commonstyles(Appcolor).semiBold26, styles?.name]}>{post?.collection_data?.name}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, styles?.desc]}>{post?.collection_data?.description}</Text>
                </View>
                {
                    (post?.media_type == 'video' && !post?.thumbnail) ?
                        <VideoThumb source={post?.media_name} styleMain={{ width: "100%", height: heightPercentageToDP(56), marginTop: 10 }} />
                        :
                        <FastImage source={{ uri: post?.media_type == 'video' ? fileUrl + post?.thumbnail : fileUrl + post?.media_name }} style={{ width: "100%", height: heightPercentageToDP(56), marginTop: 10 }} resizeMode="contain" />
                }
                <View style={[Commonstyles(Appcolor)?.row, { marginVertical: 8, paddingHorizontal: 12 }]}>
                    <FastImage source={Appimg.like} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                    <Text style={[Commonstyles(Appcolor).mediumText10, { fontSize: 10, marginLeft: 6 }]}>{post?.like_data[0]?.total_likes} Likes</Text>
                </View>
            </View>
        </ImageBackground>
    )
}
export default MediaDetail;

const styles = StyleSheet.create({
    main: { paddingVertical: 12, marginVertical: 10 },
    userName: { fontSize: 14 },
    name: { fontSize: 12, marginTop: 6 },
    desc: { fontSize: 10 },
})
