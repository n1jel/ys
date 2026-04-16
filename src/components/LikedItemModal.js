import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Appimg from '../constants/Appimg'
import Commonstyles from '../constants/Commonstyles'
import en from '../translation'
import { fileUrl } from '../apimanager/httpmanager'
import { useTheme } from '@react-navigation/native'
import Video from 'react-native-video';
import Appfonts from '../constants/Appfonts'
import LinkBlock from './LinkBlock'
import Pinchable from 'react-native-pinchable';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import ImageZoom from 'react-native-image-pan-zoom'

const LikedItemModal = ({ vis, onPressOut, item, onPressLike, onPressMessage, mainitem, like, message, stylistDetail }) => {
    const { Appcolor } = useTheme()

    if (item && JSON.stringify(item) != '{}') {
        return (
            <Modal visible={vis} transparent={true}>
                <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                    <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 10, borderRadius: 6 }}>
                        <View style={{ height: 420 }}>
                            {
                                item?.media_type == 'video' ?
                                    <Video
                                        source={{ uri: fileUrl + item?.media_name }} style={{ height: 420, }}
                                        controls={true}
                                        resizeMode={'contain'}
                                    />
                                    :
                                    <ImageZoom
                                        cropWidth={widthPercentageToDP(86)}
                                        cropHeight={widthPercentageToDP(100)}
                                        imageWidth={widthPercentageToDP(80)}
                                        imageHeight={widthPercentageToDP(70)}
                                    >
                                        <FastImage
                                            resizeMode='contain'
                                            source={{ uri: fileUrl + item?.media_name }} style={{ height: "100%" }}
                                        />
                                    </ImageZoom>
                            }
                        </View>
                        <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 14, marginTop: 10 }]}>{stylistDetail?.full_name}</Text>
                        <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 12, marginTop: 6 }]}>{mainitem?.name}</Text>
                        <Text style={[Commonstyles(Appcolor).regular12]}>{mainitem?.description}</Text>
                        <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", marginTop: 10 }]}>
                            {
                                message &&
                                <Pressable onPress={onPressMessage} style={[Commonstyles(Appcolor).row]}>
                                    <FastImage source={Appimg.messagef} style={{ height: 20, width: 20 }} />
                                    <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, marginLeft: 6 }]}>{en?.message}</Text>
                                </Pressable>
                            }

                            <Pressable onPress={() => onPressLike(item)}>
                                <Image source={item?.like_data?.length > 0 || like ? Appimg.like : Appimg.likeempty} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                            </Pressable>
                        </View>
                        <LinkBlock styleMain={{ alignSelf: "flex-end" }} link={item?.link} />
                    </Pressable>
                </Pressable>
            </Modal>
        )
    }

}

export default LikedItemModal

const styles = StyleSheet.create({})

export const OrdersModal = (props) => {
    const { Appcolor } = useTheme()

    const { vis, onPressOut, item } = props
    const media_data = item?.media_data?.[0]
    const collection_data = item?.collection_data?.[0]

    return (
        <Modal transparent visible={vis}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", backgroundColor: Appcolor.white, padding: 10, borderRadius: 6 }}>
                    <View style={{ height: 420 }}>
                        {
                            media_data?.media_type == 'video' ?
                                <Video
                                    source={{ uri: fileUrl + media_data?.media_name }} style={{ height: 420, }}
                                    controls={true}
                                    resizeMode={'contain'}
                                />
                                :
                                <ImageZoom
                                    cropWidth={widthPercentageToDP(86)}
                                    cropHeight={widthPercentageToDP(100)}
                                    imageWidth={widthPercentageToDP(80)}
                                    imageHeight={widthPercentageToDP(70)}
                                >
                                    <FastImage
                                        resizeMode='contain'
                                        source={{ uri: fileUrl + media_data?.media_name }} style={{ height: "100%" }}
                                    />
                                </ImageZoom>
                        }
                    </View>
                    <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 14, marginTop: 10 }]}>{collection_data?.name}</Text>
                    <Text style={[Commonstyles(Appcolor).semiBold26, { fontSize: 12, marginTop: 6 }]}>{collection_data?.description}</Text>
                    <LinkBlock styleMain={{ alignSelf: "flex-end" }} link={media_data?.link} />
                </Pressable>
            </Pressable>
        </Modal>
    )
}