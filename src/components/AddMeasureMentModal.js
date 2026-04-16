import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '@react-navigation/native'
import Tinput from './Tinput'
import Commonstyles from '../constants/Commonstyles'
import Appimg from '../constants/Appimg'
import Btn from './Btn'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { heightPercentageToDP } from 'react-native-responsive-screen'

const AddMeasureMentModal = (props) => {
    const { vis, onPressOut, onSubmit } = props
    const { Appcolor } = useTheme()
    const [obj, setObj] = useState({ name: "", size: "", unit: "in", custom: 1 })
    const [warning, setWarning] = useState("")
    const [isFocused, setIsFocused] = useState(false)

    const onPressCreate = () => {
        try {
            if (obj?.name?.trim() == "") {
                setWarning("* Title is required")
                return
            }
            if (obj?.size == 0 || obj?.size == "") {
                setWarning("* Value is required")
                return
            }
            onSubmit(obj)
            closeModal()
        } catch (e) {
            console.error(e);
        }
    }
    const closeModal = () => {
        onPressOut()
        setWarning("")
        blur()
        setObj({ name: "", size: "", unit: "in", custom: 1 })
    }
    const focus = () => {
        setIsFocused(true)
    }
    const blur = () => {
        setIsFocused(false)
    }
    const handleInputChange = (text) => {
        if (text.startsWith(".")) {
            return text.slice(1); // Remove the dot from the beginning
        }

        const sanitizedText = text.replace(/[^0-9.]/g, '');

        if (sanitizedText.includes(".") && sanitizedText.split('.').length > 2) {
            return sanitizedText.slice(0, -1);
        }

        return sanitizedText;
    };

    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.modal, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={() => closeModal()}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, borderRadius: 6, paddingVertical: 16, marginTop: isFocused ? -heightPercentageToDP(20) : 0 }}>
                    <ScrollView>
                        <Pressable onPress={() => closeModal()}>
                            <Image source={Appimg.cancel} style={{ height: 26, width: 26, position: "absolute", top: 0, right: 16 }} />
                        </Pressable>
                        <Text style={[Commonstyles(Appcolor).bold20, { alignSelf: "center" }]}>Add Measurement</Text>
                        <Tinput
                            place={"Title"}
                            value={obj?.name}
                            onChangeText={(t) => { setObj({ ...obj, name: t }) }}
                            textInputProps={{
                                onFocus: () => { focus() },
                                onBlur: () => { blur() }
                            }}
                        />
                        <Tinput
                            place={"Value"}
                            styleMain={{ marginTop: 16 }}
                            value={obj?.size?.toString()}
                            onChangeText={(t) => { setObj({ ...obj, size: handleInputChange(t) }) }}
                            keyboard={"numeric"}
                            textInputProps={{
                                onFocus: () => { focus() },
                                onBlur: () => { blur() }
                            }}
                        />
                        <Text style={[Commonstyles(Appcolor).mediumText10, { marginTop: 16, marginLeft: 16 }]}>Select units</Text>
                        <Pressable onPress={() => { setObj({ ...obj, unit: "in" }) }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginLeft: 16, alignSelf: "flex-start" }}>
                            <View style={{ height: 20, width: 20, borderRadius: 26, borderWidth: 1, borderColor: "white" }}>
                                {obj?.unit == "in" && <Image source={Appimg.circleCheck} style={{ height: "100%", width: "100%" }} />}
                            </View>
                            <Text style={[Commonstyles(Appcolor).mediumText14, { marginLeft: 10 }]}>Inches</Text>
                        </Pressable>
                        <Pressable onPress={() => { setObj({ ...obj, unit: "cm" }) }} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginLeft: 16, alignSelf: "flex-start" }}>
                            <View style={{ height: 20, width: 20, borderRadius: 26, borderWidth: 1, borderColor: "white" }}>
                                {obj?.unit == "cm" && <Image source={Appimg.circleCheck} style={{ height: "100%", width: "100%" }} />}
                            </View>
                            <Text style={[Commonstyles(Appcolor).mediumText14, { marginLeft: 10 }]}>Centimeters</Text>
                        </Pressable>
                        {warning && <Text style={[Commonstyles(Appcolor).mediumText10, { color: "red", marginLeft: 10, marginTop: 16 }]}>{warning}</Text>}
                        <Btn title={"Create"} twhite styleMain={{ alignSelf: "center", marginTop: 26, marginBottom: isFocused ? 60 : 0, borderRadius: 8 }} onPress={() => { onPressCreate() }} />
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default AddMeasureMentModal

const styles = StyleSheet.create({})