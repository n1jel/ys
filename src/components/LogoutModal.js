import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Appimg from '../constants/Appimg'
import en from '../translation'
import Commonstyles from '../constants/Commonstyles'
import Btn from './Btn'
import { useTheme } from '@react-navigation/native'

const LogoutModal = ({ vis, onPressOut, onPressYes, onPressNo }) => {
    const { Appcolor } = useTheme()
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 12, borderRadius: 6 }}>
                    {/* <FastImage source={Appimg?.loggedout} style={{ height: 80, width: 80, alignSelf: "center", marginTop: 8 }} resizeMode="contain" /> */}
                    <Text style={[Commonstyles(Appcolor).bold20, { textAlign: "center", marginVertical: 8 }]}>{en?.logout}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, { textAlign: "center", fontSize: 14, marginTop: 8, width: "80%", alignSelf: "center" }]}>Are you sure you want to logout?</Text>
                    <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", marginBottom: 14, marginTop: 26 }]}>
                        <Btn title={en?.logout} transparent={Appcolor.blackop} twhite styleMain={{ width: "48%" }} onPress={onPressYes} />
                        <Btn title={en?.cancel} transparent={Appcolor.red} twhite styleMain={{ width: "48%" }} onPress={onPressNo} />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default LogoutModal

const styles = StyleSheet.create({})