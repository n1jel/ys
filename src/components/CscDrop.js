import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import Appcolor from '../constants/Appcolor';
import Commonstyles from '../constants/Commonstyles';
import { RFValue } from 'react-native-responsive-fontsize';
import Appfonts from '../constants/Appfonts';
import FastImage from 'react-native-fast-image';
import Appimg from '../constants/Appimg';
import { useTheme } from '@react-navigation/native';

const CscDrop = ({ data, val, setVal, place, label, styleMain }) => {
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    useEffect(() => {
        // if (val) {
        setValue(val)
        // }
    }, [val])
    const { Appcolor } = useTheme()

    return (
        <View style={[{ marginHorizontal: 18 }, styleMain]}>
            {label && <Text style={[Commonstyles(Appcolor).mediumText10, { marginBottom: 8 }]}>{label}</Text>}
            <Dropdown
                style={[styles.dropdown, { borderColor: Appcolor.primary, backgroundColor: Appcolor.white }]}
                placeholderStyle={[styles.placeholderStyle, { color: Appcolor.txt }]}
                selectedTextStyle={[styles.selectedTextStyle, { color: Appcolor.txt }]}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                containerStyle={{ borderWidth: 0.6, borderColor: Appcolor.primary }}
                data={data}
                maxHeight={300}
                labelField="name"
                valueField="name"
                search={true}
                searchPlaceholder="Search..."
                searchField={"name"}
                placeholder={place ? place : 'Select item'}
                value={value}
                autoScroll={false}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.name);
                    setVal(item)
                    setIsFocus(false);
                }}
                renderItem={(data) => {
                    return (
                        <View style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: data?.value == value ? Appcolor.whiteop : Appcolor.white }}>
                            <Text style={{ color: Appcolor.txt, fontSize: 16, fontFamily: Appfonts.regular }}>{data?.name}</Text>
                        </View>
                    )
                }}
                renderRightIcon={() => (
                    <FastImage source={Appimg?.down} style={styles.icon} resizeMode="contain" />
                )}
            />
        </View>
    )
}

export default CscDrop;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,

    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 4,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5, height: 14, width: 14
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: RFValue(12), fontFamily: Appfonts.regular,
    },
    selectedTextStyle: {
        fontSize: RFValue(12), fontFamily: Appfonts.regular,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        backgroundColor: Appcolor.lessDark,
        color: Appcolor.white
    },
})