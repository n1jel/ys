import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appcolor from '../constants/Appcolor'
import { RFValue } from 'react-native-responsive-fontsize'
import Appfonts from '../constants/Appfonts'
import Appimg from '../constants/Appimg'
import { useTheme } from '@react-navigation/native'

const CameraModal = ({ onPressOut, videoPhoto = false, hideVideoOption, visible, onPressCancel, onPressCamera, onPressGallery, onPressvideoCamera, onPressvideoGallery, video, txt }) => {
    const { Appcolor } = useTheme()
    return (
        <Modal transparent={true} visible={visible} style={styles.mainview}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center", }}
                onPress={onPressOut}
            >
                <Pressable style={[styles.modelcontain, { backgroundColor: Appcolor.modal, }]}>
                    <Text style={{ fontFamily: Appfonts.bold, fontSize: RFValue(16), color: Appcolor.txt, textAlign: "center" }}>
                        {txt ? txt : "Add Media"}
                    </Text>
                    <Pressable onPress={onPressCancel} style={{ position: "absolute", right: 8, top: 8 }}>
                        <Image source={Appimg.cancel} style={{ height: 30, width: 30, resizeMode: "contain" }} />
                    </Pressable>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", marginTop: 24, }}>
                        <Pressable style={{ alignItems: "center" }}
                            onPress={onPressCamera}
                        >
                            <Image source={Appimg.cameranew} style={styles.camerapic} />
                            <Text style={{ fontSize: RFValue(10), fontFamily: Appfonts.medium, color: Appcolor.txt, marginTop: 8, }} >
                                Camera
                            </Text>
                        </Pressable>
                        <Pressable style={{ alignItems: "center" }}
                            onPress={onPressGallery}
                        >
                            <Image source={Appimg.gallerynew} style={styles.camerapic} />
                            <Text style={{ fontSize: RFValue(10), fontFamily: Appfonts.medium, color: Appcolor.txt, marginTop: 8, }}>
                                {videoPhoto ? "Photos/Video" : "Photos"}
                            </Text>
                        </Pressable>

                        {!hideVideoOption && <Pressable style={{ alignItems: "center" }}
                            onPress={onPressvideoGallery}
                        >
                            <Image source={Appimg.gallerynew} style={styles.camerapic} />
                            <Text style={{ fontSize: RFValue(10), fontFamily: Appfonts.medium, color: Appcolor.txt, marginTop: 8, }}>
                                Video
                            </Text>
                        </Pressable>}
                    </View>
                </Pressable>
                {
                    video &&
                    <Pressable style={[styles.modelcontain, { backgroundColor: Appcolor.white, borderRadius: 0 }]}>
                        <Text style={{ fontFamily: Appfonts.bold, fontSize: RFValue(16), color: Appcolor.txt, textAlign: "center" }}>
                            Add Video
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", marginTop: 24, }}>
                            <Pressable style={{ alignItems: "center" }}
                                onPress={onPressvideoCamera}
                            >
                                <Image source={Appimg.cameranew} style={styles.camerapic} />
                                <Text style={{ fontSize: RFValue(10), fontFamily: Appfonts.medium, color: Appcolor.txt, marginTop: 8, }} >
                                    Camera
                                </Text>
                            </Pressable>
                            <Pressable style={{ alignItems: "center" }}
                                onPress={onPressvideoGallery}
                            >
                                <Image source={Appimg.gallerynew} style={styles.camerapic} />
                                <Text style={{ fontSize: RFValue(10), fontFamily: Appfonts.medium, color: Appcolor.txt, marginTop: 8, }}>
                                    Gallery
                                </Text>
                            </Pressable>
                        </View>
                    </Pressable>
                }

            </Pressable>
        </Modal>
    )
}

export default CameraModal

const styles = StyleSheet.create({
    mainview: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modelcontain: {
        minHeight: 170,
        width: "90%",

        // borderRadius: 4,
        padding: 8,
    },
    cameracontainer: {
        height: 60,
        width: 60,
        backgroundColor: Appcolor.lightgray,
        borderRadius: widthPercentageToDP(10),
        borderWidth: 1.5,
        borderColor: Appcolor.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    camerapic: { height: 56, width: 56, resizeMode: "contain" },
})