import { ActivityIndicator, Alert, Image, ImageBackground, Linking, NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import MasonryList from '@react-native-seoul/masonry-list';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import Btn from '../../components/Btn';
import DeleteBlock from '../../components/DeleteBlock';
import BackgroundService from 'react-native-background-actions';
import DocumentPicker, {
    DirectoryPickerResponse,
    DocumentPickerResponse,
    isCancel,
    isInProgress,
    types,
} from 'react-native-document-picker'
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import { baseUrl } from '../../apimanager/httpmanager';
import { getData } from '../../utils/asyncstore';
import showToast from '../../CustomToast';
import UploadLoader from '../../components/UploadLoader';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../redux/load';
import Video from 'react-native-video';
import GalleryLoader from '../../components/GalleryLoader';
import { Image as CompressorImage, Video as CompressorVideo } from 'react-native-compressor';
import FastImage from 'react-native-fast-image';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { setUploadTask } from '../../redux/uploadReducer';
import AppUtils from '../../utils/apputils';
import ImageCropPicker from 'react-native-image-crop-picker';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@react-navigation/native';
import { uploadToS3 } from '../../utils/uploadTos3';
import { createCollectionApi } from '../../apimanager/brandServices';

const ImageSelectionGalleryB = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const { Appcolor } = useTheme();

    const [cId, setCId] = useState("")
    const [token, setToken] = useState("");
    const [allMedia, setAllMedia] = useState([]);
    const [totalChunks, setTotalChunks] = useState(0);
    const [chunkIndex, setChunkIndex] = useState(0);
    const [uploadModal, setUploadModal] = useState(false);
    const [saveToLib, setSaveToLib] = useState(0)
    const [progress, setProgress] = useState(0);
    const [collectionData, setCollectionData] = useState(null);
    const chunkSize = 1;
    let isUploading = useSelector(state => state?.uploadReducer?.isUploading)
    const [selectingImg, setSelectingImg] = useState(false)
    const [compressTotal, setCompressTotal] = useState(0)
    const [compressCurrent, setCompressCurrent] = useState(0)
    const { Photopicker } = NativeModules;

    useEffect(() => {
        getToken()
    }, [])
    useEffect(() => {
        if (allMedia?.length > 0) {
            setSelectingImg(false)
        }
    }, [allMedia])
    useEffect(() => {
        if (route?.params?.picker == "camera") {
            setSaveToLib(1)
            setTimeout(() => {
                fromCamera()
            }, 1000);
        } else {
            setSaveToLib(0)
            setTimeout(async () => {
                fromGallery()
            }, 1000);
        }
    }, [route?.params?.picker])
    useEffect(() => {
        if (route?.params?.collectionId) {
            setCId(route?.params?.collectionId)
            return
        }
        if (route?.params) {
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

    const getToken = async () => {
        const tokens = await getData("@tokens");
        setToken(tokens)
    }
    const fromCamera = async () => {
        try {
            setSelectingImg(true)
            const result = await launchCamera({ mediaType: "mixed", formatAsMp4: true });
            if (result?.assets) {
                storeMedia(result?.assets)
            }
            if (result?.didCancel) {
                setSelectingImg(false)
            }
        } catch (e) {
            console.log(e);
        }
    }
    const fromGallery = () => {
        return new Promise(async (resolve, reject) => {
            try {
                let galleryPerm = await AppUtils.galleryPermisssion()
                if (!galleryPerm) {
                    Linking.openSettings()
                    return
                }
                if (Platform.OS == "ios") {
                    try {
                        setSelectingImg(true);
                        // Photopicker.pickImageWithCompletion()
                        const result = await launchImageLibrary({ selectionLimit: 100, mediaType: "mixed", formatAsMp4: true });
                        if (result?.assets) {
                            setAllMedia(result?.assets)
                        }
                        if (result?.didCancel) {
                            setSelectingImg(false)
                        }
                    } catch (e) {
                        console.log(e);
                        resolve(null)
                    }
                } else {
                    setSelectingImg(true);
                    let response = DocumentPicker.pick({
                        allowMultiSelection: true, copyTo: "cachesDirectory",
                        type: [DocumentPicker.types.images, DocumentPicker.types.video],
                    }).then((result) => {
                        storeMedia(result);
                        resolve(null)
                    }).catch(() => {
                        resolve(null)
                    })
                }
            } catch (error) {
                setSelectingImg(false);
                reject(error);
            }
        });
    }
    const storeMedia = useCallback((medias) => {
        let temp = [...allMedia]
        temp = temp.concat(medias)
        setAllMedia(temp)
    }, [allMedia])
    const deleteMedia = useCallback((item, index) => {
        let temp = [...allMedia]
        let filtered = temp.filter((data) => data != item)
        setAllMedia(filtered)
    }, [allMedia])
    const uploadCollection = async () => {
        let notDeletedMedias = allMedia?.filter(x => !x?.deleted)
        try {
            dispatch(setLoading(true))
            let res = await createCollectionApi({ ...collectionData })
            dispatch(setLoading(false))
            if (res?.data?.status) {
                setTimeout(() => {
                    divideArrayIntoChunks(notDeletedMedias, chunkSize, res?.data?.data?._id)
                }, 1000);
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const divideArrayIntoChunks = async (arr, batchSize, id) => {
        setSelectingImg(true)
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
                    id, cId, saveToLib
                },
            };
            if (isUploading) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
            }
            else {
                let data = [];
                console.log(options, "testing123456")
                let fileUri = options.parameters.unifiedBatches[0][0].uri;
                let extension = '.jpeg';
                let fileName = options.parameters.unifiedBatches[0][0].fileName + moment().unix()?.toString() + extension;
                let mime_type = options.parameters.unifiedBatches[0][0].type;
                await uploadToS3(fileUri, fileName, mime_type)
                console.log(`${'gallery/test/'}${fileName}`)
                data.push(`${'gallery/test/'}${fileName}`);
                let obj = {}
                if (route?.params?.collectionId) {
                    obj = {
                        collection_id: id,
                        type: 'update',
                        is_first_chunk: '0',
                        saveToLibrary: saveToLib?.toString(),
                    };
                }
                else {
                    obj = {
                        collection_id: id,
                        type: 'add',
                        is_first_chunk: '1',
                        saveToLibrary: saveToLib?.toString(),
                    };
                }
                const url = baseUrl + ('brand/update_media_array');
                const resp = await fetch(url, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...obj, data: JSON.stringify(data) }),
                });
                console.log(resp);
                if (!resp.ok) {
                    console.error(`HTTP error! Status: ${resp.status}`);
                    console.log(`${JSON.stringify(resp)}`);
                    return resp.status; // or throw an error
                }
                const responseBody = await resp.json(); // or response.text()
                console.log('Response:', responseBody);
                setSelectingImg(false)
                navigation?.navigate("BottomTabB");
                return responseBody;
            }
        }
    }


    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            <Header title={(cId ? "Update Collection" : "Create Collection") + ` (${allMedia?.length || 0})`} showBack={true} onBackPress={() => navigation?.goBack()} />
            {selectingImg && <GalleryLoader />}
            <FlashList
                data={allMedia}
                keyExtractor={(item) => item.uri?.toString()}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: heightPercentageToDP(18) }}
                estimatedItemSize={widthPercentageToDP(30)}
                numColumns={3}
                removeClippedSubviews={true}
                renderItem={({ item, index }) => {
                    return (
                        <ImgBlock
                            item={item} index={index}
                            onPressDelete={() => {
                                deleteMedia(item, index)
                            }}
                        />
                    )
                }}
            />
            <Btn title={"Post Collection"} twhite styleMain={{ position: "absolute", bottom: heightPercentageToDP(8), alignSelf: "center" }}
                onPress={() => {
                    if (allMedia?.length == 0) {
                        navigation?.goBack()
                        showToast("No media selected.")
                        return
                    }
                    if (cId != "") {
                        divideArrayIntoChunks(allMedia, chunkSize, cId)
                        return
                    }
                    uploadCollection()
                }}
            />
        </View>
    )
}

export default ImageSelectionGalleryB

const styles = StyleSheet.create({})

const ImgBlock = React.memo(({ item, onPressDelete }) => {
    const [isDeleted, setIsDeleted] = useState(false)
    const [isVideo, setIsVideo] = useState(false)
    const videoRef = useRef(null)

    useEffect(() => {
        if (item?.deleted) {
            setIsDeleted(true)
        } else {
            setIsDeleted(false)
        }
    }, [item])
    useEffect(() => {
        if (item?.type?.split("/")[0] == "video") {
            setIsVideo(true)

        } else {
            setIsVideo(false)
        }
    }, [item?.type])
    // useEffect(() => {
    //     if (videoRef?.current != null) {
    //         return
    //     }
    //     if (videoRef?.current && Platform?.OS == "ios") {
    //         videoRef?.current?.seek(4)
    //     }
    // }, [isVideo, videoRef])
    return (
        <View style={{ width: widthPercentageToDP(30), height: widthPercentageToDP(30), marginLeft: widthPercentageToDP(2), marginBottom: widthPercentageToDP(2), opacity: isDeleted ? 0.2 : 1, justifyContent: "center", alignItems: "center" }}>
            <DeleteBlock styleMain={{ position: "absolute", top: 0, right: 0, zIndex: 10 }} onPress={onPressDelete} />
            {isVideo && <Image source={Appimg.play} style={{ height: 40, width: 40, position: "absolute", zIndex: 10 }} />}
            {(isVideo && Platform?.OS == "ios") ?
                // <Video ref={videoRef} paused={true} source={{ uri: item?.uri }} style={{ borderRadius: 4, height: "100%", width: "100%" }} />
                <Image source={Appimg.logo} style={{ borderRadius: 4, height: "100%", width: "100%" }} />
                :
                <Image source={{ uri: item?.uri }} style={{ borderRadius: 4, height: "100%", width: "100%" }} />
            }
        </View>
    )
})