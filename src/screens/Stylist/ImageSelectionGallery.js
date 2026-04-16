// import { ActivityIndicator, Alert, FlatList, Image, ImageBackground, Linking, NativeEventEmitter, NativeModules, Platform, StyleSheet, Text, View } from 'react-native'
// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import Appimg from '../../constants/Appimg';
// import Header from '../../components/Header';
// import MasonryList from '@react-native-seoul/masonry-list';
// import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
// import Btn from '../../components/Btn';
// import DeleteBlock from '../../components/DeleteBlock';
// import BackgroundService from 'react-native-background-actions';
// import DocumentPicker, {
//     DirectoryPickerResponse,
//     DocumentPickerResponse,
//     isCancel,
//     isInProgress,
//     types,
// } from 'react-native-document-picker'
// import moment from 'moment';
// import RNFetchBlob from 'rn-fetch-blob';
// import { baseUrl } from '../../apimanager/httpmanager';
// import { getData } from '../../utils/asyncstore';
// import showToast from '../../CustomToast';
// import UploadLoader from '../../components/UploadLoader';
// import { createCollectionApi } from '../../apimanager/httpServices';
// import { useDispatch, useSelector } from 'react-redux';
// import { setLoading } from '../../redux/load';
// import Video from 'react-native-video';
// import GalleryLoader from '../../components/GalleryLoader';
// import { Image as CompressorImage, Video as CompressorVideo } from 'react-native-compressor';
// import FastImage from 'react-native-fast-image';
// import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
// import { setUploadTask } from '../../redux/uploadReducer';
// import AppUtils from '../../utils/apputils';
// import ImageCropPicker from 'react-native-image-crop-picker';
// import { FlashList } from '@shopify/flash-list';
// import { useTheme } from '@react-navigation/native';

// const ImageSelectionGallery = ({ navigation, route }) => {
//     const dispatch = useDispatch();
//     const { Appcolor } = useTheme();

//     const [cId, setCId] = useState("")
//     const [token, setToken] = useState("");
//     const [allMedia, setAllMedia] = useState([]);
//     const [totalChunks, setTotalChunks] = useState(0);
//     const [chunkIndex, setChunkIndex] = useState(0);
//     const [uploadModal, setUploadModal] = useState(false);
//     const [saveToLib, setSaveToLib] = useState(0)
//     const [progress, setProgress] = useState(0);
//     const [collectionData, setCollectionData] = useState(null);
//     const chunkSize = 1;
//     let isUploading = useSelector(state => state?.uploadReducer?.isUploading)
//     const [selectingImg, setSelectingImg] = useState(false)
//     const [compressTotal, setCompressTotal] = useState(0)
//     const [compressCurrent, setCompressCurrent] = useState(0)
//     const { Photopicker } = NativeModules;
//     const [originalArray, setoriginalArray] = useState([])
//     const [temitem, settemitem] = useState({})

//     useEffect(() => {
//         const eventEmitter = new NativeEventEmitter(Photopicker)

//         eventEmitter.addListener('sendDataToJS', (i) => { 
//             console.log(i,"image url",typeof i[0], typeof i[1])
            
           
//             uploadCollection([...i[0]])

//             setSelectingImg(false);
//         });
//     }, [Photopicker])


//     console.log(route?.params,"route");
//     useEffect(() => {
//         getToken()
//     }, [])
//     useEffect(() => {
//         if (allMedia?.length > 0) {
//             setSelectingImg(false)
//         }
//     }, [allMedia])

//     useEffect(() => {
//         if (route?.params?.collectionId) {
//             setCId(route?.params?.collectionId)
//             return
//         }
//         if (route?.params) {
//             if (route?.params?.displayVal != "public") {
//                 setCollectionData({
//                     name: route?.params?.collectionName,
//                     description: route?.params?.collectionAbout,
//                     display_type: route?.params?.displayVal,
//                     display_to: route?.params?.tagged
//                 })
//             } else {
//                 setCollectionData({
//                     name: route?.params?.collectionName,
//                     description: route?.params?.collectionAbout,
//                     display_type: route?.params?.displayVal
//                 })
//             }
//         }
//     }, [route?.params])
//     useEffect(() => {
//         if (route?.params?.picker == "camera") {
//             setSaveToLib(1)
//             setTimeout(() => {
//                 fromCamera()
//             }, 1000);
//         } else {
//             setSaveToLib(0)
//             setTimeout(async () => {
//                 fromGallery()
//             }, 1000);
//         }
//     }, [route?.params?.picker])
    

//     const getToken = async () => {
//         const tokens = await getData("@tokens");
//         setToken(tokens)
//     }
//     // const fromGallery = async () => {
//     //     setSelectingImg(true)
//     //     const result = await launchImageLibrary({ selectionLimit: 100, mediaType: "mixed", formatAsMp4: true });
//     //     if (result?.assets) {
//     //         // compressionFunction(result?.assets)
//     //         storeMedia(result?.assets)
//     //     }
//     //     if (result?.didCancel) {
//     //         setSelectingImg(false)
//     //     }
//     // };
//     const fromGallery = () => {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 let galleryPerm = await AppUtils.galleryPermisssion()
//                 if (!galleryPerm) {
//                     Linking.openSettings()
//                     return
//                 }
//                 if (Platform.OS == "ios") {
//                     try {
//                         setSelectingImg(true);
//                     showToast("Here crashing")
//                         Photopicker.openPicker()
//                         // Photopicker.pickImageWithCompletion()

//                         // ImageCropPicker.openPicker({
//                         //     mediaType: "any",
//                         //     multiple:"true",
//                         //     maxFiles: 100

//                         // }).then((image) => {
//                         //     console.log("images >> ",image)
//                         //     setSelectingImg(false);
//                         //         storeMedia(image);
//                         //         resolve(null)
//                         // }).catch((error) => {
//                         //     console.log(error)
//                         //     resolve(null)
//                         // });
                       
//                     } catch (e) {
//                         console.log(e);
//                         resolve(null)
//                     }
//                 } else {
//                     setSelectingImg(true);
//                     let response = DocumentPicker.pick({
//                         allowMultiSelection: true, copyTo: "cachesDirectory",
//                         type: [DocumentPicker.types.images, DocumentPicker.types.video],
//                     }).then((result) => {
//                         storeMedia(result);
//                         resolve(null)
//                     }).catch(() => {
//                         resolve(null)
//                     })
//                 }
//             } catch (error) {
//                 setSelectingImg(false);
//                 reject(error);
//             }
//         });
//     };
//     const veryIntensiveTaskGallery = async (taskDataArguments) => {
//         await new Promise(async (resolve) => {
//             const { } = taskDataArguments;
//             fromGallery().then(async i =>
//             // Alert.alert('done')
//             {
//                 await BackgroundService.stop()

//                 resolve(i)
//             }
//             ).catch(async e => {
//                 await BackgroundService.stop()


//                 // Alert.alert('notdone')
//             })
//         });
//     };
//     const fromCamera = async () => {
//         try {
//             setSelectingImg(true)
//             const result = await launchCamera({ mediaType: "mixed", formatAsMp4: true });
//             if (result?.assets) {
//                 storeMedia(result?.assets)
//             }
//             if (result?.didCancel) {
//                 setSelectingImg(false)
//             }
//         } catch (e) {
//             console.log(e);
//         }
//     };
//     const storeMedia = useCallback((medias) => {
//         let temp = [...allMedia]
//         temp = temp.concat(medias)
//         setAllMedia(temp)
//     }, [allMedia])
//     const deleteMedia = useCallback((item, index) => {
//         let temp = [...allMedia]
//         let temp1= [...originalArray]
//         let filtered = temp.filter((data) => data != item)
//         setAllMedia(filtered)
//     }, [allMedia])
//     const uploadCollection = async (data) => {
//         let notDeletedMedias=[]
//         if(data?.length>0){
//              notDeletedMedias = data?.filter(x => !x?.deleted)
//         }else{
//              notDeletedMedias = allMedia?.filter(x => !x?.deleted)
//         }
        
//         try {
//             dispatch(setLoading(true))
//             let res = await createCollectionApi({ ...collectionData })
//             dispatch(setLoading(false))
//             if (res?.data?.status) {
//                 setTimeout(() => {
//                     divideArrayIntoChunks(notDeletedMedias, chunkSize, res?.data?.data?._id)
//                 }, 1000);
//                 // setCId(res?.data?.data?._id)
//             } else {
//                 showToast(res?.data?.message || "Something went wrong.")
//             }
//         } catch (e) {
//             dispatch(setLoading(false))
//         } finally {
//         }
//     }
//     const veryIntensiveTask = async (taskDataArguments) => {
//         await new Promise(async (resolve) => {
//             const { unifiedBatches, id } = taskDataArguments;
//             upload(unifiedBatches, 0, unifiedBatches?.length, id).then(async i => {
//                 await BackgroundService.stop()
//                 resolve(i)
//             }
//             ).catch(async e => {
//                 console.log("exception >> ", e)
//                 await BackgroundService.stop()
//             })
//         });
//     };

//     const divideArrayIntoChunks = async (arr, batchSize, id) => {
//         const unifiedBatches = [];
//         if (arr?.length < 1) {
//             return
//         }
//         for (let i = 0; i < arr.length; i += batchSize) {
//             const batch = arr.slice(i, i + batchSize);
//             unifiedBatches.push(batch);
//         }
//         if (unifiedBatches?.length) {
//             setTotalChunks(unifiedBatches?.length)
//             // setUploadModal(true)
//             const options = {
//                 taskName: 'Uploading media',
//                 taskTitle: 'Uploading media',
//                 taskDesc: 'Uploading Please wait',
//                 taskIcon: {
//                     name: 'ic_launcher',
//                     type: 'mipmap',
//                 },
//                 color: '#ff00ff',
//                 linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
//                 parameters: {
//                     delay: 1000,
//                     unifiedBatches,
//                     id, cId, saveToLib
//                 },
//             };
//             if (let isUploading = useSelector(state => state?.uploadReducer?.isUploading);  isUploadingNative) {
//                 Alert.alert('Upload in progress', "Please wait for current uploading")
//             }
//             else {
//                 console.log(options);
//                dispatch(setUploadTask(options))
//                navigation?.navigate("BottomTabS");
//             }
//         }
//     }
//     const requestExternalStoragePermission = async () => {
//         const status = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
//         if (status !== RESULTS.GRANTED) {
//             const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
//             if (result !== RESULTS.GRANTED) {
//                 // Handle permission denial
//                 console.error('Permission denied for reading external storage.');
//                 return false;
//             }
//         }
//         return true;
//     };
//     useEffect(() => {
//         Platform.OS == 'android' && requestExternalStoragePermission()
//     }, [])
//     const uploads = async (arr, current = 0, total, id) => {
//         let mediaArray = [];
//         let mediaChunk = arr[current]
//         if (id == "") {
//             uploadDiscontinued()
//         }
//         if (!mediaChunk) {
//             uploadDiscontinued()
//         }
//         if (cId != "") {
//             mediaArray.push({ name: "collection_id", data: id }, { name: "type", data: "update" }, { name: "is_first_chunk", data: "0" }, { name: "saveToLibrary", data: saveToLib?.toString() })
//         } else {
//             mediaArray.push({ name: "collection_id", data: id }, { name: "type", data: "add" }, { name: "is_first_chunk", data: current == 0 ? "1" : "0" }, { name: "saveToLibrary", data: saveToLib?.toString() })
//         }
//         setChunkIndex(current)
//         try {
//             for (let i = 0; i < mediaChunk.length; i++) {
//                 const mediaItem = mediaChunk[i];
//                 let path = Platform?.OS == "ios" ? mediaItem?.uri.replace('file://', '') : mediaItem?.uri
//                 const mediaObject = {
//                     filename: mediaItem.fileName || Math.floor((Math.random() * 100000) + 10000) + "." + mediaItem.type?.split("/")[1],
//                     type: mediaItem.type,
//                     data: mediaItem?.uri,
//                     name: "collection_media"
//                 };
//                 mediaArray.push(mediaObject)
//             }
//             let serverRes = await uploadToServer(mediaArray)
//             if (serverRes?.respInfo?.status == 200) {
//                 console.log(serverRes, "----", current, total)
//                 if (current < total) {
//                     upload(arr, (current + 1), total, id)
//                 } else {
//                     uploadDiscontinued()
//                 }
//             }
//         } catch (e) {
//         }
//     }
//     const upload = async (arr, current = 0, total, id) => {
//         return new Promise(async (resolve, reject) => {
//             let mediaArray = [];
//             let mediaChunk = arr[current];

//             if (id === "") {
//                 resolve(uploadDiscontinued())
//             }

//             if (!mediaChunk) {
//                 resolve(uploadDiscontinued())

//             }

//             if (cId !== "") {
//                 mediaArray.push(
//                     { name: "collection_id", data: id },
//                     { name: "type", data: "update" },
//                     { name: "is_first_chunk", data: "0" },
//                     { name: "saveToLibrary", data: saveToLib?.toString() }
//                 );
//             } else {
//                 mediaArray.push(
//                     { name: "collection_id", data: id },
//                     { name: "type", data: "add" },
//                     { name: "is_first_chunk", data: current === 0 ? "1" : "0" },
//                     { name: "saveToLibrary", data: saveToLib?.toString() }
//                 );
//             }

//             setChunkIndex(current);

//             try {
//                 for (let i = 0; i < mediaChunk.length; i++) {
//                     const mediaItem = mediaChunk[i];
//                     console.log(mediaItem, "  uri >>>>>>>>>>>.")

//                     let path =
//                         Platform.OS === "ios"
//                             ? mediaItem?.uri?.replace("file://", "")
//                             : (await RNFetchBlob.fs.stat(mediaItem?.uri)).path;
//                     console.log(path, "bjbjbj")
//                     let finalPath = RNFetchBlob.wrap(path).replace('file://file:///', 'file:///');
//                     const mediaObject = {
//                         filename:
//                             mediaItem.name ||
//                             Math.floor(Math.random() * 100000 + 10000) +
//                             "." +
//                             mediaItem.type?.split("/")[1],
//                         type: mediaItem.type,
//                         data: finalPath,
//                         name: "collection_media",
//                     };

//                     mediaArray.push(mediaObject);
//                 }
//                 console.log("uploadToServer >> before")
//                 let serverRes = await uploadToServer(mediaArray);
//                 console.log("uploadToServer res>> ", serverRes)
//                 if (serverRes?.respInfo?.status === 200) {
//                     console.log(serverRes, "----", current, total);
//                     if (current < total) {
//                         resolve(upload(arr, current + 1, total, id, cId, saveToLib));
//                         console.log("uploadToServer json resolveee>> ")
//                     } else {
//                         resolve(uploadDiscontinued())
//                         console.log("uploadDiscontinued>>>> ")
//                     }
//                 } else if (JSON.stringify(serverRes).includes("Broken pipe") || JSON.stringify(serverRes).includes("unexpected end of stream")) {
//                     resolve(upload(arr, current + 1, total, id, cId, saveToLib));
//                 }
//             } catch (error) {
//                 reject(error);
//             }
//         });
//     };

//     const uploadToServer = async (arr) => {
//         console.log(arr, "uploading to server");
//         console.log(arr, "array to upload****&*&*&*&*&*&*&*&*&*&*&*&")
//         try {
//             let res = await RNFetchBlob.config({ timeout: 30 * 60 * 1000 })
//                 .fetch(
//                     'POST',
//                     (baseUrl + "stylist/upload_media_array"),
//                     { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data', },
//                     arr
//                 ).uploadProgress((written, total) => {
//                     console.log("progresss >>  ", (written / total));
//                     setProgress((written / total))
//                 })
//                 .catch(e => {
//                     console.log(e, "sdf");

//                     return e.message
//                 })
//             return res
//         } catch (e) {
//             console.log(e, "uploadesss");
//             showToast("Something went wrong please try again.")
//         }
//     }

//     const uploadFiles = async (array) => {
//         let arr = [];
//         for (let index = 0; index < array.length; index++) {
//             const element = array[index];
//             let mime = element?.mime ?? element?.type ?? "image/jpg"
//             let path = element?.path ?? element?.uri ?? ""
//             const newPath = Platform.OS == 'android' ? (await RNFetchBlob.fs.stat(path)).path : path
//             let fileName = element?.name ?? element?.filename ?? moment().unix() + "." + mime?.split("/")[1]
//             if (path != "") {
//                 let obj = {
//                     filename: fileName,
//                     data: decodeURIComponent(RNFetchBlob.wrap(newPath).replace('file://file:///', 'file:///')),
//                     type: mime,
//                 };
//                 arr.push({ ...obj, name: "common_media" });
//             }
//         }

//         let response = await RNFetchBlob.fetch(
//             "POST",
//             ("https://apidev.letsvibe.io/api/v1/common/upload_media"),
//             {
//                 "Content-Type": "multipart/form-data",
//             },
//             arr
//         ).then(i => {
//             return i.data
//         })
//         return JSON.parse(response)
//     }
//     const uploadDiscontinueds = () => {
//         setUploadModal(false)
//         setChunkIndex(0);
//         setTotalChunks(0);
//         navigation?.navigate("BottomTabS");
//     }
//     const uploadDiscontinued = () => {
//         return new Promise((resolve) => {
//             setUploadModal(false);
//             setChunkIndex(0);
//             setTotalChunks(0);
//             navigation?.navigate("BottomTabS");
//             resolve();
//         });
//     };

//     const compressionFunction = async (data) => {
//         let temp = []
//         setCompressTotal(data?.length)
//         for (const [index, e] of data.entries()) {
//             setCompressCurrent(index)
//             let x = { ...e }
//             if (e?.type?.split("/")[0] == "image") {
//                 let result = await CompressorImage.compress(e?.uri);
//                 x = { ...e, uri: result }
//             } else {
//                 let result = await CompressorVideo.compress(
//                     e?.uri,
//                     {
//                         compressionMethod: 'manual',
//                         quality: 0.7
//                     },
//                     (progress) => {
//                         console.log('Compression Progress: ', progress);
//                     }
//                 );
//                 x = { ...e, uri: result }
//             }
//             temp.push(x)
//         }
//         storeMedia(temp)
//         // setAllImages(temp)
//     }

//     return (
//         <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
//             {/* <UploadLoader batchSize={chunkSize} current={chunkIndex} total={totalChunks} visible={uploadModal} progress={progress} totalImg={allMedia?.length} /> */}
//             <Header title={(cId ? "Update Collection" : "Create Collection") + ` (${allMedia?.length || 0})`} showBack={true} onBackPress={() => navigation?.goBack()} />
//             {/* {uploadModal && <UploadLoader current={chunkIndex} total={totalChunks} totalImg={(allMedia?.length - 1)} visible={uploadModal} progress={progress} />} */}
//             {selectingImg && <GalleryLoader />}
//             <FlatList
//                 data={allMedia}
//                 // initialNumToRender={20}
//                 keyExtractor={(item,index) => index?.toString()}
//                 contentContainerStyle={{ marginTop: 10, paddingBottom: heightPercentageToDP(18) }}
//                 numColumns={3}
//                 renderItem={({ item, index }) => {
//                     return (
//                         <ImgBlock
//                             item={ temitem?.uri?temitem:item} index={index}
//                             onPressDelete={() => {
//                                 // console.log(originalArray[1],index);
//                                 // console.log( typeof originalArray);
//                                 // console.log( typeof originalArray);


//                                let all =[...allMedia]
//                                all[index] = {...all[index],smallUri:all[index].originalUri}
//                                setAllMedia([...all])
//                               //  settemitem(originalArray[i])
//                                // deleteMedia(item, index)
//                             }}
//                         />
//                     )
//                 }}
//             />
//             <Btn title={"Post Collection"} twhite styleMain={{ position: "absolute", bottom: heightPercentageToDP(8), alignSelf: "center" }}
//                 onPress={() => {
//                     if (allMedia?.length == 0) {
//                         navigation?.goBack()
//                         showToast("No media selected.")
//                         return
//                     }
//                     if (cId != "") {
//                         // divideArrayIntoChunks(allMedia?.filter(x => !x?.deleted), chunkSize, cId)
//                         divideArrayIntoChunks(allMedia, chunkSize, cId)
//                         return
//                     }
//                     uploadCollection()
//                 }}
//             />
//         </View>
//     )
// }

// export default ImageSelectionGallery

// const styles = StyleSheet.create({})

// const TextBlock = ({ item, index }) => {
//     return (
//         <View style={{ flexDirection: "row" }}>
//             <Image source={{ uri: item?.uri }} style={{ borderRadius: 4, height: 20, width: 20 }} />
//             <Text style={{ color: "white" }}>{item?.fileName}</Text>
//         </View>
//     )
// }

// const ImgBlock = React.memo(({ item, onPressDelete }) => {
//     const [isDeleted, setIsDeleted] = useState(false)
//     const [isVideo, setIsVideo] = useState(false)
//     const videoRef = useRef(null)

//     useEffect(() => {
//         if (item?.deleted) {
//             setIsDeleted(true)
//         } else {
//             setIsDeleted(false)
//         }
//     }, [item])
//     useEffect(() => {
//         if (item?.type?.split("/")[0] == "video") {
//             setIsVideo(true)

//         } else {
//             setIsVideo(false)
//         }
//     }, [item?.type])
//     // useEffect(() => {
//     //     if (videoRef?.current != null) {
//     //         return
//     //     }
//     //     if (videoRef?.current && Platform?.OS == "ios") {
//     //         videoRef?.current?.seek(4)
//     //     }
//     // }, [isVideo, videoRef])
//     return (
//         <View style={{ width: widthPercentageToDP(30), height: widthPercentageToDP(30), marginLeft: widthPercentageToDP(2), marginBottom: widthPercentageToDP(2), opacity: isDeleted ? 0.2 : 1, justifyContent: "center", alignItems: "center" }}>
//             <DeleteBlock styleMain={{ position: "absolute", top: 0, right: 0, zIndex: 10 }} onPress={onPressDelete} />
//             {isVideo && <Image source={Appimg.play} style={{ height: 40, width: 40, position: "absolute", zIndex: 10 }} />}
//             {(isVideo && Platform?.OS == "ios") ?
//                 // <Video ref={videoRef} paused={true} source={{ uri: item?.uri }} style={{ borderRadius: 4, height: "100%", width: "100%" }} />
//                 <Image source={Appimg.logo} style={{ borderRadius: 4, height: "100%", width: "100%" }} />
//                 :
//                 <FastImage source={{ uri: item?.smallUri }} style={{ borderRadius: 4, height: "100%", width: "100%" }} />
//             }
//         </View>
//     )
// })


















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
import { createCollectionApi } from '../../apimanager/httpServices';
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

const ImageSelectionGallery = ({ navigation, route }) => {
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

    // useEffect(() => {
    //     const eventEmitter = new NativeEventEmitter(Photopicker)
    //     eventEmitter.addListener('sendDataToJS', (i) => {
    //         setAllMedia(i)
    //     });
    // }, [Photopicker])
    useEffect(() => {
        getToken()
    }, [])
    useEffect(() => {
        if (allMedia?.length > 0) {
            setSelectingImg(false)
        }
    }, [allMedia])
    useEffect(() => {
        console.log("testing")
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
    // const fromGallery = async () => {
    //     setSelectingImg(true)
    //     const result = await launchImageLibrary({ selectionLimit: 100, mediaType: "mixed", formatAsMp4: true });
    //     if (result?.assets) {
    //         // compressionFunction(result?.assets)
    //         storeMedia(result?.assets)
    //     }
    //     if (result?.didCancel) {
    //         setSelectingImg(false)
    //     }
    // };
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
    };
    const veryIntensiveTaskGallery = async (taskDataArguments) => {
        await new Promise(async (resolve) => {
            const { } = taskDataArguments;
            fromGallery().then(async i =>
            // Alert.alert('done')
            {
                await BackgroundService.stop()

                resolve(i)
            }
            ).catch(async e => {
                await BackgroundService.stop()


                // Alert.alert('notdone')
            })
        });
    };
    const fromCamera = async () => {
        try {
            setSelectingImg(true)
            const result = await launchCamera({ mediaType: "mixed", formatAsMp4: true });
            if (result?.assets) {
                storeMedia(result?.assets)
            }
            if(result?.didCancel) {
                setSelectingImg(false)
            }
        } catch (e) {
            console.log(e);
        }
    };
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
                    console.log("testing123")
                     divideArrayIntoChunks(notDeletedMedias, chunkSize, res?.data?.data?._id)
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
    const veryIntensiveTask = async (taskDataArguments) => {
        await new Promise(async (resolve) => {
            const { unifiedBatches, id } = taskDataArguments;
            upload(unifiedBatches, 0, unifiedBatches?.length, id).then(async i => {
                await BackgroundService.stop()
                resolve(i)
            }
            ).catch(async e => {
                console.log("exception >> ", e)
                await BackgroundService.stop()
            })
        });
    };

    const divideArrayIntoChunks = async (arr, batchSize, id) => {
        setSelectingImg(true)
        console.log("testing1234")
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
             let obj = {}
                if (route?.params?.collectionId) {
                    obj = {
                        collection_id: id,
                        type: 'update',
                        is_first_chunk: '0',
                        saveToLibrary: saveToLib?.toString(),
                      };
                }
                else{
                     obj = {
                        collection_id: id,
                        type: 'add',
                        is_first_chunk: '1',
                        saveToLibrary: saveToLib?.toString(),
                      };
                }
                // let obj = {
                //     collection_id: id,
                //     type: 'update',
                //     is_first_chunk: '0',
                //     saveToLibrary: saveToLib?.toString(),
                //   };
                  console.log(obj,"obj here")
                //   type === 'Gallery'
                //   ? 'stylist/update_gallery_media'
                //   : 
                  const url =
                  baseUrl +
                  ('stylist/update_media_array');
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
                setSelectingImg(false)
                navigation?.navigate("BottomTabS");
                return responseBody;

                console.log(options.parameters.unifiedBatches[0],"testing123456")
                // dispatch(setUploadTask(options))
                // navigation?.navigate("BottomTabS");
            }


        }
    }
    const requestExternalStoragePermission = async () => {
        const status = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
        if (status !== RESULTS.GRANTED) {
            const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
            if (result !== RESULTS.GRANTED) {
                // Handle permission denial
                console.error('Permission denied for reading external storage.');
                return false;
            }
        }
        return true;
    };
    
    useEffect(() => {
        Platform.OS == 'android' && requestExternalStoragePermission()
    }, [])
    const uploads = async (arr, current = 0, total, id) => {
        let mediaArray = [];
        let mediaChunk = arr[current]
        if (id == "") {
            uploadDiscontinued()
        }
        if (!mediaChunk) {
            uploadDiscontinued()
        }
        if (cId != "") {
            mediaArray.push({ name: "collection_id", data: id }, { name: "type", data: "update" }, { name: "is_first_chunk", data: "0" }, { name: "saveToLibrary", data: saveToLib?.toString() })
        } else {
            mediaArray.push({ name: "collection_id", data: id }, { name: "type", data: "add" }, { name: "is_first_chunk", data: current == 0 ? "1" : "0" }, { name: "saveToLibrary", data: saveToLib?.toString() })
        }
        setChunkIndex(current)
        try {
            for (let i = 0; i < mediaChunk.length; i++) {
                const mediaItem = mediaChunk[i];
                let path = Platform?.OS == "ios" ? mediaItem?.uri.replace('file://', '') : mediaItem?.uri
                const mediaObject = {
                    filename: mediaItem.fileName || Math.floor((Math.random() * 100000) + 10000) + "." + mediaItem.type?.split("/")[1],
                    type: mediaItem.type,
                    data: mediaItem?.uri,
                    name: "collection_media"
                };
                mediaArray.push(mediaObject)
            }
            let serverRes = await uploadToServer(mediaArray)
            if (serverRes?.respInfo?.status == 200) {
                console.log(serverRes, "----", current, total)
                if (current < total) {
                    upload(arr, (current + 1), total, id)
                } else {
                    uploadDiscontinued()
                }
            }
        } catch (e) {
        }
    }
    const upload = async (arr, current = 0, total, id) => {
        return new Promise(async (resolve, reject) => {
            let mediaArray = [];
            let mediaChunk = arr[current];

            if (id === "") {
                resolve(uploadDiscontinued())
            }

            if (!mediaChunk) {
                resolve(uploadDiscontinued())

            }

            if (cId !== "") {
                mediaArray.push(
                    { name: "collection_id", data: id },
                    { name: "type", data: "update" },
                    { name: "is_first_chunk", data: "0" },
                    { name: "saveToLibrary", data: saveToLib?.toString() }
                );
            } else {
                mediaArray.push(
                    { name: "collection_id", data: id },
                    { name: "type", data: "add" },
                    { name: "is_first_chunk", data: current === 0 ? "1" : "0" },
                    { name: "saveToLibrary", data: saveToLib?.toString() }
                );
            }

            setChunkIndex(current);

            try {
                for (let i = 0; i < mediaChunk.length; i++) {
                    const mediaItem = mediaChunk[i];
                    console.log(mediaItem, "  uri >>>>>>>>>>>.")

                    let path =
                        Platform.OS === "ios"
                            ? mediaItem?.uri?.replace("file://", "")
                            : (await RNFetchBlob.fs.stat(mediaItem?.uri)).path;
                    console.log(path, "bjbjbj")
                    let finalPath = RNFetchBlob.wrap(path).replace('file://file:///', 'file:///');
                    const mediaObject = {
                        filename:
                            mediaItem.name ||
                            Math.floor(Math.random() * 100000 + 10000) +
                            "." +
                            mediaItem.type?.split("/")[1],
                        type: mediaItem.type,
                        data: finalPath,
                        name: "collection_media",
                    };

                    mediaArray.push(mediaObject);
                }
                console.log("uploadToServer >> before")
                let serverRes = await uploadToServer(mediaArray);
                console.log("uploadToServer res>> ", serverRes)
                if (serverRes?.respInfo?.status === 200) {
                    console.log(serverRes, "----", current, total);
                    if (current < total) {
                        resolve(upload(arr, current + 1, total, id, cId, saveToLib));
                        console.log("uploadToServer json resolveee>> ")
                    } else {
                        resolve(uploadDiscontinued())
                        console.log("uploadDiscontinued>>>> ")
                    }
                } else if (JSON.stringify(serverRes).includes("Broken pipe") || JSON.stringify(serverRes).includes("unexpected end of stream")) {
                    resolve(upload(arr, current + 1, total, id, cId, saveToLib));
                }
            } catch (error) {
                reject(error);
            }
        });
    };

    const uploadToServer = async (arr) => {
        console.log(arr, "uploading to server");
        console.log(arr, "array to upload****&*&*&*&*&*&*&*&*&*&*&*&")
        try {
            let res = await RNFetchBlob.config({ timeout: 30 * 60 * 1000 })
                .fetch(
                    'POST',
                    (baseUrl + "stylist/upload_media_array"),
                    { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data', },
                    arr
                ).uploadProgress((written, total) => {
                    console.log("progresss >>  ", (written / total));
                    setProgress((written / total))
                })
                .catch(e => {
                    console.log(e, "sdf");

                    return e.message
                })
            return res
        } catch (e) {
            console.log(e, "uploadesss");
            showToast("Something went wrong please try again.")
        }
    }

    const uploadFiles = async (array) => {
        let arr = [];
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            let mime = element?.mime ?? element?.type ?? "image/jpg"
            let path = element?.path ?? element?.uri ?? ""
            const newPath = Platform.OS == 'android' ? (await RNFetchBlob.fs.stat(path)).path : path
            let fileName = element?.name ?? element?.filename ?? moment().unix() + "." + mime?.split("/")[1]
            if (path != "") {
                let obj = {
                    filename: fileName,
                    data: decodeURIComponent(RNFetchBlob.wrap(newPath).replace('file://file:///', 'file:///')),
                    type: mime,
                };
                arr.push({ ...obj, name: "common_media" });
            }
        }

        let response = await RNFetchBlob.fetch(
            "POST",
            ("https://apidev.letsvibe.io/api/v1/common/upload_media"),
            {
                "Content-Type": "multipart/form-data",
            },
            arr
        ).then(i => {
            return i.data
        })
        return JSON.parse(response)
    }
    const uploadDiscontinueds = () => {
        setUploadModal(false)
        setChunkIndex(0);
        setTotalChunks(0);
        navigation?.navigate("BottomTabS");
    }
    const uploadDiscontinued = () => {
        return new Promise((resolve) => {
            setUploadModal(false);
            setChunkIndex(0);
            setTotalChunks(0);
            navigation?.navigate("BottomTabS");
            resolve();
        });
    };

    const compressionFunction = async (data) => {
        let temp = []
        setCompressTotal(data?.length)
        for (const [index, e] of data.entries()) {
            setCompressCurrent(index)
            let x = { ...e }
            if (e?.type?.split("/")[0] == "image") {
                let result = await CompressorImage.compress(e?.uri);
                x = { ...e, uri: result }
            } else {
                let result = await CompressorVideo.compress(
                    e?.uri,
                    {
                        compressionMethod: 'manual',
                        quality: 0.7
                    },
                    (progress) => {
                        console.log('Compression Progress: ', progress);
                    }
                );
                x = { ...e, uri: result }
            }
            temp.push(x)
        }
        storeMedia(temp)
        // setAllImages(temp)
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            {/* <UploadLoader batchSize={chunkSize} current={chunkIndex} total={totalChunks} visible={uploadModal} progress={progress} totalImg={allMedia?.length} /> */}
            <Header title={(cId ? "Update Collection" : "Create Collection") + ` (${allMedia?.length || 0})`} showBack={true} onBackPress={() => navigation?.goBack()} />
            {/* {uploadModal && <UploadLoader current={chunkIndex} total={totalChunks} totalImg={(allMedia?.length - 1)} visible={uploadModal} progress={progress} />} */}
            {selectingImg && <GalleryLoader />}
            {/* <FlashList
                estimatedItemSize={20}
                data={allMedia?.splice(0, 20)}
                keyExtractor={(item) => item.uri?.toString()}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: heightPercentageToDP(18) }}
                renderItem={({ item, index }) => {
                    return (
                        <TextBlock item={item} index={index} />
                    )
                }}
            /> */}
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
                        // divideArrayIntoChunks(allMedia?.filter(x => !x?.deleted), chunkSize, cId)
                        divideArrayIntoChunks(allMedia, chunkSize, cId)
                        return
                    }
                    uploadCollection()
                }}
            />
        </View>
    )
}

export default ImageSelectionGallery

const styles = StyleSheet.create({})

const TextBlock = ({ item, index }) => {
    return (
        <View style={{ flexDirection: "row" }}>
            <Image source={{ uri: item?.uri }} style={{ borderRadius: 4, height: 20, width: 20 }} />
            <Text style={{ color: "white" }}>{item?.fileName}</Text>
        </View>
    )
}

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