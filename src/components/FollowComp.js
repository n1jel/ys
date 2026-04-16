import { View, Text, Pressable } from 'react-native'
import React from 'react'
import UserProf, { UserProfData } from './UserProf'
import Appcolor from '../constants/Appcolor'
import Btn from './Btn'
import Appfonts from '../constants/Appfonts'
import { useNavigation, useTheme } from '@react-navigation/native'
import { fileUrl } from '../apimanager/httpmanager'

export default function FollowComp({ item, status, onPress, onPressFolow }) {
    const navigation = useNavigation()
    const { Appcolor } = useTheme()
    return (
        <Pressable style={{
            backgroundColor: Appcolor.lessDark, shadowColor: "#2626260D",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            marginHorizontal: 16,
            padding: 10,
            marginTop: 15, borderRadius: 5,
            shadowRadius: 3,
            elevation: 5,
            flexDirection: "row",
            alignItems: "center", justifyContent: "space-between"
        }}
            onPress={onPress}
        >
            <UserProfData onPress={onPress} txtStyle={{ color: Appcolor.txt }} name={item.full_name} parentBrand={item?.parent_brand_detail?.brand_name} profilePic={item.profile_pic == '' ? require('../assets/user.png') : { uri: fileUrl + item.profile_pic }} />
            <FollowButton onPress={onPressFolow} status={item} />
        </Pressable>
    )
}

const FollowButton = ({ status, onPress }) => {
    return (
        <Pressable onPress={onPress} style={{ height: 35, borderRadius: 110, justifyContent: "center", backgroundColor: Appcolor.primary, alignItems: "center", width: 100, borderWidth: 1, borderColor: Appcolor.primary }}>
            <Text style={{ color: Appcolor.white, fontFamily: Appfonts.regular, fontSize: 12 }}>{status?.follow_data[0]?.follow_status == 'pending' ? "Requested" : status?.follow_data[0]?.follow_status == 'accepted' ? 'Unfollow' : "Follow"}</Text>
        </Pressable>
    )
}