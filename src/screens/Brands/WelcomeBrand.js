import { Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native'
import React from 'react'
import Appimg from '../../constants/Appimg'
import en from '../../translation'
import Appcolor from '../../constants/Appcolor'
import Btn from '../../components/Btn'
import { SafeAreaView } from 'react-native-safe-area-context'

const WelcomeBrand = ({ navigation }) => {
    return (
        <SafeAreaView style={{ backgroundColor: Appcolor.txt }}>
            <ImageBackground source={Appimg.goldborder} imageStyle={{ resizeMode: "stretch" }} style={[styles.main, { alignItems: "center", justifyContent: "center" }]}>
                <Pressable onPress={() => navigation?.navigate("Loginas")} style={{ marginHorizontal: 16, marginVertical: 8, alignSelf: "flex-start", marginLeft: 30 }}>
                    <Image source={Appimg?.back} style={{ height: 26, width: 26, resizeMode: "contain" }} />
                </Pressable>
                <Image source={Appimg.logo} style={styles.logo} />
                <View style={{ width: "100%", alignItems: 'center', flex: 0.8, justifyContent: "flex-end" }}>
                    <Btn title={en?.login} transparent={Appcolor.whiteop} styleMain={{ marginTop: 26 }} txtStyle={{ fontSize: 17.6, color: Appcolor.txt }} onPress={() => navigation.navigate("LoginB")} />
                    <Btn title={en?.signup} transparent2={Appcolor.primop} twhite transparent={Appcolor.yellowop} styleMain={{ marginTop: 16 }} txtStyle={{ fontSize: 17.6 }} onPress={() => navigation.navigate("SignupB")} />
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default WelcomeBrand;

const styles = StyleSheet.create({
    main: {
        width: "100%", height: "100%"
    },
    logo: {
        width: 140, height: 140, resizeMode: "contain", position: "absolute"
    }
})