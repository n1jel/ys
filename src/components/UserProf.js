import React from "react";
import { View, Text, Image, Pressable } from 'react-native'
import Appcolor from "../constants/Appcolor";
import Appfonts from "../constants/Appfonts";

export default function UserProf({ name, email, profilePic, txtStyle }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* <View style={{ height: 50, width: 50, backgroundColor: Appcolor.white, borderRadius: 55, justifyContent: "center", alignItems: "center" }}>
                <Image
                    style={{ height: 46, width: 46, borderRadius: 46, backgroundColor: Appcolor.txt }}
                    source={profilePic}
                />
            </View> */}
            {/* <View>
                <Text style={[{ fontFamily: Appfonts.bold, fontSize: 15, color: Appcolor.txt }, txtStyle]}>Hi, {name}</Text>
            </View> */}
            <Text style={[{ fontFamily: Appfonts.bold, fontSize: 15, color: Appcolor.txt }, txtStyle]}>YOUR SEASON</Text>
        </View>
    )
}

export function UserProfData({ name, parentBrand = "", company, profilePic, txtStyle, onPress }) {
    return (
        <Pressable onPress={() => {
            if (onPress) {
                onPress()
            }
        }} style={{ flexDirection: "row", alignItems: "center", }}>
            <View style={{ height: 55, width: 55, backgroundColor: Appcolor.white, borderRadius: 55, justifyContent: "center", alignItems: "center" }}>
                <Image
                    style={{ height: 50, width: 50, borderRadius: 50 }}
                    source={profilePic}
                />
            </View>
            <View style={{ marginLeft: 10 }}>
                <Text style={[{ fontFamily: Appfonts.bold, fontSize: 15, color: Appcolor.white }, txtStyle]}>{parentBrand ? `${name} (${parentBrand})` : name}</Text>
                {/* <Text style={[{ marginTop: 2, fontFamily: Appfonts.regular, color: Appcolor.white }, txtStyle]}>{company}</Text> */}
            </View>
        </Pressable>
    )
}