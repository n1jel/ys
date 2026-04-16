import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Appimg from '../constants/Appimg';
import Commonstyles from '../constants/Commonstyles';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const LibraryBlock = ({ onPress }) => {
    const { Appcolor } = useTheme();
    return (
        <Pressable onPress={onPress} style={{ height: heightPercentageToDP(32), width: "92%", alignSelf: "center", backgroundColor: "white", borderRadius: 10, overflow: "hidden", marginVertical: 18 }}>
            <FastImage source={Appimg.ysgallery} style={{ height: "84%", width: "100%", resizeMode: "cover" }} />
            <View style={{ height: "16%", backgroundColor: Appcolor.whiteop, justifyContent: "center" }}>
                <Text style={[Commonstyles(Appcolor).mediumText14, { fontSize: RFValue(13), marginLeft: 8 }]}>Your Season Gallery</Text>
            </View>
        </Pressable>
    )
}

export default LibraryBlock

const styles = StyleSheet.create({})