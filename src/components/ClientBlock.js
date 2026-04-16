import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import Appcolor from '../constants/Appcolor'
import Commonstyles from '../constants/Commonstyles'
import { useNavigation, useTheme } from '@react-navigation/native'
import { fileUrl } from '../apimanager/httpmanager'
import Appimg from '../constants/Appimg'
import { widthPercentageToDP } from 'react-native-responsive-screen'

const ClientBlock = ({ item, index, styleMain }) => {
    const { Appcolor } = useTheme()
    const navigation = useNavigation()
    return (
        <Pressable onPress={() => {
            navigation.navigate("ClientProfile", { item: item })
        }} style={[{ alignItems: "center", marginRight: widthPercentageToDP(10), marginTop: 15 }, styleMain]}>
            <FastImage source={item?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item.profile_pic }} style={{ height: 100, width: 100, borderRadius: 100, borderColor: Appcolor.primary, borderWidth: 0.6 }} />
            <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, marginTop: 8 }]}>{item.full_name}</Text>
        </Pressable>
    )
}

export default ClientBlock

const styles = StyleSheet.create({})