import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import Commonstyles from '../constants/Commonstyles'
import { useTheme } from '@react-navigation/native'
import { fileUrl } from '../apimanager/httpmanager'
import Appimg from '../constants/Appimg'
import { widthPercentageToDP } from 'react-native-responsive-screen'

const UsersBlock = ({ item, index, styleMain, onPressStylist, onPressClient, onPressBrand }) => {
    const { Appcolor } = useTheme()
    let isStylist = item?.follow_by == "stylist"
    let detail = isStylist ? item?.stylisy_detail[0] : item?.client_detail[0]

    if (item?.brand_detail?.length > 0) {
        return (
            <Pressable style={[styles.mainView, styleMain]} onPress={onPressBrand}>
                <FastImage source={item?.brand_detail[0]?.profile_pic ? { uri: fileUrl + item?.brand_detail[0]?.profile_pic } : Appimg?.avatar} style={styles.imgStyle} />
                <Text style={[Commonstyles(Appcolor).mediumText12, { marginTop: 8 }]}>{item?.brand_detail[0]?.full_name}</Text>
            </Pressable>
        )
    }
    if (isStylist) {
        let isFreelancer = detail?.stylist_type == "freelancer"
        return (
            <Pressable style={[styles.mainView, styleMain]} onPress={onPressStylist}>
                <FastImage source={detail?.profile_pic ? { uri: fileUrl + detail?.profile_pic } : Appimg?.avatar} style={styles.imgStyle} />
                <Text style={[Commonstyles(Appcolor).mediumText12, { marginTop: 8 }]}>{detail?.full_name}</Text>
                {/* {!isFreelancer && <Text style={[Commonstyles(Appcolor).mediumText10, { marginTop: 0 }]}> ({detail?.company_name})</Text>} */}
                {(detail?.city != "" && detail?.city != "undefined") && <Text style={[Commonstyles(Appcolor).mediumText10]}>{detail?.city}</Text>}
            </Pressable>
        )
    }
    return (
        <Pressable style={[styles.mainView, styleMain]} onPress={onPressClient}>
            <FastImage source={detail?.profile_pic ? { uri: fileUrl + detail?.profile_pic } : Appimg?.avatar} style={styles.imgStyle} />
            <Text style={[Commonstyles(Appcolor).mediumText12, { marginTop: 8 }]}>{detail?.full_name}</Text>
        </Pressable>
    )
}

export default UsersBlock

const styles = StyleSheet.create({
    imgStyle: {
        height: widthPercentageToDP(24), width: widthPercentageToDP(24), borderRadius: 100
    },
    mainView: {
        alignItems: 'center'
    }
})