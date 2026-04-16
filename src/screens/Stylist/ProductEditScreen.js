import { FlatList, Image, ImageBackground, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Tinput from '../../components/Tinput'
import en from '../../translation'
import CustomDrop from '../../components/CustomDrop'
import Commonstyles from '../../constants/Commonstyles'
import FastImage from 'react-native-fast-image'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Btn from '../../components/Btn'
import CameraModal from '../../components/CameraModal'
import ImagePicker from 'react-native-image-crop-picker';
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { CreateCollectionImageApi, DeleteCollection, DeleteCollectionMedia, GetCollectionDetail, searchClient, updateCollectionApi, UpdateCollectionApi } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import { baseUrl, fileUrl } from '../../apimanager/httpmanager'
import showToast from '../../CustomToast'
import { Productdetail } from '../../redux/CommanReducer'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Searchbar from '../../components/Searchbar'
import ProgressBar from 'react-native-progress/Bar'
import JacketModal from '../../components/JacketModal'
import RNFetchBlob from 'rn-fetch-blob'
import { getData } from '../../utils/asyncstore'


const ProductEditScreen = ({ navigation, route }) => {
    let dispatch = useDispatch()
    const { _item } = route.params ?? {}
    // console.log(_item);
    let theme = useSelector(state => state.theme)?.theme
    const data = useSelector(state => state.CommanReducer)?.productdetail
    console.log(data);

    const [collectionName, setCollectionName] = useState('')
    const [collectionAbout, setCollectionAbout] = useState('')
    const [display, setDisplay] = useState([
        { label: "public", value: "public" },
        { label: "private", value: "private" },
    ])
    const [showPost, setShowPost] = useState(false)
    const [media, setMedia] = useState("")
    const [mediatype, setMediatype] = useState("")

    const [displayVal, setDisplayVal] = useState("")
    const [uploads, setUploads] = useState([])
    const [newuploads, setnewUploads] = useState([])
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [tagged, setTagged] = useState([])
    const [searchKey, setSearchKey] = useState("")
    const { Appcolor } = useTheme()
    const [visible, setVisible] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const fromCamera = (type) => {
        ImagePicker.openCamera({
            mediaType: 'any',
            multiple: true
        }).then((image) => {
            let array = [...uploads]
            let d = array.concat(image)
            setUploads([...d])
        });
    };
    const fromGallery = (type) => {
        ImagePicker.openPicker({
            mediaType: 'any',
            multiple: true
        }).then((image) => {
            let array = [...uploads]
            let d = array.concat(image)
            setUploads([...d])
            console.log(d)
        });
    };
    useEffect(() => {
        if (searchKey != "") {
            searchUser(searchKey)
        }
    }, [searchKey])
    useEffect(() => {
        setVisible(false)
        setCurrentImageIndex(0)
        if (displayVal == "public") {
            setSearchKey("")
            setTagged([])
            setSearchResults([])
        }
    }, [displayVal])
    useEffect(() => {
        if (data?._id) {
            setCollectionName(data?.name)
            setCollectionAbout(data?.description)
            setDisplayVal(data?.display_type)
            setTagged(data?.display_to)
            let array = []
            data?.media_data.forEach((i) => {
                if (i.status == 1) {
                    array.push({
                        path: i.media_type == 'video' ? 'logo' : fileUrl + i.media_name,
                        upload: 'server',
                        _id: i._id,
                        is_cover_image: i.is_cover_image,
                        thumbnail: fileUrl + i.thumbnail,
                        media_type: i.media_type
                    })
                }

            })

            setUploads([...array])
            // setUploads(data?.description)
        }
    }, [data])

    async function on_update() {
        if (collectionName.length == 0) {
            showToast('Collection Name is required')
            return false
        }
        if (collectionAbout.length == 0) {
            showToast('About Collection is required')
            return false
        }
        if (uploads.length == 0) {
            showToast('Images is required')
            return false
        }
        if (displayVal == "private" && tagged?.length == 0) {
            showToast("No users selected.")
            return
        }

        let tagUser = []
        tagged.forEach(x => tagUser.push(x?._id))

        let formdata = new FormData()
        // uploads.forEach((img1) => {
        //     if (img1?.upload != 'server') {
        //         formdata.append("collection_media", {
        //             name: Date.now() + ".png",
        //             type: img1.mime,
        //             uri: img1.path
        //         })
        //     }

        // })

        formdata.append("name", collectionName)
        formdata.append("description", collectionAbout)
        formdata.append("display_type", displayVal)
        // formdata.append("display_to", '')
        tagged?.length > 0 && formdata.append("display_to", JSON.stringify(tagUser))
        formdata.append("collection_id", data?._id)
        console.log("fsadf", formdata)
        dispatch(setLoading(true))
        let res = await UpdateCollectionApi(formdata)

        console.log(res.data.data, 'resss')
        try {
            if (res?.data?.status) {
                dispatch(setLoading(false))
                console.log(uploads, "uploasasdf");
                let filter = uploads.filter(i => { return (!i?.upload || i?.upload != 'server') })
                if (filter.length > 0) {
                    setnewUploads(filter)
                    setVisible(true)
                    await uploadImages(res.data.data?._id, 0, filter)
                }
                else {
                    // dispatch(Productdetail(_item._id))
                    navigation.pop()
                    dispatch(setLoading(false))
                }
            } else {

                // showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }

    }

    // useEffect(() => {
    //     console.log(currentImageIndex, 'currentImageIndex')
    //     console.log(uploads.length, 'uploads')
    //     if (currentImageIndex == newuploads.length && newuploads.length > 0) {
    //         setTimeout(() => {
    //             dispatch(Productdetail(_item._id))
    //             setVisible(false)
    //             setCurrentImageIndex(0)
    //             navigation.pop()
    //         }, 1000);

    //     }

    // }, [currentImageIndex, uploads])
    // async function uploadImages(id, current = 0, array) {

    //     let formdata = new FormData()

    //     formdata.append("collection_media", {
    //         name: array[current].mime.split('/')[0] == 'video' ? Date.now() + "." + array[current].mime.split('/')[1] : Date.now() + ".png",
    //         type: array[current].mime,
    //         uri: array[current].path
    //     })
    //     formdata.append("collection_id", id)
    //     formdata.append("is_cover_image", '0')
    //     formdata.append("is_first_image", current == 0 ? 1 : '0')
    //     formdata.append("type", 'update')
    //     let res = await CreateCollectionImageApi(formdata)

    //     try {
    //         if (res?.data?.status) {

    //             setCurrentImageIndex(current + 1)

    //             if (current < array.length) {
    //                 await uploadImages(id, current + 1, array)
    //             }


    //             // navigation.pop()
    //         } else {
    //             // showToast(res?.data?.message);
    //         }
    //     } catch (e) {
    //     } finally {
    //         dispatch(setLoading(false))
    //     }


    // }
    function divideArrayIntoGroups(allMedia, batchSize) {
        const unifiedBatches = [];
        // let coverPhoto = arr?.filter((i, j) => j == (isCover - 1))
        // let allMedia = arr?.filter((i, j) => j != (isCover - 1))?.filter(x => !x.deleted)
        // if (coverPhoto?.length) {
        //     unifiedBatches.push(coverPhoto)
        // }
        for (let i = 0; i < allMedia.length; i += batchSize) {
            const batch = allMedia.slice(i, i + batchSize);
            unifiedBatches.push(batch);
        }
        console.log(unifiedBatches, "sadfkjsdfuiousdif");
        return unifiedBatches
    }
    const uploadImages = async (id, current = 0, arr) => {
        const chunkSize = 10;
        let allChunck = divideArrayIntoGroups(arr, chunkSize)
        setTotalChunks(allChunck?.length)
        for (let index = 0; index < allChunck.length; index++) {
            const mediaChunk = allChunck[index];
            let mediaArray = [];
            mediaArray.push({ name: "collection_id", data: id });
            for (let i = 0; i < mediaChunk.length; i++) {
                const mediaItem = mediaChunk[i];
                console.log(mediaItem, 'hhhhhh');
                const mediaObject = {
                    filename: Date.now() + ".png",
                    type: (mediaItem.type || mediaItem?.mime),
                    data: (RNFetchBlob.wrap(mediaItem?.path || mediaItem?.uri))?.replace('file://file:///', 'file:///'),
                };
                // const mediaObject = {
                //     filename: mediaItem.mime.split('/')[0] === 'video' ? Date.now() + "." + mediaItem.mime.split('/')[1] : Date.now() + ".png",
                //     type: mediaItem.mime,
                //     data: (RNFetchBlob.wrap(mediaItem?.path || mediaItem?.uri))?.replace('file://file:///', 'file:///'),
                // };
                mediaArray.push({ ...mediaObject, name: "collection_media" });
            }
            let res = await uploadToServer(mediaArray);
            setCurrentImageIndex((Number(index) + 1))
        }
        setTimeout(() => {
            dispatch(Productdetail(_item._id))
            setVisible(false)
            setCurrentImageIndex(0)
            navigation.pop()
        }, 1000);
    }

    const uploadToServer = async (arr) => {
        try {
            const tokens = await getData("@tokens");
            let res = await RNFetchBlob.config({
                trusty: true,
            }).fetch('POST', (baseUrl + "stylist/upload_media_array"), {
                Authorization: `Bearer ${tokens}`,
                'Content-Type': 'multipart/form-data',
            }, arr)
            return res
            // .then((resp) => {
            //     console.log(resp)
            //     return resp
            // }).catch((err) => {
            //     console.log(err)
            // })
        } catch (e) {
            console.log(e, "uploadesss");
        }
    }

    const searchUser = async (key) => {
        try {
            let res = await searchClient(key)
            console.log("finnhere", res);
            if (res?.data?.status) {
                setSearchResults(res?.data?.data)
            } else {
                showToast(res?.data?.message ?? "Network Error")
            }
        } catch (e) {
        } finally {
        }
    }
    const updateCollection = async () => {
        let body = { collection_id: data?._id, display_type: displayVal, display_to: tagged, name: collectionName, description: collectionAbout }
        try {
            dispatch(setLoading(true))
            let res = await updateCollectionApi(body)
            if (res?.data?.status) {
                showToast("Updated sucessfully")
                navigation.goBack()
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={Appimg?.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <CameraModal visible={showCameraModal} onPressCancel={() => setShowCameraModal(false)}
                onPressCamera={() => {
                    setShowCameraModal(false)
                    setTimeout(() => {
                        fromCamera('photo')
                    }, 400);
                }}
                onPressGallery={() => {
                    setShowCameraModal(false)
                    setTimeout(() => {
                        fromGallery('photo')
                    }, 400);
                }}

            />
            <JacketModal vis={showPost} data={media}
                onPressOut={() => setShowPost(false)} mediatype={mediatype} />
            <Header title={"Edit " + data?.name} showBack={true} onBackPress={() => navigation.goBack()} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <Tinput value={collectionName} onChangeText={(t) => setCollectionName(t)} place={en?.collectionname} styleMain={{ marginTop: 26 }} />
                    <Tinput value={collectionAbout} onChangeText={(t) => setCollectionAbout(t)} place={en?.aboutcollection} styleMain={{ marginTop: 16 }}
                        multiline={true}
                        tav={Platform?.OS === "android" && "top"}
                        styleInput={{ height: 100 }}
                    />
                    <CustomDrop
                        data={display}
                        label={en?.display}
                        place={"Show to..."}
                        styleMain={{ marginTop: 16 }}
                        val={displayVal}
                        setVal={t => setDisplayVal(t)}
                    />
                    {displayVal == "private" && <Searchbar
                        styleMain={{ marginTop: 16 }}
                        value={searchKey}
                        onChangeText={t => {
                            setSearchKey(t)
                        }}
                        textInputProps={{
                            onSubmitEditing: () => {
                                searchUser(searchKey)
                            },
                            onEndEditing: (t) => {
                                // console.log(t, "sdf");
                                // searchUser(searchKey)
                            }
                        }}
                    />}
                    {searchResults?.length > 0 && <View style={[{ marginHorizontal: 18, backgroundColor: Appcolor.primary, marginTop: 8 }, Commonstyles(Appcolor).shadow]}>
                        {searchResults?.map((i, j) => {
                            return (
                                <Pressable style={{ padding: 8 }} key={i?._id}
                                    onPress={() => {
                                        let temp = [...tagged]
                                        let arr = temp.filter(x => x?._id == i?._id)
                                        if (arr.length == 0) {
                                            temp.push(i)
                                            setTagged(temp)
                                        }
                                        setSearchResults([])
                                        setSearchKey("")
                                    }}
                                >
                                    <Text>{i?.full_name}</Text>
                                </Pressable>
                            )
                        })}
                    </View>}
                    {tagged?.length > 0 && <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 18, marginVertical: 12 }}>
                        {tagged.map((i, j) => {
                            return (
                                <View style={{ backgroundColor: Appcolor.primary, minWidth: 60, padding: 8, minHeight: 34, borderRadius: 12, marginRight: 10, justifyContent: "center", alignItems: 'center' }}>
                                    <Pressable
                                        onPress={() => {
                                            let temp = [...tagged]
                                            temp.splice(j, 1)
                                            setTagged(temp)
                                        }}
                                        style={{ position: 'absolute', right: -6, top: -6, backgroundColor: Appcolor.white, borderRadius: 10, }}
                                    >
                                        <FastImage source={Appimg?.bin} style={{ height: 10, width: 10, margin: 4 }} />
                                    </Pressable>
                                    <Text>{i?.full_name}</Text>
                                </View>
                            )
                        })}
                    </ScrollView>}
                    {/* <Text style={[Commonstyles.mediumText10, { marginHorizontal: 18, marginTop: 16, marginBottom: 8 }]}>Upload Photos</Text> */}
                </View>
                {/* <FlatList
                    scrollEnabled={false}
                    numColumns={3}
                    data={["uploading"].concat(uploads)}
                    renderItem={({ item, index }) => {

                        if (item == "uploading") {
                            return (
                                <_renderUpload onPressUpload={() => { setShowCameraModal(true) }} />
                            )
                        }
                        return (
                            <Pressable >
                                {
                                    item?.mime?.split('/')[0] == 'video' ?
                                        <ImageBackground resizeMode='contain' source={Appimg.logo} style={{ height: widthPercentageToDP(28), width: widthPercentageToDP(28), borderRadius: 4, marginLeft: widthPercentageToDP(4), marginBottom: widthPercentageToDP(4), justifyContent: 'center', alignItems: 'center' }} >
                                            <Image source={Appimg.play} style={{ tintColor: Appcolor.txt, height: 50, width: 50 }} />
                                        </ImageBackground> :
                                        <>
                                            {
                                                item.path == 'logo' ?
                                                    <ImageBackground resizeMode='contain' source={Appimg.logo} style={{ height: widthPercentageToDP(28), width: widthPercentageToDP(28), borderRadius: 4, marginLeft: widthPercentageToDP(4), marginBottom: widthPercentageToDP(4), justifyContent: 'center', alignItems: 'center' }} >
                                                        <Image source={Appimg.play} style={{ tintColor: Appcolor.txt, height: 50, width: 50 }} />
                                                    </ImageBackground> :
                                                    <FastImage source={{ uri: item.path }} style={{ height: widthPercentageToDP(28), width: widthPercentageToDP(28), borderRadius: 4, marginLeft: widthPercentageToDP(4), marginBottom: widthPercentageToDP(4) }} />
                                            }
                                        </>

                                }
                                {
                                    item?.is_cover_image != 1 &&
                                    <Pressable
                                        onPress={async () => {
                                            if (item?.upload == 'server') {

                                                let _data = {
                                                    _id: data?._id,
                                                    media_id: item._id
                                                }

                                                let res = await DeleteCollectionMedia(_data)
                                                console.log(res, 'DeleteCollectionMedia')
                                                try {
                                                    if (res?.data?.status) {
                                                        let arr = [...uploads]
                                                        let _index = arr.findIndex((i) => { return i.path == item.path })
                                                        arr.splice(_index, 1)
                                                        setUploads([...arr])

                                                    } else {

                                                    }
                                                } catch (e) {
                                                } finally {
                                                    dispatch(setLoading(false))
                                                }

                                            }
                                            else {
                                                let arr = [...uploads]
                                                let _index = arr.findIndex((i) => { return i.path == item.path })
                                                arr.splice(_index, 1)
                                                setUploads([...arr])
                                            }
                                        }}
                                        style={{ position: "absolute", top: 0, right: 0, zIndex: 1, flexDirection: "row", backgroundColor: Appcolor.white, padding: 4, borderRadius: 10 }}
                                    >
                                        <FastImage source={Appimg.bin} style={{ height: 10, width: 10, borderRadius: 4 }} resizeMode="contain" />
                                    </Pressable>
                                }
                            </Pressable>
                        )
                    }}
                    ListFooterComponent={() => {
                        return (
                            <Btn transparent={Appcolor.blackop} title={en?.updateandpost} twhite styleMain={{ alignSelf: "center", marginTop: 40, marginBottom: 100 }} onPress={() => on_update()} />
                        )
                    }}
                /> */}
                <Btn transparent={Appcolor.blackop} title={en?.continue} twhite styleMain={{ alignSelf: "center", marginTop: 40, marginBottom: 100 }}
                    onPress={() => {
                        if (!displayVal || !collectionName || !collectionAbout) {
                            // if (displayVal=="private"&&tagged) {

                            // }
                            showToast("All fields are required.")
                            return
                        }
                        updateCollection()
                        // navigation.navigate("EditCollectionGallery", { collectionId: data?._id, displayVal, tagged, collectionName, collectionAbout })
                    }}
                />
            </KeyboardAwareScrollView>
            <Modal transparent={true} visible={visible} style={styles.mainview}>
                <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", }}
                >
                    <View style={{ height: 150, width: '90%', backgroundColor: Appcolor.modal, alignItems: 'center' }}>

                        <Text style={[Commonstyles(Appcolor).mediumText18, { marginTop: 20, color: Appcolor.txt }]}>Uploading Media</Text>
                        {/* <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{currentImageIndex}/{newuploads.length}</Text> */}
                        <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{(currentImageIndex / totalChunks) * 100}%</Text>
                        {/* <ProgressBar borderWidth={1} color={Appcolor.primary} progress={(currentImageIndex) / newuploads.length} width={300} /> */}
                        {
                            currentImageIndex > 0 && totalChunks > 0 &&
                            <ProgressBar borderWidth={1} color={Appcolor.primary} progress={(currentImageIndex) / totalChunks} width={300} />
                        }
                    </View>
                </Pressable>
            </Modal>
        </ImageBackground>
    )
}

export default ProductEditScreen

const styles = StyleSheet.create({
    mainview: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
})

const _renderUpload = ({ onPressUpload }) => {
    return (
        <Pressable
            onPress={onPressUpload}
        >
            <FastImage source={Appimg?.upload} style={{ height: widthPercentageToDP(28), width: widthPercentageToDP(28), borderRadius: 4, marginLeft: widthPercentageToDP(4) }} />
        </Pressable>
    )
}