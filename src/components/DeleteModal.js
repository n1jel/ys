import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Appimg from '../constants/Appimg'
import en from '../translation'
import Commonstyles from '../constants/Commonstyles'
import Btn from './Btn'
import { useTheme } from '@react-navigation/native'

const DeleteModal = ({ vis, onPressOut, onPressDlt, onPresscancel }) => {
    const { Appcolor } = useTheme()
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 12, borderRadius: 6 }}>
                    {/* <FastImage source={Appimg.delete} style={{ height: 100, width: 80, alignSelf: "center" }} /> */}
                    <Text style={[Commonstyles(Appcolor).bold20, { textAlign: "center", marginVertical: 8 }]}>{en?.deleteaccount}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, { textAlign: "center", fontSize: 14, marginTop: 8, width: "70%", alignSelf: "center" }]}>{en?.areyousure}?</Text>
                    <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", marginVertical: 14 }]}>
                        <Btn title={en?.delete} transparent={Appcolor.red} twhite styleMain={{ width: "48%" }} onPress={onPressDlt} />
                        <Btn title={en?.cancel} transparent={Appcolor.txt} twhite styleMain={{ width: "48%" }} onPress={onPresscancel} />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default DeleteModal

const styles = StyleSheet.create({})