import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomSwitch from './CustomSwitch'
import Commonstyles from '../constants/Commonstyles'
import Appcolor from '../constants/Appcolor'
import Appimg from '../constants/Appimg'

const SettingsListRender = ({ i, j, onPressSwitch, notSource, darksource, theme, onNotClick, onbiometricPress, biometric }) => {
    return (
        <Pressable
            style={{ height: 48, marginHorizontal: 16, paddingHorizontal: 8, backgroundColor: theme == 'dark' ? "#22222280" : "#FEFBF4", flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", marginBottom: 4 }}
            onPress={i?.onPress}
        >
            <Text style={[Commonstyles(Appcolor).mediumText14, { color: theme == 'dark' ? Appcolor.white : Appcolor.txt }]}>{i?.title}</Text>
            {
                i?.title == "Notification" ?
                    <CustomSwitch onPress={onNotClick} source={notSource} /> :
                    i?.title == "Biometrics"
                        ?
                        <CustomSwitch source={biometric} onPress={onbiometricPress} />
                        :
                        i?.title == "Dark Theme" ?
                            <CustomSwitch source={darksource} onPress={onPressSwitch} />
                            :
                            <Image source={Appimg.arrowright} style={{ height: 14, width: 10, resizeMode: "contain", tintColor: Appcolor.yellowop }} />
            }
        </Pressable>
    )
}

export default SettingsListRender

const styles = StyleSheet.create({})