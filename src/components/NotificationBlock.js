import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Commonstyles from '../constants/Commonstyles'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Btn from './Btn'
import { fileUrl } from '../apimanager/httpmanager'
import { useNavigation, useTheme } from '@react-navigation/native'
import Appimg from '../constants/Appimg'
import { useSelector } from 'react-redux'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import moment from 'moment'
import VideoThumb from './VideoThumb'

const NotificationBlock = ({ item, index, onPressAccept, onPressReject, onDeletePress }) => {
    const theme = useSelector(state => state.theme)?.theme
    const user = useSelector(state => state?.auth?.user)

    const ef = React.useRef(null)
    const navigation = useNavigation()
    const { Appcolor } = useTheme()

    const [showDelete, setShowDelete] = React.useState(false)

    return (
        <SwipeRow ref={ef} rightOpenValue={-60}
            disableRightSwipe={true}
            disableLeftSwipe={item?.item?.is_requested == 1 ? true : false}
            onRowOpen={(value) => { setShowDelete(true) }}
            onRowClose={() => { setShowDelete(false) }}>
            <TouchableOpacity
                onPress={() => {
                    onDeletePress()
                    setTimeout(() => {
                        ef?.current?.closeRow()
                    }, 1000);
                }}
                style={[styles.deleteview, { backgroundColor: showDelete ? theme == 'dark' ? "#22222280" : "#FEFBF4" : 'transparent', }]} >
                {showDelete && <Image source={Appimg.delete1} style={{ height: 20, width: 20, resizeMode: 'contain', }} />}
            </TouchableOpacity>
            <Pressable style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", backgroundColor: theme == 'dark' ? "#22222280" : "#FEFBF4", marginHorizontal: 18, paddingHorizontal: 8, paddingVertical: 6, marginTop: 8, borderRadius: 4 }]}
                onPress={() => {
                    if (item?.notification_type == "place_order_request") {
                        navigation?.navigate("StylistChat", { item: item?.client_id })
                    }
                    if (item?.notification_type == "collection") {
                        navigation?.navigate("CollectionsC", { _item: { stylist_id: item?.stylist_id?._id, ...item?.collection_id } })
                    }
                    if (item?.notification_type == "follow") {
                        console.log(item);
                        if (user?.user_type == "client") {
                            if (item?.stylist_id?._id) {
                                navigation?.navigate("StylishProfile", { id: item?.stylist_id?._id })
                            } else {
                                navigation.navigate("BrandProfile", { id: item?.brand_id?._id })
                            }
                        } else if (user?.user_type == "brand") {
                            let uId = item?.stylist_id?._id ? item?.stylist_id?._id : item?.client_id?._id
                            navigation.navigate("ProfileClientStylist", { uId, userType: item?.sender })
                        } else {
                            if (item?.sender == "client") {
                                navigation?.navigate("ClientProfile", { item: item?.client_id })
                            } else if (item?.sender == "brand") {
                                navigation.navigate('BrandProfileStylist', { brand: item?.brand_id?._id })
                            } else {
                                navigation?.navigate("OtherStylist", { stylist: item?.follow_by_stylist_id?._id })
                            }
                        }
                    }
                    if (item?.notification_type == "like") {
                        navigation?.navigate("MediaDetail", { media_id: item?.media_id?._id })
                    }
                }}
            >
                <View style={[Commonstyles(Appcolor).row, { width: "78%" }]}>
                    {
                        item?.sender == 'brand' ?
                            item?.receiver == "brand" ?
                                <FastImage source={item?.follow_by_brand_id?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item?.follow_by_brand_id?.profile_pic }} style={{ height: 56, width: 56, borderRadius: 60, marginRight: 8 }} />
                                :
                                <FastImage source={item?.brand_id?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item?.brand_id?.profile_pic }} style={{ height: 56, width: 56, borderRadius: 60, marginRight: 8 }} />
                            :
                            item?.sender == 'stylist' ?
                                item?.receiver == "stylist" ?
                                    <FastImage source={item?.follow_by_stylist_id?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item?.follow_by_stylist_id?.profile_pic }} style={{ height: 56, width: 56, borderRadius: 60, marginRight: 8 }} />
                                    :
                                    <FastImage source={item?.stylist_id?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item?.stylist_id?.profile_pic }} style={{ height: 56, width: 56, borderRadius: 60, marginRight: 8 }} />
                                :
                                <FastImage source={item?.client_id?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item?.client_id?.profile_pic }} style={{ height: 56, width: 56, borderRadius: 60, marginRight: 8 }} />
                    }

                    <View style={{ width: "78%" }}>
                        <Text style={[Commonstyles(Appcolor).mediumText12, { color: Appcolor.txt }]}>{item?.body}</Text>
                        <Text style={[Commonstyles(Appcolor).mediumText10]}>{moment(item?.created_at).fromNow()}</Text>
                        {item?.follow_status == 'pending' &&
                            <View style={[Commonstyles(Appcolor).row, { marginTop: 6 }]}>
                                <Btn transparent2={Appcolor.grad1} onPress={onPressAccept} transparent={Appcolor.yellowop} title="Accept" twhite styleMain={{ width: "40%", height: 26, borderRadius: 4 }} />
                                <Btn transparent={Appcolor.blackop} onPress={onPressReject} title="Reject" twhite styleMain={{ width: "40%", height: 26, borderRadius: 4, marginLeft: 16 }} />
                            </View>
                        }
                    </View>
                </View>
                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'flex-end' }}>
                    {item?.media_id?.gallery_media_id?.media_name ?
                        item?.media_id?.gallery_media_id?.media_type == "video" ?
                            <VideoThumb source={item?.media_id?.gallery_media_id?.media_name} styleMain={{ height: 40, width: 40 }} resizeMode={"cover"} />
                            :
                            <FastImage source={item?.media_id?.gallery_media_id?.media_type == "video" ? { uri: fileUrl + item?.media_id?.gallery_media_id?.thumbnail } : { uri: fileUrl + item?.media_id?.gallery_media_id?.media_name }} style={{ height: 40, width: 40 }} />
                        :
                        item?.media_id_brand?.gallery_media_id?.media_name ?
                            item?.media_id_brand?.gallery_media_id?.media_type == "video" ?
                                <VideoThumb source={item?.media_id_brand?.gallery_media_id?.media_name} styleMain={{ height: 40, width: 40 }} resizeMode={"cover"} />
                                :
                                <FastImage source={item?.media_id_brand?.gallery_media_id?.media_type == "video" ? { uri: fileUrl + item?.media_id_brand?.gallery_media_id?.thumbnail } : { uri: fileUrl + item?.media_id_brand?.gallery_media_id?.media_name }} style={{ height: 40, width: 40 }} />
                            :
                            <></>
                    }
                </View>
            </Pressable>
        </SwipeRow>
    )
}

export default NotificationBlock

const styles = StyleSheet.create({
    deleteview: {
        alignSelf: 'flex-end', height: 65, width: 65,
        justifyContent: 'center', alignItems: 'center', marginTop: 10, borderRadius: 5, marginRight: 2, marginHorizontal: 18
    },
})