import React from "react";
import { View, Text, Image } from 'react-native'
import { useSelector } from "react-redux";
import Appcolor from "../constants/Appcolor";
import Commonstyles from "../constants/Commonstyles";

export default function BellIcon() {
    const notifications = useSelector(state => state.CommanReducer)?.notifications
    return (
        <View>
            <Image source={require("../assets/notificationGold.png")} style={{ height: 19, width: 19, resizeMode: "contain", }} />
            {notifications != '0' &&
                <View style={{ height: 20, width: 20, borderRadius: 20, backgroundColor: "red", position: "absolute", right: -10, top: -12, justifyContent: "center", alignItems: "center" }} >
                    <Text style={[Commonstyles(Appcolor).mediumText10, { color: Appcolor.white }]}>{notifications}</Text>
                </View>
            }
        </View>
    )
}