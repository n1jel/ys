import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import Commonstyles from '../constants/Commonstyles'

const TabBlock = ({ list, width, onChange, value }) => {
    const { Appcolor } = useTheme()
    const [selected, setSelected] = useState("")

    useEffect(() => {
        setSelected(value)
    }, [value])

    const onSelect = (t) => {
        setSelected(t)
        if (onChange) {
            onChange(t)
        }
    }

    return (
        <View style={{ width: width ?? "100%", height: 40, borderRadius: 20, overflow: "hidden", alignSelf: "center", marginTop: 20, borderWidth: 1, borderColor: Appcolor.grad1 }}>
            <FlatList
                data={list}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    let isSelected = selected == item?.name
                    return (
                        <LinearGradient colors={isSelected ? [Appcolor.grad1, Appcolor.primary] : ["transparent", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, width: (width / (list?.length ?? 1)), height: "100%", alignSelf: "center", borderRadius: 20 }}>
                            <Pressable style={{ width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => {
                                    onSelect(item?.name)
                                }}
                            >
                                <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: !isSelected ? Appcolor.whitecolor : Appcolor.blackcolor }]}>{item?.name}</Text>
                            </Pressable>
                        </LinearGradient>
                    )
                }}
            />
        </View>
    )
}

export default TabBlock

const styles = StyleSheet.create({})