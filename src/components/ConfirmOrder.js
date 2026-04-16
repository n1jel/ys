import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import Btn from './Btn'
import { fileUrl } from '../apimanager/httpmanager'
import { useTheme } from '@react-navigation/native'
import Video from 'react-native-video';
import Appfonts from '../constants/Appfonts'
import ImageZoom from 'react-native-image-pan-zoom'
import { widthPercentageToDP } from 'react-native-responsive-screen'

const ConfirmOrder = ({ vis, onPressOut, onPressDone, item, isClient = false, isParentBrand = false }) => {
    const { Appcolor } = useTheme()
    const [isVideo, setIsVideo] = useState(false)

    useEffect(() => {
        if (item?.imageData) {
            if (item?.imageData?.gallery_data?.media_type == "video") {
                setIsVideo(true)
            } else {
                setIsVideo(false)
            }
        } else {
            setIsVideo(false)
        }
    }, [item])

    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 10, borderRadius: 6 }}>
                    {isVideo ?
                        <VideoComponent media={item?.image} />
                        :
                        <ImageZoom
                            cropWidth={340}
                            cropHeight={420}
                            imageWidth={300}
                            imageHeight={420}
                        >
                            {item?.image?.includes("googleapis") ?
                                <FastImage
                                    source={{ uri: item?.image }} style={{ height: 420 }} resizeMode='contain'
                                />
                                :
                                item?.isLiked ?
                                    <FastImage
                                        source={{ uri: item?.image }} style={{ height: 420 }} resizeMode='contain'
                                    />
                                    :
                                    <FastImage
                                        source={{ uri: item?.image }} style={{ height: 420 }} resizeMode='contain'
                                    />}
                        </ImageZoom>
                    }
                    {(!item?.image?.includes("googleapis")) && <Text style={{ color: Appcolor.txt, fontSize: 16, fontFamily: Appfonts.bold }}>{item?.collectionitem?.name}</Text>}
                    {(!item?.image?.includes("googleapis")) && <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>{item?.collectionitem?.description}</Text>}
                    {(!item?.image?.includes("googleapis") && !isClient && !isParentBrand && item?.isConfirmed == 0) && <Btn transparent={Appcolor.primary} title={"Confirm Order"} twhite styleMain={{ alignSelf: "center", marginTop: 24, marginBottom: 14 }} onPress={onPressDone} />}
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default ConfirmOrder

const styles = StyleSheet.create({})

const VideoComponent = ({ media }) => {
    return (
        <Video
            paused={false}
            source={{ uri: media }} style={{ height: 420, width: "90%" }}
            controls={true}
            resizeMode={'contain'}
        />
    )
}