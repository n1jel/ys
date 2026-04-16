import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Appimg from '../constants/Appimg'

const CustomSwitch = ({onPress,source}) => {
    const [notiState, setNotiState] = useState(false)
    return (
        <Pressable
            onPress={onPress}
        >
            {/* <Image source={notiState ? Appimg?.switchon : Appimg?.switchoff} style={{ width: 30, height: 16, resizeMode: "contain" }} /> */}
            <Image source={source} style={{ width: 30, height: 16, resizeMode: "contain" }} />
        </Pressable>
    )
}

export default CustomSwitch

const styles = StyleSheet.create({})