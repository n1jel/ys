import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import Appimg from '../constants/Appimg'
import en from '../translation'
import Commonstyles from '../constants/Commonstyles'
import Btn from './Btn'
import { useTheme } from '@react-navigation/native'

const PasswordUpdated = ({ vis, onPressDone, title, desc, btnTitle }) => {
    const { Appcolor } = useTheme()
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.whiteop, flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 8, borderRadius: 6 }}>
                    <Image source={Appimg.done} style={{ height: 80, width: 80, alignSelf: "center", marginTop: 16 }} />
                    <Text style={[Commonstyles(Appcolor).bold20, { fontSize: 22, marginTop: 10, textAlign: 'center' }]}>{title ? title : "Password Change\nSuccessfully"}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, { textAlign: 'center', width: "70%", alignSelf: "center", marginTop: 12 }]}>{desc ? desc : en?.newpasstxtmodal}</Text>
                    <Btn title={btnTitle ? btnTitle : "Done"} twhite transparent={Appcolor.txt} styleMain={{ alignSelf: "center", marginBottom: 16, marginTop: 30 }}
                        onPress={onPressDone}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default PasswordUpdated

const styles = StyleSheet.create({})