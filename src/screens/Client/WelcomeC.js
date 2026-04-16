import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appimg from '../../constants/Appimg'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Btn from '../../components/Btn'
import { useTheme } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Appcolor from '../../constants/Appcolor'
import Appfonts from '../../constants/Appfonts'

const WelcomeC = ({ navigation }) => {
    return (
        <SafeAreaView style={{ backgroundColor: Appcolor.txt }}>
            <ImageBackground source={Appimg.goldborder} imageStyle={{ resizeMode: "stretch" }} style={[styles.main, { alignItems: "center", justifyContent: "center" }]}>
                <Pressable onPress={() => navigation?.goBack()} style={{ marginHorizontal: 16, marginVertical: 8, alignSelf: "flex-start", marginLeft: 30 }}>
                    <Image source={Appimg?.back} style={{ height: 26, width: 26, resizeMode: "contain" }} />
                </Pressable>
                <Image source={Appimg.logo} style={styles.logo} />
                <View style={{ width: "100%", alignItems: 'center', flex: 0.8, justifyContent: "flex-end" }}>
                    <Btn title={en?.login} transparent={Appcolor.whiteop} styleMain={{ marginTop: 26 }} txtStyle={{ fontSize: 17.6, color: Appcolor.txt }} onPress={() => navigation.navigate("LoginC")} />
                    <Btn title={en?.signup} transparent={Appcolor.yellowop} transparent2={Appcolor.primop} styleMain={{ marginTop: 16 }} txtStyle={{ fontSize: 17.6, color: 'black' }} onPress={() => navigation.navigate("SignupC")} />
                    {/* <Text style={{ color: Appcolor.primary, fontSize: 14, fontFamily: Appfonts.semiBold, marginTop: 8 }} onPress={() => { navigation?.navigate("StylistStack", { screen: "WelcomeS" }) }}>Switch to Stylist</Text> */}
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default WelcomeC

const styles = StyleSheet.create({
    main: {
        width: "100%", height: "100%"
    },
    logo: {
        width: 140, height: 140, resizeMode: "contain", position: "absolute"
    }
})