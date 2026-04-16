import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import Appcolor from '../constants/Appcolor'
import Appfonts from '../constants/Appfonts'
import { fileUrl } from '../apimanager/httpmanager'
import Appimg from '../constants/Appimg'

const OrderDetailModal = (props) => {
    const { name, description } = (props?.item?.collection_data?.name ? props?.item?.collection_data : props?.item?.collection_data[0])
    const { media_type, media_name } = (props?.item?.media_data?.media_type ? props?.item?.media_data : props?.item?.media_data[0])
    return (
        <Modal transparent={true} visible={props.vis} animationType="fade">
            <Pressable onPress={() => props.closeModal()} style={{ backgroundColor: "rgba(0,0,0,0.8)", flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Pressable style={{ minHeight: 100, width: "90%", backgroundColor: "#292929", padding: 16, borderRadius: 8, borderWidth: 1, borderColor: Appcolor.primary }}>
                    <Text style={styles.boldTxt}>{name}</Text>
                    <Text style={styles.medTxt}>{description}</Text>
                    <View style={{ height: 400, width: "100%", justifyContent: "center", alignItems: "center", marginTop: 12 }}>
                        {media_type != "image" && <FastImage source={Appimg.play} style={{ height: 60, width: 60, position: "absolute", zIndex: 10 }} resizeMode='contain' />}
                        <FastImage source={media_type == "image" ? { uri: fileUrl + media_name } : Appimg.logo} style={{ height: "100%", width: "100%", alignSelf: "center" }} resizeMode='cover' />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default OrderDetailModal

const styles = StyleSheet.create({
    boldTxt: {
        color: Appcolor.white,
        fontSize: 16,
        fontFamily: Appfonts.bold,
    },
    medTxt: {
        color: Appcolor.white,
        fontSize: 14,
        fontFamily: Appfonts.medium,
    },

})