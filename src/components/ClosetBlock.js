import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Commonstyles from '../constants/Commonstyles'
import Appcolor from '../constants/Appcolor'
import Appimg from '../constants/Appimg';
import { useTheme } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { fileUrl } from '../apimanager/httpmanager';
import FastImage from 'react-native-fast-image';
import VideoThumb from './VideoThumb';

const ClosetBlock = ({ item, index, onPress, styleMain, onPressEdit, onpressdelete }) => {
    const { Appcolor } = useTheme()
    return (
        <View style={[{ marginLeft: widthPercentageToDP(3), marginBottom: widthPercentageToDP(4), width: widthPercentageToDP(45), backgroundColor: "white", borderRadius: 10, justifyContent: "space-between" }, Commonstyles(Appcolor).shadow]}>
            <Pressable onPress={onPress}>
                {item?.media_data?.length == 0 ?
                    <Image source={Appimg.logo} style={{ height: heightPercentageToDP(20), width: widthPercentageToDP(45), borderRadius: 6 }} />
                    :
                    item?.media_data[0]?.media_type == "video" ?
                        <VideoThumb source={item?.media_data?.[0]?.media_name} styleMain={{ height: heightPercentageToDP(20), width: widthPercentageToDP(45), borderRadius: 6 }} resizeMode={"cover"} />
                        :
                        <FastImage source={{ uri: fileUrl + item?.media_data?.[0]?.media_name }} style={{ height: heightPercentageToDP(20), width: widthPercentageToDP(45), borderRadius: 6, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
                }
            </Pressable>
            <View style={{ backgroundColor: Appcolor.whiteop, width: widthPercentageToDP(45), padding: 5, paddingVertical: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, }}>
                <View style={[Commonstyles(Appcolor).row]}>
                    <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: RFValue(12), maxWidth: "91%" }]} numberOfLines={1}>{item?.name}</Text>
                    {item?.display_type == "private" ?
                        <Image source={Appimg?.lock} style={{ height: 16, width: 16, resizeMode: "contain", marginLeft: 6 }} />
                        :
                        <Image source={Appimg?.earth} style={{ height: 16, width: 16, resizeMode: "contain", marginLeft: 6 }} />
                    }
                </View>
                <Text style={[Commonstyles(Appcolor).regular12, { fontSize: RFValue(8) }]}>{item?.description}</Text>
                <View style={[Commonstyles(Appcolor).row, { justifyContent: "flex-end" }]}>
                    <Pressable onPress={onPressEdit} style={[styles?.editBtns, { marginRight: 8 }, Commonstyles(Appcolor).shadow]}>
                        <Image source={Appimg?.editblack} style={{ height: "50%", width: "50%" }} resizeMode="contain" />
                    </Pressable>
                    <Pressable onPress={onpressdelete} style={[styles?.editBtns, Commonstyles(Appcolor).shadow]}>
                        <Image source={Appimg?.bin} style={{ height: "50%", width: "50%" }} resizeMode="contain" />
                    </Pressable>
                </View>
            </View>
        </View >
    )
}

export default ClosetBlock

const styles = StyleSheet.create({
    editBtns: { backgroundColor: Appcolor.white, height: 20, width: 20, justifyContent: "center", alignItems: 'center', borderRadius: 20 }
})