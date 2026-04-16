import { ActivityIndicator, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../components/Header'
import Appimg from '../../constants/Appimg'
import { useTheme } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { get_my_gallery_collection, updateCollectionApi } from '../../apimanager/httpServices'
import MasonryList from '@react-native-seoul/masonry-list';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { fileUrl } from '../../apimanager/httpmanager'
import FastImage from 'react-native-fast-image'
import Btn from '../../components/Btn'
import en from '../../translation'
import { setLoading } from '../../redux/load'
import showToast from '../../CustomToast'

const EditCollectionGallery = ({ navigation, route }) => {
    const { Appcolor } = useTheme();
    const dispatch = useDispatch();

    const [allMedia, setAllMedia] = useState([])
    const [newMedia, setNewMedia] = useState([])
    const [olderMedia, setOlderMedia] = useState([])//removed or dis-selected or unselected older medias
    const [collectionId, setCollectionId] = useState("")
    const [collectionData, setCollectionData] = useState(null)
    const [selectedMedia, setSelectedMedia] = useState([])
    const [coverImg, setCoverImg] = useState("")
    const [fetching, setFetching] = useState(false)
    const [page, setPage] = useState(0)
    const [totalpage, setTotalpage] = useState(0)
    const limit = 20

    useEffect(() => {
        if (route?.params) {
            if (route?.params?.displayVal != "public") {
                setCollectionData({
                    name: route?.params?.collectionName,
                    description: route?.params?.collectionAbout,
                    display_type: route?.params?.displayVal,
                    display_to: route?.params?.tagged,
                    collection_id: route?.params?.collectionId
                })
            } else {
                setCollectionData({
                    name: route?.params?.collectionName,
                    description: route?.params?.collectionAbout,
                    display_type: route?.params?.displayVal,
                    collection_id: route?.params?.collectionId
                })
            }
            if (route?.params?.collectionId) {
                setCollectionId(route?.params?.collectionId)
            }
        }
    }, [route?.params])
    useEffect(() => {
        if (collectionId) {
            setTimeout(() => {
                getMyGallery(collectionId)
            }, 400);
        }
    }, [collectionId])

    const getMyGallery = async (cid) => {
        console.log("i am getting gallery ")
        if (!cid) {
            console.log("i am getting returned")
            return
        }
        let data = { limit, page: 1, cid }
        try {
            dispatch(setLoading(true))
            let res = await get_my_gallery_collection(data)
            console.log(res, "here is my collection gallery")
            if (res?.data?.status) {
                setPage(res?.data?.other?.current_page)
                setTotalpage(res?.data?.other?.total_page)
                setAllMedia(res?.data?.data)
            } else {
            }
        } catch (e) {
            console.log(e, "edit collection gallery");
        } finally {
            dispatch(setLoading(false))
        }
    }
    const getMoreGallery = async (page) => {
        let data = { limit, page, cid: collectionId }
        try {
            setFetching(true)
            let res = await get_my_gallery_collection(data)
            if (res?.data?.status) {
                let temp = [...allMedia]
                temp = temp?.concat([...res?.data?.data])
                setAllMedia(temp)
                setPage(res?.data?.other?.current_page)
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
    const updateCollection = async () => {
        if (selectedMedia?.length == 0) {
            showToast("No images selected.")
            return
        }
        const allPropertiesHaveValues = Object.keys(collectionData).every(key => collectionData[key] !== undefined);
        let cData = {}
        if (allPropertiesHaveValues) {
            cData = { ...collectionData }
        } else {
            cData = { collection_id: collectionId }
        }
        try {
            dispatch(setLoading(true))
            let res = await updateCollectionApi({
                ...cData,
                mediaArray: selectedMedia,
                // deletedMediaArray: olderMedia,
                // cover_image_id: coverImg 
            })
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
            <Header title={`Edit Images (${selectedMedia?.length ?? 0})`} showBack onBackPress={() => navigation?.goBack()} />
            <MasonryList
                data={allMedia}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ marginTop: 10, paddingBottom: heightPercentageToDP(18) }}
                numColumns={3}
                renderItem={({ item, index }) => {
                    return (
                        <ImgBlock item={item} index={index}
                            coverId={coverImg}
                            selectedArr={selectedMedia}
                            selectMedia={(data) => {
                                updateSelction(data)
                            }}
                            actionOldMedia={(data) => {
                                // updateOlderMedia(data)
                            }}
                        />
                    )
                }}
                onEndReached={() => {
                    if (page < totalpage) {
                        getMoreGallery(page + 1)
                    }
                }}
            />
            {fetching && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
            <Btn title={en?.update} twhite styleMain={{ position: "absolute", bottom: heightPercentageToDP(8), alignSelf: "center" }}
                onPress={() => { updateCollection() }}
            />
        </ImageBackground>
    )
}

export default EditCollectionGallery

const styles = StyleSheet.create({})

const ImgBlock = ({ item, index, selectMedia, selectedArr, coverId, actionOldMedia }) => {
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
            style={{ marginTop: widthPercentageToDP(4), marginLeft: widthPercentageToDP(4), }}
            onPress={() => {
                if (coverId == item?._id) {
                    return
                }
                if (item?.is_selected == 1) {
                    // actionOldMedia(item?._id)
                    return
                } else {
                    selectMedia(item?._id)
                }
            }}
        >
            {(coverId == item?._id) && <View style={{ position: "absolute", left: 0, height: 18, width: 18, zIndex: 10, backgroundColor: Appcolor.txt, justifyContent: "center", alignItems: "center", borderRadius: 18 }} ><Image source={require("../../assets/pin.png")} style={{ height: "66%", width: "66%" }} /></View>}
            {/* <FastImage source={item?.media_name ? { uri: fileUrl + item?.media_name } : require("../../assets/logoo.png")} style={{ width: widthPercentageToDP(29), height: widthPercentageToDP(29), borderRadius: 4, opacity: isSelected ? 0.7 : 1 }} /> */}
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
            {item?.is_selected == 1 && <Image source={Appimg.done} style={{ height: 20, width: 20, position: "absolute", left: 0, zIndex: 10, top: 0 }} />}
        </Pressable>
    )
}