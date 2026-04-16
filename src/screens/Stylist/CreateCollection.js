import { Alert, FlatList, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View, Modal, Image, Linking, NativeModules, NativeEventEmitter } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Tinput from '../../components/Tinput'
import en from '../../translation'
import CustomDrop from '../../components/CustomDrop'
import Commonstyles from '../../constants/Commonstyles'
import Video from 'react-native-video';
import FastImage from 'react-native-fast-image'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Btn from '../../components/Btn'
import CameraModal from '../../components/CameraModal'
import showToast from '../../CustomToast'
import { useDispatch, useSelector } from 'react-redux'
import { CreateCollectionApi, CreateCollectionImageApi, createCollectionApi, searchClient, uploadFiles } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import Searchbar from '../../components/Searchbar'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useTheme } from '@react-navigation/native'
import ProgressBar from 'react-native-progress/Bar'
import JacketModal from '../../components/JacketModal'
import ImageCropPicker from 'react-native-image-crop-picker'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob'
import moment from 'moment'
import { getData } from '../../utils/asyncstore'
import { baseUrl } from '../../apimanager/httpmanager'
import OptionsModal from '../../components/OptionsModal'
import AppUtils from '../../utils/apputils'
import { setUploadTask } from '../../redux/uploadReducer'
import { setCollectionData } from '../../redux/CommanReducer'
import { Store } from '../../redux/Store'
import analytics from '@react-native-firebase/analytics';


const CreateCollection = ({ navigation }) => {

    let dispatch = useDispatch()
    const { Photopicker } = NativeModules;
    const [collectionName, setCollectionName] = useState('')
    const [collectionAbout, setCollectionAbout] = useState('')
    const [display, setDisplay] = useState([
        { label: "public", value: "public" },
        { label: "private", value: "private" },
    ])
    const [displayVal, setDisplayVal] = useState("")
    const [uploads, setUploads] = useState([])
    const [coverImg, setCoverImg] = useState(null)
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [searchKey, setSearchKey] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [tagged, setTagged] = useState([])
    const [visible, setVisible] = useState(false)
    let theme = useSelector(state => state.theme)?.theme
    const { Appcolor } = useTheme()
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [showPost, setShowPost] = useState(false)
    const [media, setMedia] = useState("")
    const [mediatype, setMediatype] = useState("")
    const [fileUrl, setfileUrl] = useState("")

    const [isCover, setIsCover] = useState(1)
    const [selectionModal, setSelectionModal] = useState(false)
    const chunkSize = 20000;
    const chunkSize2 = 1;
    let isUploading = useSelector(state => state?.uploadReducer?.isUploading)
    let collectionData = useSelector(state => state?.CommanReducer?.collectionData)
    const [cId, setCId] = useState("")
    let isUploadingNative = useSelector(state => state?.appstate?.isUploadingNative)


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
        if (searchKey != "") {
            searchUser(searchKey)
        }
    }, [searchKey])
    // useEffect(() => {
    //     console.log(currentImageIndex, totalChunks);
    //     if (currentImageIndex == totalChunks > 0) {
    //         setTimeout(() => {
    //             setVisible(false)
    //             setCurrentImageIndex(0)
    //             navigation.pop()
    //         }, 1000);
    //     }
    // }, [currentImageIndex, totalChunks])

    const fromCamera = async (type) => {
        try {
            const result = await launchCamera({ mediaType: "mixed" });
            if (result?.assets) {
                let image = result?.assets
                let array = [...uploads]
                let d = array.concat(image)
                setUploads([...d])
            }
        } catch (e) {
            console.log(e);
        }


        // ImageCropPicker.openCamera({
        //     mediaType: isCover ? "photo" : 'any',
        //     multiple: isCover ? false : true
        // }).then((image) => {
        //     if (isCover) {
        //         setCoverImg(image)
        //         setIsCover(false)
        //         return
        //     }
        //     let array = [...uploads]
        //     let d = array.concat(image)
        //     setUploads([...d])
        // }).catch(e => {
        //     console.log(e);
        // });
    };
    const fromGallery = async (type) => {
        const result = await launchImageLibrary({ selectionLimit: 40, mediaType: "mixed", formatAsMp4: true });
        if (result?.assets) {
            let image = result?.assets
            let array = [...uploads]
            let d = array.concat(image)
            setUploads([...d])
        }
        // ImageCropPicker.openPicker({
        //     mediaType: isCover ? "photo" : "any",
        //     multiple: isCover ? false : true,
        //     maxFiles: 8
        // }).then((image) => {
        //     if (isCover) {
        //         setCoverImg(image)
        //         setIsCover(false)
        //         return
        //     }
        //     let array = [...uploads]
        //     let d = array.concat(image)
        //     setUploads([...d])
        // }).catch(e => {
        //     console.log(e);
        // });
    };
    async function create_collection() {
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
        try {
            let tagUser = []
            tagged.forEach(x => tagUser.push(x?._id))
            let formdata = new FormData()
            formdata.append("name", collectionName)
            formdata.append("description", collectionAbout)
            formdata.append("display_type", displayVal)
            tagged?.length > 0 && formdata.append("display_to", JSON.stringify(tagUser))
            dispatch(setLoading(true))
            let res = await CreateCollectionApi(formdata)
            if (res?.data?.status) {
                dispatch(setLoading(false))
                setTimeout(async () => {
                    setVisible(true)
                    await uploadImages(res.data.data?._id)
                }, 500);
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
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
    function divideArrayIntoGroups(arr, batchSize) {
        const unifiedBatches = [];
        let coverPhoto = arr?.filter((i, j) => j == (isCover - 1))
        let allMedia = arr?.filter((i, j) => j != (isCover - 1))?.filter(x => !x.deleted)
        if (coverPhoto?.length) {
            unifiedBatches.push(coverPhoto)
        }
        for (let i = 0; i < allMedia.length; i += batchSize) {
            const batch = allMedia.slice(i, i + batchSize);
            unifiedBatches.push(batch);
        }
        return unifiedBatches
    }
    const uploadImages = async (id) => {
        const chunkSize = 10;
        let allChunck = divideArrayIntoGroups(uploads, chunkSize)
        setTotalChunks(allChunck?.length)

        for (let index = 0; index < allChunck.length; index++) {
            const mediaChunk = allChunck[index];
            let mediaArray = [];
            mediaArray.push({ name: "collection_id", data: String(id) });
            if (index === 0) {
                mediaArray.push({ name: "is_first_image", data: "1" });
                mediaArray.push({ name: "is_cover_image", data: "1" });
            }

            for (let i = 0; i < mediaChunk.length; i++) {
                const mediaItem = mediaChunk[i];
                const mediaObject = {
                    filename: moment().unix() + ".png",
                    type: (mediaItem.type || mediaItem?.mime),
                    data: (RNFetchBlob.wrap(mediaItem?.path || mediaItem?.uri))?.replace('file://file:///', 'file:///'),
                    name: "collection_media"
                };
                mediaArray.push(mediaObject)
            }
            let res = await uploadToServer(mediaArray);
            setCurrentImageIndex((Number(index) + 1))
        }
        setTimeout(() => {
            setVisible(false)
            setCurrentImageIndex(0)
            navigation.pop()
        }, 1000);
    }
    const uploadToServer = async (arr) => {
        try {
            const tokens = await getData("@tokens");
            let res = await RNFetchBlob.config({
            }).fetch('POST', (baseUrl + "stylist/upload_media_array"), {
                Authorization: `Bearer ${tokens}`,
                'Content-Type': 'multipart/form-data',
            }, arr)
            return res
        } catch (e) {
            console.log(e, "uploadesss");
        }
    }
    const optSelected = async (type) => {
        if (type == "library") {

            let data = {}
            //  navigation?.navigate("ImageSelection", { displayVal, tagged, collectionName, collectionAbout })

            if (displayVal != "public") {
                data = {
                    name: collectionName,
                    description: collectionAbout,
                    display_type: displayVal,
                    display_to: tagged
                }
            } else {
                data = {
                    name: collectionName,
                    description: collectionAbout,
                    display_type: displayVal
                }
            }
            const tokens = await getData("@tokens");
            if (isUploadingNative) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
}
else{
    
            Photopicker.openCreateLibrary(data,tokens,{})

}

        } else if (type == "gallery") {
            console.log("hereeee testingggg")
            analytics().logEvent('onNAtivegalleryModal');
            // setSelectionModal(false)
            // setTimeout(() => {
            //     Platform.OS == "ios" ? Photopicker.openPicker():Photopicker.showToastToken("test")
            //      dispatch(setLoading(true))
            //  }, 300);
           
            if (isUploadingNative) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
}
else{
            setTimeout(async () => {
                dispatch(setLoading(true))
                const tokens = await getData("@tokens");
                let obj = {
                    collection_id: "",
                    type: 'add',
                    is_first_chunk: '1',
                    // type: 'update',
                    // is_first_chunk: '0',
                    saveToLibrary: "1",
                    media_type:"image"
                    
                };


           
                    Photopicker.openPicker(Store.getState().CommanReducer.collectionData, tokens, obj)
              
               

            }, 500);
        }

            //navigation?.navigate("ImageSelectionGallery", { displayVal, tagged, collectionName, collectionAbout })
        } else if (type == "camera") {
            if (isUploadingNative) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
}
else{
            navigation?.navigate("ImageSelectionGallery", { displayVal, tagged, collectionName, collectionAbout, picker: "camera" })
}
        }
        else if (type == "video") {
            setSelectionModal(false)
            // setTimeout(() => {
            //     Photopicker.openVideoPicker()
            //     // dispatch(setLoading(true))
            // }, 300);

            if (isUploadingNative) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
}
else{

            setTimeout(async () => {
                const tokens = await getData("@tokens");

                let obj = {
                    collection_id: "",
                    type: 'update',
                    is_first_chunk: '0',
                    saveToLibrary: "1",
                    media_type:"video"
                };
                Photopicker.openVideoPicker(Store.getState().CommanReducer.collectionData, tokens, obj)
                // dispatch(setLoading(true))
            }, 300);
        }
            // navigation?.navigate("ImageSelectionGallery", { displayVal, tagged, collectionName, collectionAbout, picker: "camera" })
        }
    }



    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(Photopicker)

        eventEmitter.addListener('sendDataToJS', (i) => {
            //  console.log(i, "image url", typeof i[0], typeof i[1])
            analytics().logEvent('onDataComingfromListner');

              console.log("sendDataToJS DATA IS",i)
            // return
            if (Platform.OS  == "ios"){

            if (i?.[0]?.length == 0) {
                dispatch(setLoading(false))
                analytics().logEvent('cancel_or_EmptyArray');
                setTimeout(() => {
                    navigation?.navigate("BottomTabS");
                }, 0);
                
                return
              
                console.log("Empty Array");
                showToast('No medias selected');
            }
            else {
                analytics().logEvent('DAtaFoundFromListner');
                return
                createCollection([...i[0]])
                console.log("LLLL");
            }
        }else{
            if (i == "[]") {
                dispatch(setLoading(false))
                setTimeout(() => {
                    navigation?.navigate("BottomTabS");
                }, 0);
                // dispatch(setLoading(false))
                // console.log("Empty Array");
                // showToast('No medias selected');
            }
        }



        });
        return () => {
            eventEmitter.removeAllListeners("sendDataToJS")
        }
    }, [Photopicker])


    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(Photopicker)

        eventEmitter.addListener('video', (i) => {
            //  console.log(i, "image url", typeof i[0], typeof i[1])

            //  console.log(i,"Videos in js")
          if (Platform.OS  == "ios"){
            if (i.length == 0) {
                setTimeout(() => {
                    navigation?.navigate("BottomTabS");
                }, 0);
                // dispatch(setLoading(false))
                // console.log("Empty Array");
                // showToast('No medias selected');
            }
        }
        else{
            if (i == "[]") {
                setTimeout(() => {
                    navigation?.navigate("BottomTabS");
                }, 0);
                // dispatch(setLoading(false))
                // console.log("Empty Array");
                // showToast('No medias selected');
            }
        }
          



        });
        return () => {
            eventEmitter.removeAllListeners("video")
        }
    }, [Photopicker])


    useEffect(() => {
        const LogeventEmitter = new NativeEventEmitter(Photopicker)

        LogeventEmitter.addListener('fireEvent', (i) => {
            //  console.log(i, "image url", typeof i[0], typeof i[1])

            console.log(i, "Videos in js")
            analytics().logEvent("fireEvent", { ...i });

        });
        return () => {
            LogeventEmitter.removeAllListeners("video")
        }
    }, [Photopicker])



    // const createCollection = async (data) => {
    //     dispatch(setLoading(true))
    //     analytics().logEvent('InsideCreateCollectionFunction');

    //     let collectionData = {}

    //     if (displayVal != "public") {
    //         collectionData = {
    //             name: collectionName,
    //             description: collectionAbout,
    //             display_type: displayVal,
    //             display_to: tagged
    //         }
    //     } else {
    //         collectionData = {
    //             name: collectionName,
    //             description: collectionAbout,
    //             display_type: displayVal
    //         }
    //     }

    //     console.log(collectionData, "::::::", Store.getState().CommanReducer.collectionData);

    //     try {
    //         //   dispatch(setLoading(true))
    //         analytics().logEvent('beforeCreateCollectionApi');

    //         let res = await createCollectionApi(Store.getState().CommanReducer.collectionData)
    //         console.log(res);
    //         analytics().logEvent('afterCreateCollectionApi');

    //         if (res?.data?.status) {
    //             setTimeout(() => {
    //                 analytics().logEvent('beforedivideArrayIntoChunks');

    //                 divideArrayIntoChunks(data, chunkSize, res?.data?.data?._id)
    //             }, 1000);
    //             // setCId(res?.data?.data?._id)
    //         } else {
    //             showToast(res?.data?.message || "Something went wrong.")
    //         }
    //     } catch (e) {
    //         dispatch(setLoading(false))
    //     } finally {
    //         //   dispatch(setLoading(false))

    //     }
    // }



    const createCollection = async (data) => {
        dispatch(setLoading(true))
        analytics().logEvent('InsideCreateCollectionFunction');

        let collectionData = {}

        if (displayVal != "public") {
            collectionData = {
                name: collectionName,
                description: collectionAbout,
                display_type: displayVal,
                display_to: tagged
            }
        } else {
            collectionData = {
                name: collectionName,
                description: collectionAbout,
                display_type: displayVal
            }
        }

        console.log(collectionData, "::::::", Store.getState().CommanReducer.collectionData);

        try {
            //   dispatch(setLoading(true))
            analytics().logEvent('beforeCreateCollectionApi');

            let res = await createCollectionApi(Store.getState().CommanReducer.collectionData)
            console.log(res);
            analytics().logEvent('afterCreateCollectionApi');

            if (res?.data?.status) {
                setTimeout(() => {
                    analytics().logEvent('beforedivideArrayIntoChunks');

                    divideArrayIntoChunks(data, chunkSize, res?.data?.data?._id)
                }, 1000);
                // setCId(res?.data?.data?._id)
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
            dispatch(setLoading(false))
        } finally {
            //   dispatch(setLoading(false))

        }
    }



    const divideArrayIntoChunks = async (arr, batchSize, id) => {
        analytics().logEvent('insidedivideArrayIntoChunks');

        const unifiedBatches = [];
        let saveToLib = "0"
        // let cId = ""
        if (arr?.length < 1) {
            return
        }
        for (let i = 0; i < arr.length; i += batchSize) {
            const batch = arr.slice(i, i + batchSize);
            unifiedBatches.push(batch);
        }
        if (unifiedBatches?.length) {
            // setTotalChunks(unifiedBatches?.length)
            // setUploadModal(true)
            let mediaType = "image"
            const options = {
                taskName: 'Uploading media',
                taskTitle: 'Uploading media',
                taskDesc: 'Uploading Please wait',
                taskIcon: {
                    name: 'ic_launcher',
                    type: 'mipmap',
                },
                color: '#ff00ff',
                linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
                parameters: {
                    delay: 1000,
                    unifiedBatches,
                    id, cId, saveToLib, mediaType
                },
            };
            if (isUploading) {
                dispatch(setLoading(false))

                Alert.alert('Upload in progress', "Please wait for current uploading")
            }
            else {
                analytics().logEvent('insideElsedivideArrayIntoChunks');

                console.log(options);
                dispatch(setLoading(false))

                dispatch(setUploadTask(options))
                setTimeout(() => {
                    navigation?.navigate("BottomTabS");
                }, 0);

                analytics().logEvent('finishdivideArrayIntoChunks');

            }


        }
    }


    const divideArrayIntoChunks2 = async (arr, batchSize, id) => {
        let saveToLib = "0"
        const unifiedBatches = [];
        if (arr?.length < 1) {
            return
        }
        for (let i = 0; i < arr.length; i += batchSize) {
            const batch = arr.slice(i, i + batchSize);
            unifiedBatches.push(batch);
        }
        if (unifiedBatches?.length) {
            setTotalChunks(unifiedBatches?.length)
            // setUploadModal(true)
            let mediaType = "video"
            const options = {
                taskName: 'Uploading media',
                taskTitle: 'Uploading media',
                taskDesc: 'Uploading Please wait',
                taskIcon: {
                    name: 'ic_launcher',
                    type: 'mipmap',
                },
                color: '#ff00ff',
                linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
                parameters: {
                    delay: 1000,
                    unifiedBatches,
                    id, cId, saveToLib, mediaType
                },
            };
            if (isUploading) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
            }
            else {
                console.log(options);
                dispatch(setUploadTask(options))
                navigation?.navigate("BottomTabS");
            }


        }
    }

    const uploadCollection = async (data) => {
        let notDeletedMedias = data
        // if(data?.length>0){
        //      notDeletedMedias = data?.filter(x => !x?.deleted)
        // }else{
        //      notDeletedMedias = allMedia?.filter(x => !x?.deleted)
        // }

        try {
            dispatch(setLoading(true))
            let res = await createCollectionApi(Store.getState().CommanReducer.collectionData)
            dispatch(setLoading(false))
            if (res?.data?.status) {
                setTimeout(() => {
                    divideArrayIntoChunks2(notDeletedMedias, chunkSize2, res?.data?.data?._id)
                }, 1000);
                // setCId(res?.data?.data?._id)
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
            dispatch(setLoading(false))
        } finally {
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor?.white }}>
            <ImageBackground source={theme == "dark" ? Appimg.darkbg : Appimg?.bg} resizeMode="cover" style={{ flex: 1 }}>
                <OptionsModal
                    visible={selectionModal}
                    onPressOpt={(type) => {


                        optSelected(type)
                    }}
                    onPressCancel={() => setSelectionModal(false)}
                />
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
                <Header title={"Create Collection"} showBack={true} onBackPress={() => navigation.goBack()} />
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                    <View>
                        <Tinput value={collectionName} onChangeText={(t) => setCollectionName(t)} place={en?.collectionname} styleMain={{ marginTop: 26 }} />
                        <Tinput value={collectionAbout} onChangeText={(t) => setCollectionAbout(t)} place={en?.aboutcollection} styleMain={{ marginTop: 16 }} multiline styleInput={{ height: 80 }} tav={Platform?.OS == "android" && "top"} />
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
                                }
                            }}
                        />}
                        {searchResults?.length > 0 && <View style={[{ marginHorizontal: 18, backgroundColor: Appcolor.primary, marginTop: 8 }, Commonstyles(Appcolor).shadow]}>
                            {searchResults?.map((i, j) => {
                                return (
                                    <Pressable style={{ padding: 8 }}
                                        key={j}
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
                        {/* <Text style={[Commonstyles(Appcolor).mediumText10, { marginHorizontal: 18, marginTop: 16, marginBottom: 8 }]}>Upload Cover Photo</Text>
                        <Pressable
                            onPress={() => {
                                setIsCover(true)
                                setShowCameraModal(true)
                            }}
                        >
                            {coverImg ?
                                <FastImage source={{ uri: coverImg?.path }} style={{ height: widthPercentageToDP(38), width: "92%", alignSelf: 'center' }} resizeMode='cover' />
                                :
                                <FastImage source={Appimg?.uploadcover} style={{ height: widthPercentageToDP(38) }} resizeMode='contain' />
                            }
                        </Pressable> */}
                        {/* <Text style={[Commonstyles(Appcolor).mediumText10, { marginHorizontal: 18, marginTop: 16, marginBottom: 8 }]}>Upload Photos</Text> */}
                    </View>
                    {/* <FlatList
                        scrollEnabled={false}
                        numColumns={3}
                        data={["uploading"].concat(uploads)}
                        ListHeaderComponent={() => {
                            if (!uploads?.length) {
                                return <></>
                            }
                            return (
                                <Text style={[Commonstyles(Appcolor).mediumText14, { marginHorizontal: 16, marginBottom: 16, textAlign: 'center' }]}>Long Press to set collection Cover image</Text>
                            )
                        }}
                        renderItem={({ item, index }) => {
                            if (item == "uploading") {
                                return (
                                    <_renderUpload onPressUpload={() => { setShowCameraModal(true) }} />
                                )
                            }
                            return (
                                <Pressable onLongPress={() => { !item?.deleted && setIsCover(index) }} style={{ opacity: item?.deleted ? 0.2 : 1 }}>
                                    {item?.type?.split('/')[0] == 'video' ?
                                        <ImageBackground resizeMode='contain' source={Appimg.logo} style={{ height: widthPercentageToDP(28), width: widthPercentageToDP(28), borderRadius: 4, marginLeft: widthPercentageToDP(4), marginBottom: widthPercentageToDP(4), justifyContent: 'center', alignItems: 'center' }} >
                                            <FastImage source={Appimg.play} style={{ tintColor: Appcolor.txt, height: 50, width: 50 }} />
                                        </ImageBackground> :
                                        <FastImage source={{ uri: item.path ?? item?.uri }} style={{ height: widthPercentageToDP(28), width: widthPercentageToDP(28), borderRadius: 4, marginLeft: widthPercentageToDP(4), marginBottom: widthPercentageToDP(4) }} />
                                    }
                                    <Pressable onPress={() => {
                                        if (isCover == index) {
                                            return
                                        }
                                        let arr = [...uploads]
                                        let _index = index - 1
                                        arr[_index].deleted = { ...arr[_index], deleted: true }
                                        setUploads(arr)

                                        // let arr = [...uploads]
                                        // let _index = arr.findIndex((i) => { return i.path == item.path })
                                        // arr.splice(_index, 1)
                                        // setUploads([...arr])
                                        // let arr = [...uploads]
                                        // console.log(arr);
                                    }} style={{ position: "absolute", top: 0, right: 0, zIndex: 1, backgroundColor: Appcolor.white, padding: 4, borderRadius: 10 }}
                                    >
                                        <FastImage source={Appimg.bin} style={{ height: 10, width: 10, borderRadius: 4 }} resizeMode="contain" />
                                    </Pressable>
                                    {isCover == index &&
                                        <Pressable style={{ position: "absolute", top: 0, left: 10, zIndex: 1, backgroundColor: Appcolor.txt, borderRadius: 100, padding: 4 }}>
                                            <FastImage source={Appimg.pin} style={{ height: 16, width: 16 }} resizeMode='contain' />
                                        </Pressable>
                                    }
                                </Pressable>
                            )
                        }}
                        ListFooterComponent={() => {
                            return <Btn transparent={Appcolor.blackop} title={en?.post} twhite styleMain={{ alignSelf: "center", marginTop: 40, marginBottom: 40 }}
                                onPress={() => {
                                    // uploadImages("64cb9feacd904ed25c42ec91")
                                    // return
                                    // // divideArrayIntoGroups(uploads, 3)
                                    setTimeout(() => {
                                        create_collection()
                                    }, 400);
                                }} />
                        }}
                    /> */}
                    <Btn transparent={Appcolor.blackop} title={en?.continue} twhite styleMain={{ alignSelf: "center", marginTop: 80, marginBottom: 40 }}
                        onPress={() => {


                            if (!collectionName || !collectionAbout || !displayVal) {
                                // if (displayVal=="private"&&!tagged) {
                                //     showToast("All field are required.")
                                // }
                                showToast("All field are required.")
                                return
                            }

                            if (displayVal != "public") {
                                dispatch(setCollectionData(a = {
                                    name: collectionName,
                                    description: collectionAbout,
                                    display_type: displayVal,
                                    display_to: tagged
                                }))
                            } else {
                                dispatch(setCollectionData(a = {
                                    name: collectionName,
                                    description: collectionAbout,
                                    display_type: displayVal,
                                }))
                            }
                            analytics().logEvent('CreateCollectionPressed');
                            setSelectionModal(true)
                        }}
                    />
                </KeyboardAwareScrollView>
                <Modal transparent={true} visible={visible} style={styles.mainview}>
                    <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", }}>
                        <View style={{ height: 150, width: '90%', backgroundColor: Appcolor.modal, alignItems: 'center' }}>
                            <Text style={[Commonstyles(Appcolor).mediumText18, { marginTop: 20, color: Appcolor.txt }]}>Uploading Media</Text>
                            <Text style={[Commonstyles(Appcolor).mediumText14, { marginVertical: 10, color: Appcolor.txt }]}>{parseInt((currentImageIndex / totalChunks) * 100)}%</Text>
                            {
                                currentImageIndex > 0 && totalChunks > 0 &&
                                <ProgressBar borderWidth={1} color={Appcolor.primary} progress={(currentImageIndex) / totalChunks} width={300} />
                            }
                        </View>
                    </Pressable>
                </Modal>
            </ImageBackground >

            {/* { fileUrl && <Video
        source={{ uri: fileUrl }}
        style={{ height: heightPercentageToDP(90) }}
        controls={true}
        resizeMode={'contain'}
      />} */}
        </View >
    )
}

export default CreateCollection

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