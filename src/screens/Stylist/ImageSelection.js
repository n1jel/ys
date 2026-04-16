import { ActivityIndicator, Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { createCollectionApi, get_my_gallery } from '../../apimanager/httpServices'
import { useTheme } from '@react-navigation/native';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import MasonryList from '@react-native-seoul/masonry-list';
import Btn from '../../components/Btn';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import FastImage from 'react-native-fast-image';
import { fileUrl } from '../../apimanager/httpmanager';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/load';
import showToast from '../../CustomToast';

const ImageSelection = ({ navigation, route }) => {
    const { Appcolor } = useTheme();
    const dispatch = useDispatch();

    const [allMedia, setAllMedia] = useState([])
    const [collectionData, setCollectionData] = useState(null)
    const [selectedMedia, setSelectedMedia] = useState([])
    const [fetching, setFetching] = useState(false)
    const [page, setPage] = useState(0)
    const [totalpage, setTotalpage] = useState(0)
    const limit = 20

    useEffect(() => {
        if (route?.params) {
            getMyGallery()
            if (route?.params?.displayVal != "public") {
                setCollectionData({
                    name: route?.params?.collectionName,
                    description: route?.params?.collectionAbout,
                    display_type: route?.params?.displayVal,
                    display_to: route?.params?.tagged
                })
            } else {
                setCollectionData({
                    name: route?.params?.collectionName,
                    description: route?.params?.collectionAbout,
                    display_type: route?.params?.displayVal
                })
            }
        }
    }, [route?.params])

    const getMyGallery = async (page = 1) => {
        let data = { limit, page }
        try {
            setFetching(true)
            let res = await get_my_gallery(data)
            if (res?.data?.status) {
                setPage(res?.data?.other?.current_page)
                setTotalpage(res?.data?.other?.total_page)
                if (page == 1) {
                    setAllMedia(res?.data?.data)
                } else {
                    let temp = [...allMedia]?.concat(res?.data?.data)
                    setAllMedia(temp)
                }
            }
        } catch (e) {
        } finally {
            setFetching(false)
        }
    }
    const updateSelction = useCallback((item) => {
        let temp = [...selectedMedia]
        if (selectedMedia?.includes(item)) {
            temp = temp?.filter(x => x != item)
        } else {
            temp.push(item)
        }
        setSelectedMedia(temp)
    }, [selectedMedia])
    const uploadCollection = async () => {
        if (!collectionData) {
            return
        }
        if (selectedMedia?.length == 0) {
            showToast("No images selected.")
            return
        }
        try {
            dispatch(setLoading(true))
            let res = await createCollectionApi({ ...collectionData, mediaArray: selectedMedia })
            if (res?.data?.status) {
                navigation?.navigate("BottomTabS")
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={Appimg.darkbg} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={`Select Images (${selectedMedia?.length ?? 0})`} showBack={true} onBackPress={() => navigation?.goBack()} />
            <MasonryList
                data={allMedia}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ marginTop: 10, paddingBottom: heightPercentageToDP(18) }}
                numColumns={3}
                renderItem={({ item, index }) => {
                    return (
                        <ImgBlock item={item} index={index}
                            selectedArr={selectedMedia}
                            selectMedia={(data) => {
                                updateSelction(data)
                            }}
                        />
                    )
                }}
                onEndReached={() => {
                    if (page < totalpage) {
                        getMyGallery(page + 1)
                    }
                }}
            />
            {fetching && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
            <Btn title={"Post Collection"} twhite styleMain={{ position: "absolute", bottom: heightPercentageToDP(8), alignSelf: "center" }}
                onPress={() => {
                    uploadCollection()
                }}
            />
        </ImageBackground>
    )
}

export default ImageSelection

const styles = StyleSheet.create({})

const ImgBlock = ({ item, index, selectMedia, selectedArr }) => {
    const { Appcolor } = useTheme();
    const [isSelected, setIsSelected] = useState(false)

    useEffect(() => {
        if (selectedArr?.includes(item?._id)) {
            setIsSelected(true)
        } else {
            setIsSelected(false)
        }
    }, [item, selectedArr])

    return (
        <Pressable
            style={{ marginTop: widthPercentageToDP(4), marginLeft: widthPercentageToDP(4) }}
            onPress={() => { selectMedia(item?._id) }}
        >
            {
                item?.media_type == "video" ?
                    <View style={{ justifyContent: "center", alignItems: "center", opacity: isSelected ? 0.7 : 1 }}>
                        <Image source={Appimg.play} style={{ height: 40, width: 40, position: "absolute", zIndex: 10 }} />
                        <Image source={item?.thumbnail ? { uri: item?.thumbnail } : Appimg.logo} style={{ width: widthPercentageToDP(29), height: widthPercentageToDP(29), borderRadius: 4 }} />
                    </View>
                    :
                    <FastImage source={item?.media_name ? { uri: fileUrl + item?.media_name } : Appimg.logo} style={{ width: widthPercentageToDP(29), height: widthPercentageToDP(29), borderRadius: 4, opacity: isSelected ? 0.7 : 1 }} />
            }
            {isSelected &&
                <View style={{ backgroundColor: Appcolor.yellow, height: 24, width: 24, borderRadius: 24, justifyContent: "center", alignItems: "center", position: "absolute", bottom: 0, right: 0 }}>
                    <Image source={require("../../assets/read.png")} style={{ height: "46%", width: "70%", tintColor: Appcolor.txt }} />
                </View>
            }
        </Pressable>
    )
}