import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Appfonts from '../constants/Appfonts'
import { useTheme } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'

const GalleryLoader = ({ total, current }) => {
    const { Appcolor } = useTheme()
    const [type, setType] = useState(false)

    useEffect(() => {
        if (total > 0 || current > 0) {
            setType(true)
        }
    }, [total, current])

    return (
        <LinearGradient
            // colors={[Appcolor.newgrad1, Appcolor.newgrad2,Appcolor.newgrad1]}
            colors={[Appcolor.grad1, Appcolor.primary]}
            style={[styles.main]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
            {/* <View style={{ backgroundColor: Appcolor.lessDark, position: "absolute", top: heightPercentageToDP(40), justifyContent: "center", alignItems: "center", alignSelf: "center", borderRadius: 4, height: heightPercentageToDP(20), width: "80%" }}> */}
            <Text style={{ color: Appcolor.white, fontSize: 16, fontFamily: Appfonts.semiBold }}>{type ? "Compressing" : "Loading"} please wait...</Text>
            {type && <Text style={{ color: Appcolor.white, fontSize: 16, fontFamily: Appfonts.semiBold }}>{current} of {total}</Text>}
            {/* </View> */}
        </LinearGradient>
    )
}

export default GalleryLoader

const styles = StyleSheet.create({
    main: {
        position: "absolute", top: heightPercentageToDP(40),
        justifyContent: "center", alignItems: "center", alignSelf: "center",
        borderRadius: 4,
        height: heightPercentageToDP(20), width: "80%"
    }
})