import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useRef } from 'react'
import Appimg from '../constants/Appimg'
import Commonstyles from '../constants/Commonstyles'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Appcolor from '../constants/Appcolor'
import Appfonts from '../constants/Appfonts'
import { useTheme } from '@react-navigation/native'

const Searchbar = ({ value, onChangeText, place, showFilter, showAdd, textInputProps, styleMain, showCancel, onPressBtn, autoFocus }) => {
    const { Appcolor } = useTheme()
    const inputRef = useRef(null)
    React.useEffect(() => {
        if (autoFocus) {
            let timeout = setTimeout(() => {
                inputRef?.current?.focus()
            }, 500);

            return () => {
                clearTimeout(timeout)
            }
        }
    }, [autoFocus])
    return (
        <View style={[Commonstyles(Appcolor).row, { marginHorizontal: 16, justifyContent: "space-between" }, styleMain]}>
            <View style={[Commonstyles(Appcolor).row, Commonstyles(Appcolor).shadow, { backgroundColor: Appcolor.whitecolor, borderRadius: 6, paddingHorizontal: 8, width: showCancel ? widthPercentageToDP(80) : !showFilter ? widthPercentageToDP(92) : widthPercentageToDP(74) }]}>
                <Image source={Appimg.search} style={{ height: 16, width: 16, marginRight: 5 }} />
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={place}
                    style={{ height: widthPercentageToDP(12.2), width: !showFilter ? widthPercentageToDP(84) : widthPercentageToDP(69), fontFamily: Appfonts.regular, fontSize: 14, color: 'black' }}
                    placeholderTextColor="grey"
                    {...textInputProps}
                />
            </View>
            {(showFilter || showAdd || showCancel) && <Pressable onPress={onPressBtn}>
                <Image source={showAdd ? Appimg.addbutton : showCancel ? Appimg.cancel : Appimg.filter} style={{ width: showCancel ? widthPercentageToDP(8) : widthPercentageToDP(12), height: showCancel ? widthPercentageToDP(8) : widthPercentageToDP(12) }} />
            </Pressable>}
        </View>
    )
}

export default Searchbar

const styles = StyleSheet.create({})