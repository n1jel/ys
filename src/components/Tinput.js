import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Commonstyles from '../constants/Commonstyles'
import Appcolor from '../constants/Appcolor'
import Appfonts from '../constants/Appfonts'
import Appimg from '../constants/Appimg'
import { useTheme } from '@react-navigation/native'

const Tinput = ({ value, onChangeText, img, secure, tav, multiline, styleMain, place, placespecific, keyboard, styleImg, editable = true, styleInput, textInputProps, credSuggestions, credSelected, placeCol }) => {
    const [focused, setFocused] = useState(false)
    const [sec, setSec] = useState(secure)
    const { Appcolor } = useTheme()
    return (
        <View style={[{ marginHorizontal: 18 }, styleMain]}>
            <Text style={[Commonstyles(Appcolor).mediumText10, { color: Appcolor.txt }]}>{place}</Text>
            <View style={{ flexDirection: "row", backgroundColor: Appcolor.white, borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.primary, marginTop: 8 }}>
                <TextInput
                    placeholder={placespecific ? placespecific : place}
                    placeholderTextColor={placeCol ? placeCol : Appcolor?.txt}
                    value={value}
                    onChangeText={onChangeText}
                    style={[{ width: !img && !secure ? "100%" : "90%", paddingLeft: 16, height: 48, color: 'black' }, Commonstyles(Appcolor).mediumText14, styleInput]}
                    secureTextEntry={sec}
                    onFocus={() => { setFocused(true) }}
                    onBlur={() => { setFocused(false) }}
                    keyboardType={keyboard}
                    autoCapitalize={"none"}
                    editable={editable}
                    multiline={multiline}
                    textAlignVertical={tav}
                    {...textInputProps}
                />
                {
                    secure != true ?
                        <View style={{ width: "10%", justifyContent: "center", alignItems: "center" }}>
                            {img ? <Image source={img} style={[{ height: 14, width: 14, resizeMode: "contain" }, styleImg]} />
                                :
                                <View />
                            }
                        </View>
                        :
                        <TouchableOpacity
                            style={{ width: "10%", justifyContent: "center", alignItems: "center" }}
                            onPress={() => { setSec(!sec) }}
                        >
                            <Image source={!sec ? Appimg?.eye : Appimg?.eyeoff} style={{ height: 14, width: 14, resizeMode: "contain" }} />
                        </TouchableOpacity>
                }
            </View>
            {credSuggestions?.map((i, j) => {
                return (
                    <Pressable key={j} onPress={() => credSelected(i)} style={{ backgroundColor: Appcolor.white, padding: 16, borderRadius: 4, marginTop: 4, borderWidth: 1, borderColor: Appcolor.primary }}>
                        <Text style={{ fontSize: 12, color: Appcolor.txt, fontFamily: Appfonts.medium }}>{i?.email}</Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

export default Tinput

const styles = StyleSheet.create({})