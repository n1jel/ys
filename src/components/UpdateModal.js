import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import Appimg from '../constants/Appimg'
import en from '../translation'
import Commonstyles from '../constants/Commonstyles'
import Btn from './Btn'

const UpdateModal = ({ vis, onPressDone }) => {
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 8, borderRadius: 6 }}>
                    <Image source={Appimg.done} style={{ height: 80, width: 80, alignSelf: "center", marginTop: 16 }} />
                    <Text style={[Commonstyles.bold20, { fontSize: 18, marginTop: 10, textAlign: 'center' }]}>{en?.updatesucessfully}</Text>
                    <Text style={[Commonstyles.regular12, { textAlign: 'center', fontSize: 14, width: "70%", alignSelf: "center", marginTop: 12 }]}>{en?.updatedprofile}</Text>
                    <Btn title={en?.backtohome} twhite styleMain={{ alignSelf: "center", marginVertical: 16 }}
                        onPress={onPressDone}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default UpdateModal

const styles = StyleSheet.create({})