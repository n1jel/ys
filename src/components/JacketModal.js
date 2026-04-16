import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Appimg from '../constants/Appimg'
import { fileUrl } from '../apimanager/httpmanager'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import ImageZoom from 'react-native-image-pan-zoom'
import Video from 'react-native-video';
import Btn from './Btn'
import Tinput from './Tinput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const JacketModal = ({ vis, onPressOut, data, mediaData, mediatype, onPressSave, isMine = false }) => {
    const [caption, setCaption] = useState("")
    const [link, setLink] = useState("")
    useEffect(() => {
        if (mediaData?.caption) {
            setCaption(mediaData?.caption)
        } else {
            setCaption("")
        }
        if (mediaData?.link) {
            console.log(mediaData?.link);
            setLink(mediaData?.link)
        } else {
            setLink("")
        }
    }, [mediaData])
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center", }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", padding: 10, borderRadius: 6, backgroundColor: Appcolor.txt }}>
                    <KeyboardAwareScrollView>
                        {mediatype == 'video' ?
                            <Video
                                style={{ widthPercentageToDP: '100%', height: heightPercentageToDP(50) }}
                                source={{ uri: fileUrl + data }}
                                controls={true}
                                resizeMode={'contain'}
                            />
                            :
                            <FastImage
                                resizeMode='cover'
                                source={{ uri: fileUrl + data }} style={{ height: heightPercentageToDP(50) }}
                            />
                        }
                        {isMine &&
                            <>
                                <Tinput
                                    styleMain={{ alignSelf: 'center' }}
                                    placespecific={"Write a caption"}
                                    placeCol={Appcolor.grey}
                                    value={caption}
                                    onChangeText={(t) => { setCaption(t) }}
                                />
                                <Tinput
                                    styleMain={{ alignSelf: 'center' }}
                                    placeCol={Appcolor.grey}
                                    placespecific={"Add a website Link"}
                                    value={link}
                                    onChangeText={(t) => { setLink(t) }}
                                />
                                <Btn title={"Save"} transparent={Appcolor.whiteop} styleMain={{ width: "50%", height: widthPercentageToDP(12), alignSelf: "center", marginTop: 16 }} twhite onPress={() => { onPressSave(caption, mediaData?._id, link); setCaption(""); setLink("") }} />
                            </>
                        }
                        {/* <ImageZoom
                                cropWidth={widthPercentageToDP(86)}
                                cropHeight={widthPercentageToDP(100)}
                                imageWidth={widthPercentageToDP(80)}
                                imageHeight={widthPercentageToDP(80)}>
                                <FastImage
                                    resizeMode='cover'
                                    source={{ uri: fileUrl + data }} style={{ height: widthPercentageToDP(80) }}
                                />
                            </ImageZoom> */}
                    </KeyboardAwareScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default JacketModal

const styles = StyleSheet.create({})