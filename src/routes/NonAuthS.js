import { Alert, NativeEventEmitter, NativeModules, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Appcolor from '../constants/Appcolor';
import Subscripton from '../screens/Stylist/Subscription';
import StylistAccount from '../screens/Stylist/StylistAccount';
import BottomTabS from './BottomTabS';
import EditProfileS from '../screens/Stylist/EditProfileS';
import ChangePasswordS from '../screens/Stylist/ChangePasswordS';
import ContactusS from '../screens/Stylist/ContactusS';
import TermsS from '../screens/Stylist/TermsS';
import DeleteAccountS from '../screens/Stylist/DeleteAccounS';
import StylistChat from '../screens/Stylist/StylistChat';
import CallStylist from '../screens/Stylist/CallStylist';
import VideoCallStylist from '../screens/Stylist/VideoCallStylist';
import ProductScreen from '../screens/Stylist/ProductScreen';
import NotificationS from '../screens/Stylist/NotificationS';
import ProductEditScreen from '../screens/Stylist/ProductEditScreen';
import CreateCollection from '../screens/Stylist/CreateCollection';
import AllClients from '../screens/Stylist/AllClient';
import ClientProfile from '../screens/Stylist/ClientProfile';
import Notes from '../screens/Stylist/Notes';
import CreateNotes from '../screens/Stylist/CreateNotes';
import AudioReceiveCall from '../screens/Client/AudioReceiverCall';
import VideoReceiveCall from '../screens/Client/VideoReceiveCall';
import ReceiveCall from '../screens/Client/RecieveCall';
import MediaDetail from '../screens/Stylist/MediaDetail';
import OtherStylist from '../screens/Stylist/OtherStylist';
import ConfirmedOrders from '../screens/Stylist/ConfirmedOrders';
import DeletedNotesS from '../screens/Stylist/DeletedNotesS';
import TotalLikes from '../screens/Stylist/TotalLikes';
import LikedList from '../screens/Stylist/LikedList';
import CreateChat from '../screens/Stylist/CreateChat';
import ProductLikes from '../screens/Stylist/ProductLikes';
import UserGallery from '../screens/Stylist/UserGallery';
import UserGalleryUpdate from '../screens/Stylist/UserGalleryUpdate';
import ImageSelection from '../screens/Stylist/ImageSelection';
import EditCollectionGallery from '../screens/Stylist/EditCollectionGallery';
import ImageSelectionGallery from '../screens/Stylist/ImageSelectionGallery';
import { useDispatch, useSelector } from 'react-redux';
import BiometricS from '../screens/Stylist/BiometricS';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import BackgroundService from 'react-native-background-actions';
import showToast from '../CustomToast';
import { baseUrl } from '../apimanager/httpmanager';
import {
  setIsUploading,
  setUploadTask,
  setProgress,
  setCurrentBatch,
  setTotalBatchSize,
  setFailedTask,
} from '../redux/uploadReducer';
import { uploadToS3, uploadVideoToS3 } from '../utils/uploadTos3';
import { CPromise } from 'c-promise2';
import { setLoading } from '../redux/load';
import moment from 'moment';
import ProfileS from '../screens/Stylist/ProfileS';
import { setisUploadingNative } from '../redux/appstate';
import BrandProfileStylist from '../screens/Stylist/BrandProfileStylist';
import ProductScreenBrands from '../screens/Stylist/ProductScreenBrands';
import firestore from '@react-native-firebase/firestore';
import { setUnreadChats } from '../redux/ChatCount';

const NonAuthS = () => {
  const { Photopicker } = NativeModules;
  const Stack = createNativeStackNavigator();
  let isSub = useSelector(state => state?.auth?.isSubscribe);
  let uploadTask = useSelector(state => state?.uploadReducer?.uploadTask);
  let failedTask = useSelector(state => state?.uploadReducer?.failedTask);
  let isUploading = useSelector(state => state?.uploadReducer?.isUploading);
  let progress = useSelector(state => state?.uploadReducer?.progress);
  let currentBatch = useSelector(state => state?.uploadReducer?.currentBatch);
  let totalBatchSize = useSelector(
    state => state?.uploadReducer?.totalBatchSize,
  );
  let biometric = useSelector(state => state?.auth?.biometric);
  const appstate = useSelector(state => state?.appstate?.isActive);
  const user = useSelector(state => state?.auth?.user)

  const [token, setToken] = useState(0);
  let dispatch = useDispatch();
  const [uploadingStatus, setuploadingStatus] = useState()
  const uploadDiscontinued = () => {
    return new Promise(resolve => {
      dispatch(setUploadTask({}));
      dispatch(setIsUploading(false));
      dispatch(setProgress(0));
      dispatch(setCurrentBatch(0));
      dispatch(setTotalBatchSize(0));
      resolve();
    });
  };


  useEffect(() => {
    if (user?._id) {
      let id = user?._id
      const unsubscribe = firestore().collection("chats").where("userIds", "array-contains", id).onSnapshot((querySnapshot) => {
        let totalUnreadCount = 0
        for (let snaps of querySnapshot.docs) {
          let data = snaps.data()
          if (data?.type != "group") {
            let unreadCount = data?.unreadCount ? data?.unreadCount[id] : 0
            totalUnreadCount += unreadCount
          }
        }
        dispatch(setUnreadChats(totalUnreadCount))
      })
      return () => unsubscribe();
    }
  }, [user?._id])
  useEffect(() => {

    const eventEmitter = new NativeEventEmitter(Photopicker)

    eventEmitter.addListener('status', (i) => {
      //  console.log(i, "image url", typeof i[0], typeof i[1])
      //  console.log(i,"Videos in js")

      console.log(i, "Upload images count")
      if (i.total == i.completed || i.remaining == "0") {
        setuploadingStatus(null);
        dispatch(setisUploadingNative(false))
      }
      else {
        setuploadingStatus(i)
        dispatch(setisUploadingNative(true))
      }

    });
    return () => {
      eventEmitter.removeAllListeners("video")
    }
  }, [Photopicker])



  const veryIntensiveTask = async taskDataArguments => {
    console.log(taskDataArguments, "taskDataArguments");
    await new Promise(async resolve => {
      const { unifiedBatches, id, cId, saveToLib, type, mediaType } = taskDataArguments;

      console.log(mediaType, "here is media type")
      console.log(unifiedBatches?.length, "here is media type")

      mediaType == "video" ?
        upload2(unifiedBatches, 0, unifiedBatches?.length, id, cId, saveToLib, type).then(async i => {
          await BackgroundService.stop()
          resolve(i)
        }
        ).catch(async e => {
          console.log("exception >> ", e)
          await BackgroundService.stop()
        })
        :
        upload(
          unifiedBatches,
          0,
          unifiedBatches?.length,
          id,
          cId,
          saveToLib,
          type,
        )
          .then(async i => {
            await BackgroundService.stop();
            resolve(i);
          })
          .catch(async e => {
            console.log('exception >> ', e);
            await BackgroundService.stop();
          });
    });
  };

  const uploadToServer = async (arr, type, mediaChunk, obj) => {
    try {
      console.log(obj);

      console.log(mediaChunk, 'arrrrrrrrr');
      let promises = [];
      let array = mediaChunk;
      let a = 0;
      dispatch(setTotalBatchSize(array.length));
      let data = [];
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        let fileUri, fileName, mime_type;
        fileUri = element.originalUri;
        var extension = element.type.includes('video') ? element.type == "video/quicktime" ? ".MOV" : '.mp4' : '.jpeg';
        fileName = element.name + moment().unix()?.toString() + extension;
        mime_type = element.type;
        console.log("here before upload s3")

        mime_type.includes('video') ? await uploadVideoToS3(fileUri, fileName, mime_type) : await uploadToS3(fileUri, fileName, mime_type);

        console.log("here after upload s3")
        data.push(`${'gallery/test/'}${fileName}`);

        a += 1;
        dispatch(setCurrentBatch(a));

        if (a == array.length) {
          dispatch(setIsUploading(false));
          uploadDiscontinued();
          const url =
            baseUrl +
            (type === 'Gallery'
              ? 'stylist/update_gallery_media'
              : 'stylist/update_media_array');
          console.log(type, "typeeeee");

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

          return responseBody;
        }
        // )
        //   promises.push(uploadToS3(fileUri, fileName,mime_type))
      }

      // console.log(resp);
      // return
      // let res = await RNFetchBlob.config({ timeout: 30 * 60 * 1000 })
      //     .fetch(
      //         'POST',
      //         (baseUrl + (type == 'Gallery' ? "stylist/add_gallery_media" : "stylist/update_media_array")),
      //         {
      //             Authorization: `Bearer ${token}`,
      //             'Content-Type': 'application/json',
      //         },
      //         { ...obj, data: JSON.stringify(data) }
      //     ).uploadProgress((written, total) => {
      //         console.log("progresss >>  ", (written / total));
      //         dispatch(setProgress((written / total)))
      //     })
      //     .catch(e => {
      //         console.log(e, "sdf");
      //         return e.message
      //     })
      // return res
    } catch (e) {
      console.log(e, 'uploadesss');
      showToast('Something went wrong please try again.');
    }
  };

  const upload = async (arr, current = 0, total, id, cId, saveToLib, type) => {
    console.log(id, type);
    //dispatch(setIsUploading(true))
    dispatch(setCurrentBatch(current));
    return new Promise(async (resolve, reject) => {
      let mediaArray = [];
      let mediaChunk = arr[current];

      if (id === '' && type != 'Gallery') {
        console.log(id, type, 'gallery');
        resolve(uploadDiscontinued());
      }

      if (!mediaChunk) {
        console.log('mediaChunk', mediaChunk);
        resolve(uploadDiscontinued());
      }
      if (type != 'Gallery') {
        if (cId !== '') {
          mediaArray.push(
            { name: 'collection_id', data: id },
            { name: 'type', data: 'update' },
            { name: 'is_first_chunk', data: '0' },
            { name: 'saveToLibrary', data: saveToLib?.toString() },
          );
        } else {
          mediaArray.push(
            { name: 'collection_id', data: id },
            { name: 'type', data: 'add' },
            { name: 'is_first_chunk', data: current === 0 ? '1' : '0' },
            { name: 'saveToLibrary', data: saveToLib?.toString() },
          );
        }
      }
      try {
        for (let i = 0; i < mediaChunk.length; i++) {
          const mediaItem = mediaChunk[i];
          let path =
            Platform.OS === 'ios'
              ? mediaItem?.originalUri?.replace('file://', '')
              : (await RNFetchBlob.fs.stat(mediaItem?.originalUri)).path;
          console.log(path, "final path1")
          let finalPath = RNFetchBlob.wrap(path).replace(
            'file://file:///',
            'file:///',
          );

          console.log(finalPath, "final path2")
          const mediaObject = {
            filename:
              mediaItem.name ||
              Math.floor(Math.random() * 100000 + 10000) +
              '.' +
              mediaItem.type?.split('/')[1],
            type: mediaItem.type,
            data: finalPath,
            name: 'collection_media',
          };

          mediaArray.push(mediaObject);
        }

        let obj = {
          collection_id: id,
          type: 'update',
          is_first_chunk: '0',
          saveToLibrary: saveToLib?.toString(),
        };
        let serverRes = await uploadToServer(mediaArray, type, mediaChunk, obj);
        return;
        if (serverRes?.respInfo?.status === 200) {
          console.log(serverRes, '----RES', current, total);
          if (current < total) {
            resolve(upload(arr, current + 1, total, id, cId, saveToLib, type));
          } else {
            console.log('hererer', current, total);
            resolve(uploadDiscontinued());
          }
        } else {
          let tasks = [...failedTask];
          tasks.push(arr[current]);
          var options = {
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
              tasks,
              id,
              cId,
              saveToLib,
            },
          };
          dispatch(setFailedTask(options));
          showToast('Upload failed. Something went wrong.');
          if (current < total) {
            resolve(upload(arr, current + 1, total, id, cId, saveToLib, type));
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  const uploadToServer2 = async (arr, type) => {
    try {
      let res = await RNFetchBlob.config({ timeout: 30 * 60 * 1000 })
        .fetch(
          'POST',
          (baseUrl + (type == 'Gallery' ? "stylist/add_gallery_media" : "stylist/upload_media_array")),
          { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data', },
          arr
        ).uploadProgress((written, total) => {
          console.log("progresss >>  ", (written / total));
          dispatch(setProgress((written / total)))
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

  const upload2 = async (arr, current = 0, total, id, cId, saveToLib, type) => {
    dispatch(setCurrentBatch(current))
    return new Promise(async (resolve, reject) => {
      let mediaArray = [];
      let mediaChunk = arr[current];

      if (id === "" && type != 'Gallery') {
        resolve(uploadDiscontinued())
      }

      if (!mediaChunk) {
        resolve(uploadDiscontinued())
      }
      if (type != 'Gallery') {
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
      }
      try {
        for (let i = 0; i < mediaChunk.length; i++) {
          const mediaItem = mediaChunk[i];
          let path =
            Platform.OS === "ios"
              ? mediaItem?.originalUri?.replace("file://", "")
              : (await RNFetchBlob.fs.stat(mediaItem?.originalUri)).path;
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
        let serverRes = await uploadToServer2(mediaArray, type);
        if (serverRes?.respInfo?.status === 200) {
          console.log(serverRes, "----RES", current, total);
          if ((current + 1) < total) {
            resolve(upload2(arr, current + 1, total, id, cId, saveToLib, type));
          } else {
            resolve(uploadDiscontinued())
          }
        } else {
          let tasks = [...failedTask]
          tasks.push(arr[current])
          var options = {
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
              tasks,
              id, cId, saveToLib
            },
          };
          dispatch(setFailedTask(options))
          showToast("Upload failed. Something went wrong.")
          if (current < total) {
            resolve(upload(arr, current + 1, total, id, cId, saveToLib, type))
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };








  const getData = async key => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        return JSON.parse(value);
      }
    } catch (e) {
      // error reading value
    }
  };

  const getToken = async () => {
    const tokens = await getData('@tokens');
    setToken(tokens);
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    console.log(uploadTask?.parameters?.unifiedBatches?.length, "inside upload task Useeffect")
    if (uploadTask?.parameters?.unifiedBatches?.length > 0 && !isUploading) {
      if (token) {
        dispatch(
          setTotalBatchSize(uploadTask?.parameters?.unifiedBatches?.length),
        );
        runInBackGround(uploadTask);
        dispatch(setIsUploading(true));
      }
    }
  }, [uploadTask, token]);

  useEffect(() => {
    let timeout = 0;
    if (isUploading) {
      timeout = setTimeout(() => {
        if (!BackgroundService.isRunning()) {
          Alert.alert('Upload interupted', 'Try again', [
            {
              text: 'Ok',
              onPress: () => {
                uploadDiscontinued();
              },
            },
          ]);
        }
      }, 5000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isUploading, appstate]);

  const runInBackGround = async options => {
    console.log(options, "runInBackGround");
    await BackgroundService.start(veryIntensiveTask, options);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ backgroundColor: Appcolor.blackcolor, flex: 1 }}>
      {/* {isUploading && (
        <View
          style={{
            width: '100%',
            height: 30,
            backgroundColor: 'rgba(60,60,60,1)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}>
          <Text style={{ color: 'white', alignSelf: 'center' }}>
            Uploading in progress ({currentBatch}/{totalBatchSize})
          </Text>
          {/* <Text style={{ color: 'white', alignSelf: 'center' }}>{parseInt(progress * 100)}%</Text> */}
      {/* <Text
            onPress={() => {
              Alert.alert(
                'Cancel Upload',
                'Are you sure you want to cancel the upload progress',
                [
                  {
                    text: 'Yes',
                    onPress: () => {
                      uploadDiscontinued();
                    },
                  },
                  {
                    text: 'No',
                  },
                ],
              );
            }}
            style={{ color: 'red', alignSelf: 'center' }}>
            {failedTask?.parameters?.unifiedBatches?.length > 0
              ? 'Failed'
              : 'Cancel'}
          </Text>
        </View>
      )}  */}


      {uploadingStatus && (
        <View
          style={{
            width: '100%',
            height: 30,
            backgroundColor: 'rgba(60,60,60,1)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}>
          <Text style={{ color: 'white', alignSelf: 'center' }}>
            Uploading in progress ({uploadingStatus.completed}/{uploadingStatus.total})
          </Text>
          {/* <Text style={{ color: 'white', alignSelf: 'center' }}>{parseInt(progress * 100)}%</Text> */}
          <Text
            onPress={() => {
              Alert.alert(
                'Cancel Upload',
                'Are you sure you want to cancel the upload progress',
                [
                  {
                    text: 'Yes',
                    onPress: () => {
                      Photopicker.cancelUploading()
                      // uploadDiscontinued();
                    },
                  },
                  {
                    text: 'No',
                  },
                ],
              );
            }}
            style={{ color: 'red', alignSelf: 'center' }}>
            {failedTask?.parameters?.unifiedBatches?.length > 0
              ? 'Failed'
              : 'Cancel'}
          </Text>
        </View>
      )}
      <Stack.Navigator
        initialRouteName={
          biometric == '0' ? 'BiometricS' : 'BottomTabS'
          // biometric == '0'
          //   ?
          //   'BiometricS'
          //   :
          //   isSub == '1' ?
          //     'BottomTabS'
          //     :
          //     'Subscripton'
        }
        screenOptions={{ headerShown: false }}>
        <Stack.Screen component={Subscripton} name="Subscripton" options={{ gestureEnabled: false }} />
        <Stack.Screen component={BottomTabS} name="BottomTabS" options={{ gestureEnabled: false }} />
        <Stack.Screen component={BiometricS} name="BiometricS" options={{ gestureEnabled: false }} />
        <Stack.Screen component={ProfileS} name="ProfileS" />
        <Stack.Screen component={StylistAccount} name="StylistAccount" />
        <Stack.Screen component={EditProfileS} name="EditProfileS" />
        <Stack.Screen component={ChangePasswordS} name="ChangePasswordS" />
        <Stack.Screen component={ContactusS} name="ContactusS" />
        <Stack.Screen component={TermsS} name="TermsS" />
        <Stack.Screen component={DeleteAccountS} name="DeleteAccountS" />
        <Stack.Screen component={StylistChat} name="StylistChat" />
        <Stack.Screen component={CallStylist} name="CallStylist" />
        <Stack.Screen component={VideoCallStylist} name="VideoCallStylist" />
        <Stack.Screen component={ProductScreen} name="ProductScreen" />
        <Stack.Screen component={NotificationS} name="NotificationS" />
        <Stack.Screen component={ProductEditScreen} name="ProductEditScreen" />
        <Stack.Screen component={CreateCollection} name="CreateCollection" />
        <Stack.Screen component={AllClients} name="AllClients" />
        <Stack.Screen component={ClientProfile} name="ClientProfile" />
        <Stack.Screen component={Notes} name="Notes" />
        <Stack.Screen component={CreateNotes} name="CreateNotes" />
        <Stack.Screen component={ReceiveCall} name="ReceiveCall" />
        <Stack.Screen component={AudioReceiveCall} name="AudioReceiveCall" />
        <Stack.Screen component={VideoReceiveCall} name="VideoReceiveCall" />
        <Stack.Screen component={MediaDetail} name="MediaDetail" />
        <Stack.Screen component={OtherStylist} name="OtherStylist" />
        <Stack.Screen component={ConfirmedOrders} name="ConfirmedOrders" />
        <Stack.Screen component={DeletedNotesS} name="DeletedNotesS" />
        <Stack.Screen component={TotalLikes} name="TotalLikes" />
        <Stack.Screen component={LikedList} name="LikedList" />
        <Stack.Screen component={CreateChat} name="CreateChat" />
        <Stack.Screen component={ProductLikes} name="ProductLikes" />
        <Stack.Screen component={UserGallery} name="UserGallery" />
        <Stack.Screen component={UserGalleryUpdate} name="UserGalleryUpdate" />
        <Stack.Screen component={BrandProfileStylist} name="BrandProfileStylist" />
        <Stack.Screen component={ProductScreenBrands} name="ProductScreenBrands" />
        <Stack.Screen component={ImageSelection} name="ImageSelection" />
        <Stack.Screen
          component={ImageSelectionGallery}
          name="ImageSelectionGallery"
        />
        <Stack.Screen
          component={EditCollectionGallery}
          name="EditCollectionGallery"
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default NonAuthS;

const styles = StyleSheet.create({});
