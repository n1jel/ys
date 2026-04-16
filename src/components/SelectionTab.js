import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Commonstyles from '../constants/Commonstyles'
import { useTheme } from '@react-navigation/native'

const SelectionTab = ({ setShowType, showType }) => {
    const { Appcolor } = useTheme()

    return (
        <View style={{ backgroundColor: "transparent", borderWidth: 0.6, borderColor: Appcolor.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: 30, marginHorizontal: 16 }}>
            <Pressable
                style={{ ...styles.userType, backgroundColor: showType == "Stylist" ? Appcolor.yellowop : null, }}
                onPress={() => {
                    setShowType("Stylist")
                }}
            >
                <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Stylist" ? Appcolor.white : Appcolor.txt }]}>Stylist</Text>
            </Pressable>
            <Pressable
                style={{ ...styles.userType, backgroundColor: showType == "Brand" ? Appcolor.yellowop : null, }}
                onPress={() => {
                    setShowType("Brand")
                }}
            >
                <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Brand" ? Appcolor.white : Appcolor.txt }]}>Brand</Text>
            </Pressable>
        </View>
    )
}

export default SelectionTab

const styles = StyleSheet.create({
    userType: {
        height: 40, width: "50%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 30
    },
})