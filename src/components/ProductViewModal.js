import { Dimensions, Modal, Pressable, StyleSheet, } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appcolor from '../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Appimg from '../constants/Appimg'
import BitSwiper from 'react-native-bit-swiper';
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { fileUrl } from '../apimanager/httpmanager'
import ImageZoom from 'react-native-image-pan-zoom';

const ProductViewModal = ({ data, vis, onPressOut }) => {
    const [collection, setCollection] = useState([])

    useEffect(() => {
        if (data) {
            let temp = []
            data.forEach(e => {
                if (e?.status == 1) {
                    temp.push(e)
                }
            });
            setCollection(temp)
        }
    }, [data])
    return (
        <Modal visible={vis} transparent={true}>
            <Pressable style={{ backgroundColor: Appcolor.blackop, flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPressOut}>
                <Pressable style={{ width: "90%", padding: 10, borderRadius: 6, }}>
                    <BitSwiper
                        items={collection}
                        itemWidth={"100%"}
                        inactiveItemScale={0.8}
                        inactiveItemOpacity={0.3}
                        showPaginate={true}
                        paginateDotStyle={{
                            backgroundColor: Appcolor.whiteop,
                            width: 6,
                            height: 6,
                            borderRadius: 6,
                            margin: 2
                        }}
                        paginateActiveDotStyle={{
                            backgroundColor: Appcolor.white,
                            width: 6,
                            height: 6,
                            borderRadius: 6,
                            margin: 2
                        }}
                        paginateStyle={{ backgroundColor: "rgba(68, 68, 68, 1)", position: "absolute", bottom: -8, alignSelf: "center", paddingHorizontal: 8, borderRadius: 2 }}
                        onItemRender={(item, index) => (
                            <Pressable>
                                <ImageZoom
                                    cropWidth={widthPercentageToDP(86)}
                                    cropHeight={widthPercentageToDP(100)}
                                    imageWidth={widthPercentageToDP(80)}
                                    imageHeight={widthPercentageToDP(70)}>
                                    <FastImage source={{ uri: fileUrl + item?.media_name }} style={{ height: widthPercentageToDP(70), width: widthPercentageToDP(80) }} />
                                </ImageZoom>
                            </Pressable>
                        )}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default ProductViewModal

const styles = StyleSheet.create({})