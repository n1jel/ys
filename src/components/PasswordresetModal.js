import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import Appimg from '../constants/Appimg'
import en from '../translation'
import Commonstyles from '../constants/Commonstyles'
import Btn from './Btn'
import { useTheme } from '@react-navigation/native'

const PasswordresetModal = ({ vis, onPress }) => {
    const { Appcolor } = useTheme()
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.whiteop, flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={{ width: "86%", backgroundColor: Appcolor.white, padding: 26, borderRadius: 6 }}>
                    <Image source={Appimg?.logo} style={{ height: 100, width: 90, alignSelf: "center" }} resizeMode='contain' />
                    <Text style={[Commonstyles?.bold20, { textAlign: 'center', marginTop: 16, color: Appcolor.txt }]}>{en?.passwordresetsuccessfully}</Text>
                    <Text style={[Commonstyles?.regular12, { textAlign: 'center', marginTop: 8, lineHeight: 20, color: Appcolor.txt }]}>{en?.newpasstxtmodal}</Text>
                    <Btn
                        transparent={Appcolor.yellowop} transparent2={Appcolor.primop}
                        title={en?.login} styleMain={{ alignSelf: 'center', marginTop: 20, width: "100%" }}
                        onPress={onPress}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default PasswordresetModal

const styles = StyleSheet.create({})