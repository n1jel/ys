import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-native'
import { useTheme } from '@react-navigation/native';
import { fileUrl } from '../apimanager/httpmanager';
import FastImage from 'react-native-fast-image';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import Tinput from './Tinput';
import Btn from './Btn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import VideoThumb from './VideoThumb';
import Appimg from '../constants/Appimg';

const EditClosetC = (props) => {
    const { Appcolor } = useTheme();
    const styles = useStyles(Appcolor)
    const [value, setValue] = useState("")

    useEffect(() => {
        if (props?.data?.caption) {
            setValue(props?.data?.caption)
        }
    }, [props?.data?.caption])

    return (
        <Modal
            visible={props?.visible}
            transparent
            animationType="fade"
        >
            <Pressable onPress={() => props?.close()} style={{ flex: 1, backgroundColor: Appcolor.whiteop, justifyContent: "center", alignItems: "center" }}>
                <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Pressable style={{ width: "90%", backgroundColor: Appcolor.modal, padding: 12, borderRadius: 6 }}>
                        {props?.data?.media_type == "video" ?
                            <View style={{ justifyContent: "center", alignItems: "center" }}>
                                <Image source={Appimg.play} style={{ height: 38, width: 38, position: "absolute", zIndex: 10 }} />
                                <VideoThumb source={props?.data?.media_name} styleMain={{ height: heightPercentageToDP(46), width: "100%", borderRadius: 10 }} />
                            </View>
                            :
                            <FastImage source={{ uri: fileUrl + props?.data?.media_name }} style={{ height: heightPercentageToDP(46), borderRadius: 4 }} />
                        }
                        <Tinput value={value} placeCol={Appcolor.grey} onChangeText={(t) => { setValue(t) }} place={"Caption"} styleMain={{ marginTop: 20 }} />
                        <Btn twhite title={"Save"} styleMain={{ alignSelf: "center", marginTop: 20 }}
                            onPress={() => {
                                props?.onSave(value, props?.data?._id)
                                props?.close()
                            }}
                        />
                    </Pressable>
                </KeyboardAwareScrollView>
            </Pressable>
        </Modal>
    )
}

export default EditClosetC

const useStyles = (Appcolor) => StyleSheet.create({

})