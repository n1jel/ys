import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import Appcolor from '../constants/Appcolor'
import Commonstyles from '../constants/Commonstyles'
import { useNavigation, useTheme } from '@react-navigation/native'
import { fileUrl } from '../apimanager/httpmanager'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Appimg from '../constants/Appimg'

const StylistBlock = ({ item, index, styleMain, isBrand, onPress }) => {
    const { Appcolor } = useTheme()
    const navigation = useNavigation()

    return (
        <Pressable
            onPress={() => {
                if (onPress) {
                    onPress()
                    return
                }
                if (item?.user_type == "brand") {
                    navigation.navigate("BrandProfile", { id: item._id })
                } else {
                    navigation.navigate("StylishProfile", { id: item._id })
                }
            }}
            style={[{
                alignItems: "center",
                // marginHorizontal: index % 2 != 0 ? 26 : 0
                marginRight: widthPercentageToDP(8)
            }, styleMain]}
        >
            <FastImage source={item?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item.profile_pic }} style={{ height: 100, width: 100, borderRadius: 100, borderColor: Appcolor.primary, borderWidth: 0.6 }} />
            <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, marginTop: 8 }]}>{item?.full_name}</Text>
            {item?.parent_brand_detail?.brand_name && <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 10, marginTop: 0 }]}>{isBrand && `(${item?.parent_brand_detail?.brand_name})`}</Text>}
            {item?.city != "undefined" && <Text style={[Commonstyles(Appcolor).mediumText12]}>{item?.city}</Text>}
        </Pressable>
    )
}

export default StylistBlock

const styles = StyleSheet.create({})