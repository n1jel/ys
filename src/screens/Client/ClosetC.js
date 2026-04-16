import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native'
import Header from '../../components/Header'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import FastImage from 'react-native-fast-image'
import Commonstyles from '../../constants/Commonstyles'
import moment from 'moment'
import Appfonts from '../../constants/Appfonts'
import Pinchable from 'react-native-pinchable';
import CameraModal from '../../components/CameraModal'
import { clientCloset, deleteCloset, updateCloset } from '../../apimanager/httpServices'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import showToast from '../../CustomToast'
import { uploadToS3 } from '../../utils/uploadTos3'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/load'
import { fileUrl } from '../../apimanager/httpmanager'
import EditClosetC from '../../components/EditClosetC'
import VideoThumb from '../../components/VideoThumb'

const ClosetC = ({ navigation }) => {
    const dispatch = useDispatch();
    const { Appcolor } = useTheme();
    const styles = useStyles(Appcolor)
    const [mode, setMode] = useState(0)
    const [initialRenderIndex, setInitialRenderIndex] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [closetList, setClosetList] = useState([])
    const limit = 16
    const [pagination, setPagination] = useState({ current_page: 0, total_page: 0 })
    const [gettingMore, setGettingMore] = useState(false)

    useFocusEffect(useCallback(() => {
        getList()
    }, []))

    const onPressCamera = async () => {
        const picker = await launchCamera({ mediaType: "mixed" });
        if (picker?.didCancel) {
            return
        }
        if (picker?.assets?.length > 0) {
            // mediaFilter(picker?.assets)
            uploadImages(picker?.assets)
        }
    }
    const onPressGallery = async () => {
        const picker = await launchImageLibrary({ mediaType: "mixed", selectionLimit: 10 });
        if (picker?.didCancel) {
            return
        }
        if (picker?.assets?.length > 0) {
            // mediaFilter(picker?.assets)
            uploadImages(picker?.assets)
        }
    }
    // const mediaFilter = async (media) => {
    //     let res = media?.reduce((acc, item) => {
    //         if (item?.type?.includes("video")) {
    //             acc.video.push(item);
    //         } else {
    //             acc.image.push(item);
    //         }
    //         return acc;
    //     }, { video: [], image: [] })
    //     console.log(res);
    // }
    const uploadImages = async (images) => {
        setShowModal(false)
        try {
            dispatch(setLoading(true))
            let temp = []
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                let res = await uploadToS3(img?.uri, img?.fileName, img?.type)
                if (res?.Key) {
                    temp.push({ url: res?.Key, media_type: img?.type?.split("/")?.[0] })
                }
            }
            dispatch(setLoading(false))
            navigation?.navigate("UploadScreen", { images: temp })
        } catch (e) {
            console.error(e);
        }
    }
    const queryBuilder = (pg) => {
        return `?page=${pg}&limit=${limit}`
    }
    const getList = async () => {
        try {
            dispatch(setLoading(true))
            let query = queryBuilder(1)
            let res = await clientCloset(query)
            if (res?.data?.status) {
                setClosetList(res?.data?.data)
                let { current_page, total_page } = res?.data?.other
                setPagination({ current_page, total_page })
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreData = () => {
        let { current_page, total_page } = pagination
        if (current_page < total_page && !gettingMore) {
            getMoreData(current_page + 1)
        }
    }
    const getMoreData = async (pg) => {
        try {
            setGettingMore(true)
            let query = queryBuilder(pg)
            let res = await clientCloset(query)
            if (res?.data?.status) {
                let temp = [...closetList]?.concat(res?.data?.data)
                setClosetList(temp)
                let { current_page, total_page } = res?.data?.other
                setPagination({ current_page, total_page })
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGettingMore(false)
        }
    }
    const deleteProd = async (id, index) => {
        try {
            dispatch(setLoading(true))
            let temp = { closet_ids: [id] }
            let res = await deleteCloset(temp)
            if (res?.data?.status) {
                showToast(res?.data?.message)
                let temp = [...closetList]
                temp.splice(index, 1)
                setClosetList(temp)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const updateData = async (closet_id, caption) => {
        try {
            let temp = { closet_id, caption }
            dispatch(setLoading(true))
            let res = await updateCloset(temp)
            if (res?.data?.status) {
                showToast(res?.data?.message)
                let temp = [...closetList]
                let ind = temp.findIndex(x => x?._id == closet_id)
                let d = temp[ind]
                temp.splice(ind, 1, { ...d, caption })
                setClosetList(temp)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={Appimg.darkbg1} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header showBack={true}
                title={"My Closet"}
                onBackPress={() => {
                    if (mode == 1) {
                        setMode(0)
                        return
                    }
                    navigation.goBack()
                }}
            />
            <CameraModal visible={showModal} videoPhoto={true} hideVideoOption={true} onPressOut={() => { setShowModal(false) }} onPressCancel={() => setShowModal(false)}
                onPressCamera={() => { onPressCamera() }}
                onPressGallery={() => { onPressGallery() }}
            />
            {
                mode == 0 ?
                    <>
                        <HorizontalMode closetList={closetList} setMode={setMode} setInitialRenderIndex={setInitialRenderIndex}
                            onEndReached={() => {
                                checkForMoreData()
                            }}
                            ondelete={(item, index) => { Alert.alert("Delete", "Are you sure?", [{ text: "Yes", onPress: () => deleteProd(item?._id, index) }, { text: "No", style: "cancel" }]) }}
                            onSave={(cap, id) => {
                                updateData(id, cap)
                            }}
                        />
                        <TouchableOpacity
                            style={[styles.addBtn, { backgroundColor: Appcolor.white, }]}
                            onPress={() => {
                                setShowModal(true)
                            }}
                        >
                            <FastImage source={Appimg?.plus} style={{ height: "100%", width: "100%" }} />
                        </TouchableOpacity>
                    </>
                    :
                    <VerticalMode closetList={closetList} initialRenderIndex={initialRenderIndex}
                        onEndReached={() => {
                            checkForMoreData()
                        }}
                    />
            }
            {gettingMore && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
        </ImageBackground>
    )
}

export default ClosetC

const useStyles = (Appcolor) => StyleSheet.create({
    editBtns: { backgroundColor: Appcolor.txt, height: 24, width: 24, justifyContent: "center", alignItems: 'center', borderRadius: 20 },
    addBtn: {
        height: 46,
        width: 46,
        position: "absolute",
        borderRadius: 60,
        zIndex: 1,
        bottom: 16,
        right: 10,
    },
})

const HorizontalMode = ({ closetList, setMode, onEndReached, ondelete, setInitialRenderIndex, onSave }) => {
    const { Appcolor } = useTheme()
    const styles = useStyles(Appcolor)

    const [vis, setVis] = useState(false)
    const [data, setData] = useState(null)

    const renderItem = ({ item, index }) => {
        return <ClosetH
            item={item} index={index}
            onpressdelete={() => {
                ondelete(item, index)
            }}
            onPress={() => {
                setMode(1)
                setInitialRenderIndex(index)
            }}
            onPressEdit={() => {
                setData(item)
                setVis(true)
            }}
        />
    }
    return (
        <>
            <EditClosetC visible={vis} data={data} onSave={onSave} close={() => { setVis(false) }} />
            <FlatList
                showsVerticalScrollIndicator={false}
                numColumns={2}
                data={closetList}
                renderItem={renderItem}
                ListFooterComponent={() => <View style={{ height: 100 }} />}
                onEndReached={onEndReached}
            />
        </>
    )
}
const VerticalMode = ({ closetList, onEndReached, initialRenderIndex }) => {
    const renderItem = ({ item, index }) => {
        return <ClosetV
            item={item} index={index}
            onPress={() => {
                console.log("a");
            }}
        />
    }
    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            data={closetList}
            renderItem={renderItem}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
            onEndReached={onEndReached}
            initialScrollIndex={initialRenderIndex}
            getItemLayout={(data, index) => { return { length: heightPercentageToDP(65), offset: heightPercentageToDP(65) * index, index } }}
        />
    )
}

const ClosetH = ({ onPress, onPressEdit, onpressdelete, item, index }) => {
    const { Appcolor } = useTheme()
    const styles = useStyles(Appcolor)
    return (
        <Pressable onPress={onPress} style={[{ marginLeft: widthPercentageToDP(3), marginTop: widthPercentageToDP(4), width: widthPercentageToDP(45), padding: 8, backgroundColor: "white", borderRadius: 10 }]}>
            <View style={{ height: heightPercentageToDP(22), width: "100%" }}>
                {item?.media_type == "video" ?
                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <Image source={Appimg.play} style={{ height: 38, width: 38, position: "absolute", zIndex: 10 }} />
                        <VideoThumb source={item?.media_name} styleMain={{ height: "100%", width: "100%", borderRadius: 10 }} resizeMode='cover' />
                    </View>
                    :
                    <FastImage source={{ uri: fileUrl + item?.media_name }} style={{ height: "100%", width: "100%", borderRadius: 10, }} />
                }
                <View style={[Commonstyles(Appcolor).row, { justifyContent: "flex-end", position: "absolute", bottom: 2, right: 2 }]}>
                    <TouchableOpacity onPress={onPressEdit} style={[styles?.editBtns, { marginRight: 8 }, Commonstyles(Appcolor).shadow]}>
                        <Image source={Appimg?.editblack} style={{ height: "50%", width: "50%" }} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onpressdelete} style={[styles?.editBtns, Commonstyles(Appcolor).shadow]}>
                        <Image source={Appimg?.bin} style={{ height: "50%", width: "50%" }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={{ fontFamily: Appfonts.semiBold, fontSize: 12, color: Appcolor.white, marginTop: 8 }}>{moment(item?.created_at).format("MM/DD/YYYY")}</Text>
            <Text style={{ fontFamily: Appfonts.regular, fontSize: 13, color: Appcolor.white, marginTop: 4 }} numberOfLines={2}>{item?.caption}</Text>
        </Pressable>
    )
}
const ClosetV = ({ item, index }) => {
    const { Appcolor } = useTheme()
    const navigation = useNavigation();
    const styles = useStyles(Appcolor)
    return (
        <View style={[{ marginTop: widthPercentageToDP(4), width: widthPercentageToDP(100), paddingVertical: 8, backgroundColor: Appcolor.modal }]}>
            {item?.media_type == "video" ?
                <Pressable style={{ justifyContent: "center", alignItems: "center" }} onPress={() => navigation?.navigate("VideoPlayer", { media: item?.media_name })}>
                    <Image source={Appimg.play} style={{ height: 38, width: 38, position: "absolute", zIndex: 10 }} />
                    <VideoThumb source={item?.media_name} styleMain={{ height: heightPercentageToDP(60), width: "100%", borderRadius: 10 }} />
                </Pressable>
                :
                <Pinchable>
                    <FastImage source={{ uri: fileUrl + item?.media_name }} style={{ height: heightPercentageToDP(60), width: "100%", }} resizeMode='contain' />
                </Pinchable>
            }
            <View style={{ margin: 16 }}>
                <Text style={{ fontFamily: Appfonts.semiBold, fontSize: 14, color: Appcolor.txt, marginTop: 8 }}>{moment(item?.created_at).format("MM/DD/YYYY")}</Text>
                <Text style={{ fontFamily: Appfonts.regular, fontSize: 14, color: Appcolor.txt, marginTop: 4 }} >{item?.caption}</Text>
            </View>
        </View>
    )
}