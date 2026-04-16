import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../apimanager/httpmanager'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appimg from '../constants/Appimg'

const GalleryImageViewer = (props) => {
    return (
        <Modal
            visible={props?.visible}
            transparent={true}
            animationType='fade'
        >
            <Pressable onPress={() => props?.closeModal()} style={{ backgroundColor: "rgba(0,0,0,0.7)", flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable onPress={() => props?.closeModal()} style={{ position: "absolute", zIndex: 10, top: heightPercentageToDP(10), left: 18 }}><Image source={Appimg?.back} style={{ height: 26, width: 26 }} /></Pressable>
                <Pressable>
                    <FastImage source={{ uri: props?.media }} style={{ height: widthPercentageToDP(90), width: widthPercentageToDP(90) }} resizeMode='contain' />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default GalleryImageViewer

const styles = StyleSheet.create({})