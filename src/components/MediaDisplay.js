import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { fileUrl } from '../apimanager/httpmanager'
import Appimg from '../constants/Appimg'
import { useNavigation, useTheme } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Pinchable from 'react-native-pinchable';
import VideoThumb from './VideoThumb'

const MediaDisplay = ({ media, styleVideo, styleImage, resizeimage }) => {
    const { Appcolor } = useTheme();
    const navigation = useNavigation();
    const { media_type, media_name, thumbnail } = media
    return (
        <>
            {(media_type == 'video' && !thumbnail) ?
                <View style={{ justifyContent: "center", alignItems: "center", borderRadius: 10, overflow: "hidden", }}>
                    <VideoThumb source={media_name} styleMain={[styles.videoDimension, styleVideo]} resizeMode={"stretch"} />
                    {/* <Image source={Appimg.logo} style={[styles.videoDimension, styleVideo]} resizeMode={"stretch"} /> */}
                    <Pressable onPress={() => navigation?.navigate("VideoPlayer", { media: media_name })} style={{ position: "absolute" }}>
                        <Image source={Appimg.play} style={{ height: 50, width: 50, tintColor: Appcolor.txt }} />
                    </Pressable>
                </View>
                :
                media_type == 'video' ?
                    <View style={{ justifyContent: "center", alignItems: "center", borderRadius: 10, overflow: "hidden", }}>
                        <FastImage source={{ uri: fileUrl + thumbnail }} style={[styles.viewDimension, styleImage]} resizeMode={"cover"} />
                        <Pressable onPress={() => navigation?.navigate("VideoPlayer", { media: media_name })} style={{ position: "absolute" }}>
                            <Image source={Appimg.play} style={{ height: 50, width: 50, tintColor: Appcolor.txt }} />
                        </Pressable>
                    </View>
                    :
                    <Pinchable>
                        <FastImage source={{ uri: fileUrl + (media_type == "image" ? media_name : thumbnail) }} style={[styles.viewDimension, styleImage]} resizeMode={resizeimage ? resizeimage : "cover"} />
                    </Pinchable>
            }
        </>
    )
}

export default MediaDisplay

const styles = StyleSheet.create({
    videoDimension: {
        height: 280,
        width: widthPercentageToDP(48),
    },
    viewDimension: {
        height: 280,
        alignSelf: 'stretch',
        width: widthPercentageToDP(48),
        borderRadius: 10,
        overflow: "hidden",
    },
})
