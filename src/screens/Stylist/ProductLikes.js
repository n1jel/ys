import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import FastImage from 'react-native-fast-image'
import { useTheme } from '@react-navigation/native'
import Commonstyles from '../../constants/Commonstyles'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { GetCollectionDetail } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/load'
import { fileUrl } from '../../apimanager/httpmanager'
import MediaDisplay from '../../components/MediaDisplay'

const ProductLikes = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const { Appcolor } = useTheme();
    const [allMedia, setAllMedia] = useState([])
    const [collectionName, setCollectionName] = useState("")
    const limit = 10
    const [mode, setMode] = useState(0)
    const [initialRenderIndex, setInitialRenderIndex] = useState(0)

    useEffect(() => {
        setTimeout(() => {
            getAllMedia(route?.params?.item?._id)
        }, 400);
    }, [route?.params?.item])

    const getAllMedia = async (id) => {
        try {
            dispatch(setLoading(true))
            let res = await GetCollectionDetail({ collection_id: id, page: 1, limit })
            console.log(res);
            if (res?.data?.status) {
                setCollectionName(res?.data?.data?.name)
                let temp = res?.data?.data?.media_data
                setAllMedia(temp)
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header showBack={true} onBackPress={() => { mode == 1 ? setMode(0) : navigation.goBack() }} title={collectionName} />
            {mode == 0 ? <FlatList
                data={allMedia}
                numColumns={2}
                contentContainerStyle={{ marginVertical: 18, marginHorizontal: 16 }}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item, index }) => {
                    return <_renderItem item={item} index={index}
                        onPressLike={() => {
                            if (item?.like_data?.length > 0) {
                                navigation.navigate("LikedList", { id: item?._id })
                            } else {
                                showToast("No likes in this product.")
                            }
                        }}
                        onPress={() => {
                            setMode(1)
                            setInitialRenderIndex(index)
                            return
                            if (item?.like_data?.length > 0) {
                                navigation.navigate("LikedList", { id: item?._id })
                            } else {
                                showToast("No likes in this product.")
                            }
                        }}
                    />
                }}
            />
                :
                <>
                    <VerticalView list={allMedia} initialRenderIndex={initialRenderIndex} onPressLike={(item) => {
                        if (item?.like_data?.length > 0) {
                            navigation.navigate("LikedList", { id: item?._id })
                        } else {
                            showToast("No likes in this product.")
                        }
                    }} />
                </>
            }
        </ImageBackground>
    )
}

export default ProductLikes

const styles = StyleSheet.create({})

const _renderItem = ({ item, index, onPress, onPressLike }) => {
    const { Appcolor } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            style={{ backgroundColor: Appcolor.white, borderRadius: 10, marginBottom: 16, padding: 8, }}>
            <MediaDisplay
                media={item?.gallery_data}
                styleVideo={{ height: 280, width: 190, maxWidth: widthPercentageToDP(41), borderRadius: 10 }}
                styleImage={{ height: 280, width: 190, maxWidth: widthPercentageToDP(41), borderRadius: 10 }}
            />
            <Pressable onPress={onPressLike} style={[Commonstyles(Appcolor).row, { marginTop: 8 }]}>
                <Image source={Appimg.like} style={{ height: 24, width: 24, marginRight: 8, tintColor: "red", resizeMode: "contain" }} />
                <Text style={[Commonstyles(Appcolor).mediumText12]}>{item?.like_data[0]?.total_likes || 0} {item?.like_data[0]?.total_likes == 1 ? "Like" : "Likes"}</Text>
            </Pressable>
        </Pressable>
    )
}
const VerticalView = ({ list, onPressLike, initialRenderIndex }) => {
    const { Appcolor } = useTheme();

    return (
        <FlatList
            data={list}
            initialScrollIndex={initialRenderIndex}
            getItemLayout={(data, index) => { return { length: heightPercentageToDP(65), index, offset: heightPercentageToDP(65) * index } }}
            renderItem={({ item, index }) => {
                return (
                    <Pressable
                        // onPress={onPress}
                        style={{ backgroundColor: Appcolor.modal, borderRadius: 0, marginBottom: 16, paddingVertical: 8, }}>
                        <MediaDisplay
                            resizeimage={"contain"}
                            media={item?.gallery_data}
                            styleVideo={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0 }}
                            styleImage={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0 }}
                        />
                        <Pressable onPress={() => onPressLike(item)} style={[Commonstyles(Appcolor).row, { marginTop: 8, paddingHorizontal: 16 }]}>
                            <Image source={Appimg.like} style={{ height: 24, width: 24, marginRight: 8, tintColor: "red", resizeMode: "contain" }} />
                            <Text style={[Commonstyles(Appcolor).mediumText12]}>{item?.like_data[0]?.total_likes || 0} {item?.like_data[0]?.total_likes == 1 ? "Like" : "Likes"}</Text>
                        </Pressable>
                    </Pressable>
                )
            }}
        />
    )
}