import { Alert, Image, Linking, NativeEventEmitter, NativeModules, Platform, Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import DeleteBlock from '../../components/DeleteBlock'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import CameraModal from '../../components/CameraModal'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import Btn from '../../components/Btn'
import { useDispatch, useSelector } from 'react-redux'
import { setUserGalleryLoader } from '../../redux/load'
import { FlashList } from '@shopify/flash-list'
import GalleryLoader from '../../components/GalleryLoader'
import AppUtils from '../../utils/apputils'
import DocumentPicker from 'react-native-document-picker'
import { setUploadTask } from '../../redux/uploadReducer'
import { useTheme } from '@react-navigation/native'
import moment from 'moment'
import { uploadToS3 } from '../../utils/uploadTos3'
import { baseUrl } from '../../apimanager/httpmanager'
import { getData } from '../../utils/asyncstore'
import showToast from '../../CustomToast'

const UserGalleryUpdate = ({ navigation }) => {
    const dispatch = useDispatch();
    const { Appcolor } = useTheme();

    const loader = useSelector(state => state?.load?.userGallery)
    const isUploading = useSelector(state => state?.uploadReducer?.isUploading)

    const chunkSize = 1;
    // const [token, setToken] = useState("")
    const [allImages, setAllImages] = useState(["Add"])
    const [progress, setProgress] = useState(0)
    const [chunkIndex, setChunkIndex] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);
    const [uploadModal, setUploadModal] = useState(false)
    const [showImages, setShowImages] = useState([])
    const [compressTotal, setCompressTotal] = useState(0)
    const [compressCurrent, setCompressCurrent] = useState(0)

    useEffect(() => {
        dispatch(setUserGalleryLoader(false))
    }, [allImages])

    // const { Photopicker } = NativeModules;

    // useEffect(() => {
    //     const eventEmitter = new NativeEventEmitter(Photopicker)
    //     eventEmitter.addListener('sendDataToJS', (i) => {
    //         dispatch(setUserGalleryLoader(false))
    //         console.log(allImages, "LLLLLLLGJGHFHGFJFGJ");
    //         setAllImages([...allImages, ...i])
    //     });

    //     return () => eventEmitter.removeAllListeners("sendDataToJS")
    // }, [Photopicker])
    // useEffect(() => {
    //     getToken()
    // }, [])

    // const getToken = async () => {
    //     const tokens = await getData("@tokens");
    //     setToken(tokens)
    // }
    // const veryIntensiveTask = async (taskDataArguments) => {
    //     await new Promise(async (resolve) => {

    //         divideArrayIntoGroups(allImages?.slice(1)?.filter(x => !x.deleted), chunkSize)
    //     });
    // };
    // const divideArrayIntoGroups = async (allMedia, batchSize) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const unifiedBatches = [];

    //             if (allMedia?.length < 1) {
    //                 resolve(null);
    //                 return;
    //             }

    //             for (let i = 0; i < allMedia.length; i += batchSize) {
    //                 const batch = allMedia.slice(i, i + batchSize);
    //                 unifiedBatches.push(batch);
    //             }

    //             if (unifiedBatches?.length) {
    //                 setTotalChunks(unifiedBatches?.length);
    //                 setUploadModal(true);

    //                 let res = await upload(unifiedBatches, 0, unifiedBatches?.length);
    //                 resolve(res);
    //             }
    //         } catch (error) {
    //             reject(error);
    //         }
    //     });
    // };
    // const upload = async (arr, current = 0, total) => {
    //     return new Promise(async (resolve, reject) => {
    //         let mediaArray = [];
    //         let mediaChunk = arr[current];

    //         if (!mediaChunk) {
    //             uploadDiscontinued();
    //             resolve("")
    //             return;
    //         }

    //         setChunkIndex(current);

    //         try {
    //             for (let i = 0; i < mediaChunk.length; i++) {
    //                 const mediaItem = mediaChunk[i];
    //                 let path = Platform?.OS == 'ios' ? mediaItem?.uri.replace('file://', '') : mediaItem?.uri;
    //                 const mediaObject = {
    //                     filename: moment().unix() + '.' + mediaItem.type?.split('/')[1],
    //                     type: mediaItem.type,
    //                     data: decodeURIComponent(RNFetchBlob.wrap(path)),
    //                     name: 'collection_media',
    //                 };
    //                 mediaArray.push(mediaObject);
    //             }

    //             let serverRes = await uploadToServer(mediaArray);
    //             console.log(serverRes);

    //             if (serverRes?.respInfo?.status == 200) {
    //                 if (current < total) {
    //                     upload(arr, current + 1, total)
    //                 } else {
    //                     uploadDiscontinued()
    //                     resolve(serverRes);
    //                 }
    //             } else {
    //                 reject(new Error('Server response status is not 200'));
    //             }
    //         } catch (error) {
    //             reject(error);
    //         }
    //     });
    // };
    // const uploadToServer = async (arr) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let res = await RNFetchBlob.config({}).fetch('POST', (baseUrl + 'stylist/add_gallery_media'), {
    //                 Authorization: `Bearer ${token}`,
    //                 'Content-Type': 'multipart/form-data',
    //             }, arr).uploadProgress((written, total) => {
    //                 setProgress((written / total));
    //                 // console.log('uploaded', written / total, written, total);
    //             });
    //             resolve(res);
    //         } catch (error) {
    //             console.error(error, 'uploadesss');
    //             showToast('Something went wrong, please try again.');
    //             reject(error);
    //         }
    //     });
    // };
    const divideArrayIntoGroups = async (allMedia, batchSize) => {
        dispatch(setUserGalleryLoader(true))
        const unifiedBatches = [];
        if (allMedia?.length < 1) {
            return
        }
        for (let i = 0; i < allMedia.length; i += batchSize) {
            const batch = allMedia.slice(i, i + batchSize);
            unifiedBatches.push(batch);
        }
        if (unifiedBatches?.length) {
            setTotalChunks(unifiedBatches?.length)
            // setUploadModal(true)
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
                    unifiedBatches: unifiedBatches,
                    type: 'Gallery'
                },
            };
            if (isUploading) {
                Alert.alert('Upload in progress', "Please wait for current uploading")
            }
            else {
                const token = await getData("@tokens");
                    let data = [];
                    console.log(options,"testing123456")
                    console.log(options.parameters.unifiedBatches[0][0],"testing123456")
                    let fileUri = options.parameters.unifiedBatches[0][0].uri;
                    let extension = '.jpeg';
                     let fileName = options.parameters.unifiedBatches[0][0].fileName + moment().unix()?.toString() + extension;
                    let mime_type = options.parameters.unifiedBatches[0][0].type;
                    console.log(fileUri,fileName,mime_type,"helloooooo")
    
                    await uploadToS3(fileUri, fileName, mime_type)
                    console.log(`${'gallery/test/'}${fileName}`)
                    data.push(`${'gallery/test/'}${fileName}`);
                    let obj = {
                        collection_id: "",
                          type: 'Gallery',
                          is_first_chunk: '0',
                          saveToLibrary: "0",
                        };
                      console.log(obj,"obj here")
                    //   type === 'Gallery'
                    //   ? 'stylist/update_gallery_media'
                    //   : 
                      const url =
                      baseUrl +
                      ('stylist/update_gallery_media');
                    // console.log(type, "typeeeee");
          
                    console.log(url, "urlurlurlurl");
                    console.log({ ...obj, data: JSON.stringify(data) }, "data to send ");
          
          
                    const resp = await fetch(url, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ ...obj, data: JSON.stringify(data) }),
                    });
          
                    if (!resp.ok) {
                      console.error(`HTTP error! Status: ${resp.status}`);
                      return resp.status; // or throw an error
                    }
          
                    const responseBody = await resp.json(); // or response.text()
          
                    console.log('Response:', responseBody);
                    dispatch(setUserGalleryLoader(false))
                    navigation?.navigate("BottomTabS");
                    return responseBody;
    
                    console.log(options.parameters.unifiedBatches[0],"testing123456")
                    // dispatch(setUploadTask(options))
                    // navigation?.navigate("BottomTabS");
       





                // dispatch(setUploadTask(options))
                // navigation?.navigate("BottomTabS");
            }
        }
    }
    // const upload = async (arr, current = 0, total) => {
    //     let mediaArray = [];
    //     let mediaChunk = arr[current]
    //     if (!mediaChunk) {

    //         uploadDiscontinued()
    //     }

    //     setChunkIndex(current)
    //     try {
    //         for (let i = 0; i < mediaChunk.length; i++) {
    //             const mediaItem = mediaChunk[i];
    //             let path = Platform?.OS == "ios" ? mediaItem?.uri.replace('file://', '') : mediaItem?.uri
    //             const mediaObject = {
    //                 filename: moment().unix() + "." + mediaItem.type?.split("/")[1],
    //                 type: mediaItem.type,
    //                 data: decodeURIComponent(RNFetchBlob.wrap(path)),
    //                 name: "collection_media"
    //             };
    //             mediaArray.push(mediaObject)
    //         }
    //         let serverRes = await uploadToServer(mediaArray)
    //         if (serverRes?.respInfo?.status == 200) {
    //             if (current < total) {
    //                 upload(arr, (current + 1), total)
    //             } else {
    //                 uploadDiscontinued()
    //             }
    //         }
    //     } catch (e) {
    //     }
    // }
    // const uploadToServer = async (arr) => {
    //     try {
    //         let res = await RNFetchBlob.config({
    //         }).fetch('POST', (baseUrl + "stylist/add_gallery_media"), {
    //             Authorization: `Bearer ${token}`,
    //             'Content-Type': 'multipart/form-data',
    //         }, arr).uploadProgress((written, total) => {
    //             setProgress((written / total))
    //             // console.log('uploaded', written / total, written, total);
    //         })
    //         return res
    //     } catch (e) {
    //         console.log(e, "uploadesss");
    //         showToast("Something went wrong please try again.")
    //     }
    // }
    // const uploadDiscontinued = async () => {
    //     setUploadModal(false)
    //     setChunkIndex(0);
    //     setTotalChunks(0);
    //     await BackgroundService.stop();
    //     navigation?.goBack();
    // }
    // const addMoreImages = useCallback(() => {
    //     let temp = [...allImages]
    //     let prvData = [...showImages]
    //     let newa = []
    //     console.log("hrere", temp?.length, prvData?.length);
    //     let sliceInd = prvData?.length
    //     if (temp?.length > sliceInd) {
    //         console.log(temp);
    //         newa = temp.slice(sliceInd, sliceInd + 10)
    //         console.log(newa);
    //         prvData = prvData.concat(newa)
    //         console.log("finallly", newa?.length, prvData?.length);
    //         setShowImages([...prvData])
    //     }
    // }, [allImages, showImages])
    // const compressionFunction = async (data) => {
    //     let temp = [...allImages]
    //     setCompressTotal(data?.length)
    //     for (const [index, e] of data.entries()) {
    //         setCompressCurrent(index)
    //         let x = { ...e }
    //         if (e?.type?.split("/")[0] == "image") {
    //             let result = await CompressorImage.compress(e?.uri);
    //             x = { ...e, uri: result }
    //         } else {
    //             let result = await Video.compress(
    //                 e?.uri,
    //                 {
    //                     compressionMethod: 'manual',
    //                     quality: 0.7
    //                 },
    //                 (progress) => {
    //                     console.log('Compression Progress: ', progress);
    //                 }
    //             );
    //             x = { ...e, uri: result }
    //         }
    //         temp.push(x)
    //     }
    //     setAllImages(temp)
    //     dispatch(setUserGalleryLoader(false))
    // }
    const _renderItem = ({ item, index }) => {
        return (
            <ImgBlock
                // Photopicker={Photopicker} 
                item={item} index={index}
                onPressDelete={(deleteIndex) => {
                    let temp2 = [...allImages]
                    let filtered = temp2.filter((data) => data != item)
                    setAllImages(filtered)
                }}
                attachments={(data => {
                    // compressionFunction(data)
                    // return
                    let temp = [...allImages]?.concat(data)
                    setAllImages(temp)
                    dispatch(setUserGalleryLoader(false))
                })}
            />
        )
    }

    return (
        <View style={{ backgroundColor: Appcolor.blackcolor, flex: 1 }}>
            <Header title={`Edit Gallery ${(allImages?.length - 1 > 0 ? allImages?.length - 1 : "")}`} showBack={true} onBackPress={() => { navigation?.goBack(); dispatch(setUserGalleryLoader(false)) }} />
            {/* <UploadLoader batchSize={chunkSize} current={chunkIndex} total={totalChunks} totalImg={(allImages?.length - 1)} visible={uploadModal} progress={progress} /> */}
            {loader === true ?
                <GalleryLoader total={compressTotal} current={compressCurrent} />
                :
                <>
                    <FlashList
                        numColumns={3}
                        data={allImages}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: heightPercentageToDP(16) }}
                        renderItem={_renderItem}
                        removeClippedSubviews={true}
                        estimatedItemSize={widthPercentageToDP(29)}
                    />
                    <Btn title={"Upload"} twhite styleMain={{ position: "absolute", alignSelf: "center", bottom: heightPercentageToDP(8) }}
                        onPress={async () => {
                            console.log("testinggg in user gallery")
                           if (allImages.length > 1){
                            divideArrayIntoGroups(allImages?.slice(1), chunkSize)
                            }
                            else{
                                console.log("testinggg in user gallery")
                                showToast('No Media Selected');
                            }
                            
                            // await BackgroundService.start(veryIntensiveTask, options);
                            //  await BackgroundService.updateNotification({ taskDesc: 'Uploading Please wait' });
                            //  return
                        }}
                    />
                </>
            }
        </View>
    )
}

export default UserGalleryUpdate

const styles = StyleSheet.create({
    blockSize: {
        height: widthPercentageToDP(29),
        width: widthPercentageToDP(29),
        resizeMode: "contain",
        borderRadius: 4,
        marginLeft: widthPercentageToDP(4),
    },
})

const ImgBlock = React.memo(({ item, index, onPress, onPressDelete, attachments, Photopicker }) => {
    const deleteItem = () => {
        if (item?.deleted) {
            return
        }
        return (
            Alert.alert("Are you sure?", "You want to delete this image",
                [
                    { text: "Yes", onPress: () => { onPressDelete(index) } },
                    { text: "No" }
                ]
            )
        )
    }
    if (item == "Add") {
        return <UploadBlock attachments={attachments} Photopicker={Photopicker} />
    }
    return (
        <Pressable style={{ marginBottom: 16, opacity: item?.deleted ? 0.4 : 1, justifyContent: 'center', alignItems: "center" }}>
            {item?.type?.split("/")[0] == "video" && <Pressable style={{ height: 40, width: 40, position: 'absolute', zIndex: 10 }}>
                <Image source={Appimg.play} style={{ height: "100%", width: "100%" }} />
            </Pressable>}
            {item?.type?.split("/")[0] == "video" ?
                <Image source={Appimg.logo} style={styles.blockSize} />
                :
                <Image source={{ uri: item?.uri }} style={styles.blockSize} />
            }
            <DeleteBlock styleMain={{ position: "absolute", right: 6, top: 2 }}
                onPress={() => {
                    onPressDelete(index)
                }}
            />
        </Pressable>
    )
})

const UploadBlock = React.memo(({ attachments, Photopicker }) => {
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [isSelecting, setIsSelecting] = useState(false)
    const dispatch = useDispatch()

    const closeModal = () => {
        setShowCameraModal(false)
    };
    const fromCamera = async () => {
        let cameraPerm = await AppUtils.cameraPermisssion()
        if (!cameraPerm) {
            Linking.openSettings()
            return
        }
        try {
            dispatch(setUserGalleryLoader(true))
            const result = await launchCamera({ mediaType: "mixed", maxHeight: 1024, maxWidth: 1024 });
            if (result?.assets) {
                attachments(result?.assets)
            }
            if (result?.didCancel) {
                dispatch(setUserGalleryLoader(false))
            }
        } catch (e) {
            console.log(e);
        }
    };
    const fromGallery = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let galleryPerm = await AppUtils.galleryPermisssion()
                if (!galleryPerm) {
                    Linking.openSettings()
                    return
                }
                if (Platform.OS == "ios") {
                    dispatch(setUserGalleryLoader(true))
                    // Photopicker?.pickImageWithCompletion()
                    const result = await launchImageLibrary({
                        selectionLimit: 100, mediaType: "mixed",
                        // maxHeight: 1024, maxWidth: 1024
                    });
                    if (result?.assets) {
                        attachments(result?.assets)
                    }
                    if (result?.didCancel) {
                        dispatch(setUserGalleryLoader(false))
                    }
                } else {
                    // dispatch(setUserGalleryLoader(true))
                    let response = DocumentPicker.pick({
                        allowMultiSelection: true, copyTo: "cachesDirectory",
                        type: [DocumentPicker.types.images, DocumentPicker.types.video],
                    }).then((result) => {
                        attachments(result);
                        resolve(null)
                    }).catch(() => {
                        dispatch(setUserGalleryLoader(false))
                        resolve(null)
                    })
                }
            } catch (error) {
                console.log(error);
                dispatch(setUserGalleryLoader(false))

                // setSelectingImg(false);
                reject(error);
            }
        });
        // let galleryPerm = await AppUtils.galleryPermisssion()
        // if (!galleryPerm) {
        //     Linking.openSettings()
        //     return
        // }
        // try {
        //     dispatch(setUserGalleryLoader(true))
        //     const result = await launchImageLibrary({
        //         selectionLimit: 100, mediaType: "mixed",
        //         // maxHeight: 1024, maxWidth: 1024
        //     });
        //     if (result?.assets) {
        //         attachments(result?.assets)
        //     }
        //     if (result?.didCancel) {
        //         dispatch(setUserGalleryLoader(false))
        //     }
        // } catch (e) {
        //     console.log(e);
        // }
    };
    return (
        <Pressable
            onPress={() =>  fromCamera('photo')}
        >
            <CameraModal visible={showCameraModal} onPressCancel={() => closeModal()}
                onPressCamera={() => {
                    closeModal()
                    setTimeout(() => {
                        fromCamera('photo')
                    }, 400);
                }}
                onPressGallery={() => {
                    closeModal()
                    setTimeout(() => {
                        fromGallery('photo')
                    }, 400);
                }}
            />
            <Image source={Appimg?.upload} style={styles.blockSize} />
        </Pressable>
    )
})