import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Commonstyles from '../constants/Commonstyles'
import Appimg from '../constants/Appimg';
import { fileUrl } from '../apimanager/httpmanager';
import { useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import VideoThumb from './VideoThumb';

const AlbumBlock = ({ item, index, onPress }) => {
    const { Appcolor } = useTheme()

    return (
        <Pressable onPress={onPress} style={[Commonstyles(Appcolor).shadow, { borderRadius: 6, padding: 8, width: "48%", marginLeft: (index + 1) % 2 == 0 ? 10 : 0, backgroundColor: Appcolor.white, marginBottom: 20 }]}>
            <View style={[Commonstyles(Appcolor).row, { marginBottom: 8 }]}>
                <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 12 }]}>{item?.name}</Text>
                <Image source={item?.display_type == "public" ? Appimg.earth : Appimg.lock} style={{ height: 16, width: 16, resizeMode: "contain", marginLeft: 6 }} />
            </View>

            <View>
                {item?.media_data?.length == 0 ?
                    <Image source={Appimg.logo} style={{ height: 140, width: "100%", borderRadius: 6, resizeMode: 'contain' }} />
                    :
                    item?.media_data[0]?.media_type == "video" ?
                        <VideoThumb source={item?.media_data?.[0]?.media_name} styleMain={{ height: 140, width: "100%", borderRadius: 6 }} />
                        :
                        <FastImage source={{ uri: fileUrl + item?.media_data?.[0]?.media_name }} style={{ height: 140, width: "100%", borderRadius: 6 }} />
                }
            </View>
        </Pressable>
    )
}

export default AlbumBlock

const styles = StyleSheet.create({})