import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Appimg from '../constants/Appimg'
import en from '../translation'
import Commonstyles from '../constants/Commonstyles'
import Btn from './Btn'
import Tinput from './Tinput'
import { useTheme } from '@react-navigation/native'

const AddStylistModel = ({ vis, onPressOut, onPress, value, onChangeText, email, onChangeEmail }) => {
    const { Appcolor } = useTheme()
    const [err, setErr] = useState("")
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.lessDark, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, borderRadius: 6 }}>
                    <Text style={[Commonstyles(Appcolor).bold20, { textAlign: "center", marginVertical: 8, color: "white" }]}>Add Employee</Text>
                    <Tinput value={value} onChangeText={onChangeText} place={en?.fullname} styleMain={{ marginTop: 16 }} img={Appimg.user} />
                    <Tinput value={email} onChangeText={onChangeEmail} place={en?.email} styleMain={{ marginTop: 20 }} img={Appimg.mail} />
                    {err && <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 8, marginLeft: 16, color: "red" }]}>{err}*</Text>}
                    <Btn transparent={Appcolor.blackop} title={en?.add} twhite styleMain={{ marginTop: 36, marginBottom: 20, alignSelf: "center" }}
                        onPress={() => {
                            if (value?.trim() == "") {
                                setErr("Name is required.")
                                return
                            }
                            if (email?.trim() == "") {
                                setErr("Email is required.")
                                return
                            }
                            setErr("")
                            onPress()
                        }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default AddStylistModel