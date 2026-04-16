import { Image, ImageBackground, NativeEventEmitter, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import Appimg from '../constants/Appimg'
import Btn from '../components/Btn'
import en from '../translation'
import Appcolor from '../constants/Appcolor'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeModules } from 'react-native';
import { heightPercentageToDP } from 'react-native-responsive-screen'
const Loginas = ({ navigation }) => {




    return (
        <SafeAreaView style={{ backgroundColor: Appcolor.txt }}>
            <ImageBackground source={Appimg.goldborder} imageStyle={{ resizeMode: "stretch" }} style={[styles.main, { alignItems: "center", justifyContent: "center" }]}>
                <Image source={Appimg.logo} style={styles.logo} />
                {/* <View style={{ width: "100%", alignItems: 'center', flex: 0.9, justifyContent: "flex-end" }}> */}
                <Btn title={en?.loginasclient} transparent={Appcolor.whiteop} styleMain={{ backgroundColor: Appcolor.whiteop, marginTop: heightPercentageToDP(20) }} txtStyle={{ fontSize: 17.6, color: 'black' }} onPress={() => { navigation.navigate("ClientStack") }} />
                <Btn title={en?.loginaspersonalstylist} transparent={Appcolor.yellowop} transparent2={Appcolor.primop} styleMain={{ backgroundColor: Appcolor.primop, marginTop: 16 }} txtStyle={{ fontSize: 17.6, color: 'black' }} onPress={() => { navigation.navigate("StylistStack") }} />
                <Btn title={en?.loginasBrand} transparent={Appcolor.yellowop} transparent2={Appcolor.primop} styleMain={{ backgroundColor: Appcolor.primop, marginTop: 16 }} txtStyle={{ fontSize: 17.6, color: 'black' }} onPress={() => { navigation.navigate("BrandStack") }} />
                {/* </View> */}
            </ImageBackground>
        </SafeAreaView>
    )
}

export default Loginas

const styles = StyleSheet.create({
    main: {
        width: "100%", height: "100%", backgroundColor: Appcolor.txt
    },
    logo: {
        width: 140, height: 140, resizeMode: "contain",
        // position: "absolute"
    }
})