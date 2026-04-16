import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'

const DeleteBlock = ({ styleMain, onPress }) => {
    const { Appcolor } = useTheme()
    return (
        <TouchableOpacity onPress={onPress} style={[{ height: 26, width: 26, backgroundColor: Appcolor.whitecolor, justifyContent: "center", alignItems: "center", borderRadius: 20 }, styleMain]}>
            <Image source={require("../assets/bin.png")} style={{ height: "50%", width: "44%" }} />
        </TouchableOpacity>
    )
}

export default DeleteBlock

const styles = StyleSheet.create({})