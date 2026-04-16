import { Linking, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import Appfonts from '../constants/Appfonts'

const LinkBlock = ({ link, styleMain }) => {
    const { Appcolor } = useTheme()
    return (
        <View style={styleMain}>
            {link &&
                <Text onPress={() => {
                    let url = link
                    if (!link.startsWith('http://') && !link.startsWith('https://')) {
                        url = `https://${link}`;
                    }
                    Linking.openURL(url);
                }}>
                    <Text style={{ color: Appcolor.yellow, fontSize: 12, textDecorationLine: "underline", fontFamily: Appfonts.mediumItalic }}>
                        Link Here
                    </Text>
                    <Text style={{ textDecorationLine: "none", fontSize: 12, }}> 🔗</Text>
                </Text>
            }
        </View >
    )
}

export default LinkBlock

const styles = StyleSheet.create({})

export const LinkIcon = ({ link, styleMain }) => {
    const { Appcolor } = useTheme()
    if (link) {
        return (
            <View style={[{ position: "absolute", right: 2 }, styleMain]}>
                <Text style={{ fontSize: 16 }}>🔗</Text>
            </View>
        )
    }
}