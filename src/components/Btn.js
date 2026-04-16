import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Commonstyles from '../constants/Commonstyles'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '@react-navigation/native'
import { useSelector } from 'react-redux'

const Btn = ({ title, onPress, styleMain, transparent, txtStyle, twhite, img, transparent2 }) => {
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme
    return (
        <LinearGradient
            // colors={[transparent ? transparent : "#000000", transparent2 ? transparent2 : transparent ? transparent : "#444444"]}
            colors={[Appcolor.grad1, Appcolor.primary]}
            // colors={[Appcolor.newgrad1, Appcolor.newgrad2,Appcolor.newgrad1]}
            style={[styles.main, styleMain]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
            <Pressable
                onPress={onPress}
                style={{ width: "100%", height: "100%", flexDirection: "row", justifyContent: "center", alignItems: "center" }}
            >
                {img}
                <Text style={[Commonstyles(Appcolor).mediumText14, { color: twhite ? Appcolor.white : Appcolor.txt }, txtStyle]}>{title}</Text>
            </Pressable>
        </LinearGradient>
    )
}

export default Btn

const styles = StyleSheet.create({
    main: { width: "80%", height: 52 }
})