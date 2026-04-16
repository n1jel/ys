import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  NativeEventEmitter,
  NativeModules,
  PanResponder,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import MasonryList from '@react-native-seoul/masonry-list';
import FastImage from 'react-native-fast-image';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import DeleteBlock from '../../components/DeleteBlock';
import Btn from '../../components/Btn';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { deleteGalleryData, get_my_gallery } from '../../apimanager/httpServices';
import { fileUrl } from '../../apimanager/httpmanager';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../redux/load';
import Commonstyles from '../../constants/Commonstyles';
import { RFValue } from 'react-native-responsive-fontsize';
import GalleryImageViewer from '../../components/GalleryImageViewer';
import Appcolor from '../../constants/Appcolor';
import ImageZoom from 'react-native-image-pan-zoom';
import showToast from '../../CustomToast';
import { FlashList } from '@shopify/flash-list';
import Appfonts from '../../constants/Appfonts';
import Pinchable from 'react-native-pinchable';
import { setUploadTask } from '../../redux/uploadReducer';
import { Store } from '../../redux/Store';
import CameraModal from '../../components/CameraModal';
import { types } from 'react-native-document-picker';
import AppUtils from '../../utils/apputils';
import { getData } from '../../utils/asyncstore';
import VideoThumb from '../../components/VideoThumb';

const UserGallery = ({ navigation }) => {
  const { Appcolor } = useTheme();
  const dispatch = useDispatch();
  const { Photopicker } = NativeModules;

  const [allMedia, setAllMedia] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(0);
  const [totalpage, setTotalpage] = useState(0);
  const [totalGallery, setTotalGallery] = useState(0);
  const limit = 20;
  const [selectionMode, setSelectionMode] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState([]);
  const [verticalMode, setVerticalMode] = useState(false);
  const [initialRenderIndex, setInitialRenderIndex] = useState(0);
  const [showCameraModal, setshowCameraModal] = useState(false);
  const chunkSize = 20000;
  let isUploading = useSelector(state => state?.uploadReducer?.isUploading);
  let isUploadingNative = useSelector(state => state?.appstate?.isUploadingNative);
  useFocusEffect(
    useCallback(() => {
      getMyGallery(1);
    }, []),
  );
  useEffect(() => {
    if (deletingMedia?.length == 0) {
      setSelectionMode(false);
    }
  }, [deletingMedia]);

  const getMyGallery = async (page = 1) => {
    let data = { limit, page };
    try {
      dispatch(setLoading(true));
      let res = await get_my_gallery(data);
      if (res?.data?.status) {
        setPage(res?.data?.other?.current_page);
        setTotalpage(res?.data?.other?.total_page);
        setTotalGallery(res?.data?.other?.total_entries);
        setAllMedia(res?.data?.data);
      }
    } catch (e) {
    } finally {
      dispatch(setLoading(false));
      setRefresh(false);
    }
  };
  const getMoreGallery = async (page = 1) => {
    let data = { limit, page };
    try {
      setFetching(true);
      let res = await get_my_gallery(data);
      if (res?.data?.status) {
        let temp = [...allMedia]?.concat(res?.data?.data);
        setAllMedia(temp);
        setPage(res?.data?.other?.current_page);
        // setTotalpage(res?.data?.other?.total_page)
      }
    } catch (e) {
    } finally {
      setFetching(false);
    }
  };
  const updateDeletingMedia = useCallback(
    id => {
      let temp = [...deletingMedia];
      if (temp?.includes(id)) {
        temp = temp?.filter(x => x != id);
      } else {
        temp.push(id);
      }
      setDeletingMedia(temp);
    },
    [deletingMedia],
  );
  const deleteData = async media_ids => {
    if (media_ids?.length == 0) {
      showToast('No medias selected');
      setSelectionMode(false);
      return;
    }
    try {
      dispatch(setLoading(true));
      let res = await deleteGalleryData({ media_id: media_ids });
      if (res?.data?.status) {
        let temp = [...allMedia];
        setAllMedia(temp.filter(x => !media_ids?.includes(x?._id)));
        setTotalGallery(res?.data?.other?.total_entries);
        setSelectionMode(false);
        setDeletingMedia([]);
      }
    } catch (e) {
    } finally {
      dispatch(setLoading(false));
    }
  };
  const scrollAction = index => {
    setInitialRenderIndex(index);
    setTimeout(() => {
      setVerticalMode(!verticalMode);
    }, 400);
  };
  const deleteAllMedia = async () => {
    try {
      dispatch(setLoading(true));
      let res = await deleteGalleryData({ media_id: 'all' });
      console.log(res);
      if (res?.data?.status) {
        setAllMedia([]);
        showToast(res?.data?.message);
        setSelectionMode(false);
        setDeletingMedia([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(Photopicker);

    eventEmitter.addListener('sendDataToJS', i => {
      console.log(i, "image url", typeof i)

      if (Platform.OS == "android") {
        if (i == "[]") {
          dispatch(setLoading(false))
          setTimeout(() => {
            navigation?.navigate('BottomTabS');
          }, 0);
        }
      }
      else {
        if (i[0].length == 0) {
          dispatch(setLoading(false))
          setTimeout(() => {
            navigation?.navigate('BottomTabS');
          }, 0);
        }
      }
      // else {
      //   createCollection([...i[0]]);
      //   console.log('LLLL');
      // }


    });

    return () => {
      eventEmitter.removeAllListeners('sendDataToJS');
    };
  }, [Photopicker]);


  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(Photopicker)

    eventEmitter.addListener('video', (i) => {
      //  console.log(i, "image url", typeof i[0], typeof i[1])
      console.log(i, "testing in videoooooo")
      //  console.log(i,"Videos in js")
      if (Platform.OS == "ios") {
        if (i.length == 0) {

          setTimeout(() => {
            navigation?.navigate("BottomTabS");
          }, 0);
          // dispatch(setLoading(false))
          // console.log("Empty Array");
          // showToast('No medias selected');
        }
      }
      else {
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

  const createCollection = async data => {
    dispatch(setLoading(true));
    try {
      divideArrayIntoChunks(data, chunkSize, '');
    } catch (e) {
      dispatch(setLoading(false));
    } finally {
      //   dispatch(setLoading(false))
    }
  };

  const divideArrayIntoChunks = async (arr, batchSize, id) => {
    const unifiedBatches = [];
    let saveToLib = '0';
    let cId = '';
    if (arr?.length < 1) {
      return;
    }
    for (let i = 0; i < arr.length; i += batchSize) {
      const batch = arr.slice(i, i + batchSize);
      unifiedBatches.push(batch);
    }
    if (unifiedBatches?.length) {
      // setTotalChunks(unifiedBatches?.length)
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
          id,
          cId,
          saveToLib,
          type: 'Gallery',
        },
        type: 'Gallery',
      };
      if (isUploading) {
        dispatch(setLoading(false));
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        console.log(options);
        dispatch(setLoading(false));

        dispatch(setUploadTask(options));
        setTimeout(() => {
          navigation?.navigate('BottomTabS');
        }, 0);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
      <Header
        title={`Your Season Gallery (${totalGallery})`}
        showBack={true}
        onBackPress={() => {
          verticalMode ? setVerticalMode(false) : navigation?.goBack();
        }}
        showDelete={selectionMode}
        onPressDelete={() => {
          deleteData(deletingMedia);
        }}
        onPressSelectionBox={() => setSelectionMode(true)}
        showSelectionBox={!selectionMode && !verticalMode}
      />
      {!verticalMode && selectionMode && (
        <Pressable
          style={{ alignSelf: 'flex-end', margin: 16, marginBottom: 0 }}
          onPress={() => {
            Alert.alert(
              'Are you sure?',
              'The medias will be deleted permanently.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    deleteAllMedia();
                  },
                },
              ],
            );
          }}>
          <Text
            style={{
              color: Appcolor.primary,
              fontSize: 16,
              fontFamily: Appfonts.bold,
            }}>
            Delete all
          </Text>
        </Pressable>
      )}
      {!verticalMode ? (
        <FlashList
          estimatedItemSize={widthPercentageToDP(30)}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                getMyGallery();
              }}
            />
          }
          data={allMedia}
          keyExtractor={item => item._id}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: heightPercentageToDP(16),
          }}
          numColumns={3}
          ListEmptyComponent={() => {
            return (
              <Text
                style={[
                  Commonstyles(Appcolor).bold20,
                  { fontSize: RFValue(14), marginTop: 120, textAlign: 'center' },
                ]}>
                No data found.
              </Text>
            );
          }}
          extraData={[deletingMedia, selectionMode]}
          removeClippedSubviews={true}
          renderItem={({ item, index }) => {
            let i = index;
            return (
              <ImgBlock
                item={item}
                index={i}
                deleteOn={selectionMode}
                deleteArr={deletingMedia}
                onLongPress={() => {
                  setSelectionMode(true);
                  updateDeletingMedia(item?._id);
                }}
                addToDeleteArray={() => {
                  updateDeletingMedia(item?._id);
                }}
                scrollAction={() => {
                  scrollAction(i);
                }}
              />
            );
          }}
          ListFooterComponent={() => {
            return (
              fetching &&
              allMedia?.length > 0 && (
                <ActivityIndicator size={'large'} color={Appcolor.primary} />
              )
            );
          }}
          onEndReached={() => {
            if (page < totalpage && !fetching) {
              getMoreGallery(page + 1);
            }
          }}
        />
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={() => {
                getMyGallery();
              }}
            />
          }
          data={allMedia}
          getItemLayout={(data, index) => {
            return {
              length: heightPercentageToDP(74),
              index,
              offset: heightPercentageToDP(74) * index,
            };
          }}
          initialScrollIndex={initialRenderIndex}
          keyExtractor={item => item._id}
          contentContainerStyle={{
            marginTop: 10,
            paddingBottom: heightPercentageToDP(16),
          }}
          numColumns={1}
          ListEmptyComponent={() => {
            return (
              <Text
                style={[
                  Commonstyles(Appcolor).bold20,
                  { fontSize: RFValue(14), marginTop: 120, textAlign: 'center' },
                ]}>
                No data found.
              </Text>
            );
          }}
          renderItem={({ item, index }) => {
            return (
              <SingleBlock
                item={item}
                index={index}
                onPressVideo={() => {
                  navigation?.navigate('VideoPlayer', {
                    media: item?.media_name,
                  });
                }}
              />
            );
          }}
          ListFooterComponent={() => {
            return (
              fetching &&
              allMedia?.length > 0 && (
                <ActivityIndicator size={'large'} color={Appcolor.primary} />
              )
            );
          }}
          onEndReached={() => {
            if (page < totalpage) {
              getMoreGallery(page + 1);
            }
          }}
        />
      )}
      {!selectionMode && !verticalMode && (
        <Btn
          title={'Add Images'}
          twhite
          styleMain={{
            position: 'absolute',
            bottom: heightPercentageToDP(8),
            alignSelf: 'center',
          }}
          onPress={() => {
            setshowCameraModal(true);
            // navigation?.navigate("UserGalleryUpdate")
          }}
        />
      )}

      <CameraModal
        visible={showCameraModal}
        onPressCancel={() => setshowCameraModal(false)}
        onPressCamera={() => {
          setshowCameraModal(false);
          if (isUploadingNative) {
            Alert.alert('Upload in progress', "Please wait for current uploading")
          }
          else {
            setTimeout(() => {
              navigation?.navigate('UserGalleryUpdate');
            }, 300);

          }
        }}
        onPressGallery={() => {
          setshowCameraModal(false);

          if (isUploadingNative) {
            Alert.alert('Upload in progress', "Please wait for current uploading")
          }
          else {

            setTimeout(() => {
              // Photopicker.openPicker();

              setTimeout(async () => {
                const tokens = await getData("@tokens");
                let obj = {
                  collection_id: "",
                  type: 'Gallery',
                  is_first_chunk: '0',
                  saveToLibrary: "0",
                  media_type: "image"
                };
                Photopicker.openPicker({}, tokens, obj)
                //Photopicker.openPicker()
                // dispatch(setLoading(true))
              }, 600);
              dispatch(setLoading(true))
            }, 300);

          }
        }}

        onPressvideoGallery={() => {
          setshowCameraModal(false);
          if (isUploadingNative) {
            Alert.alert('Upload in progress', "Please wait for current uploading")
          }
          else {
            setTimeout(() => {
              // Photopicker.openPicker();

              setTimeout(async () => {
                const tokens = await getData("@tokens");
                let obj = {
                  collection_id: "",
                  type: 'Gallery',
                  is_first_chunk: '0',
                  saveToLibrary: "0",
                  media_type: "video"
                };

                Photopicker.openVideoPicker({}, tokens, obj)
                //Photopicker.openPicker()
                // dispatch(setLoading(true))
              }, 600);
              dispatch(setLoading(true))
            }, 300);

          }
        }}
      />
    </View>
  );
};

export default UserGallery;

const styles = StyleSheet.create({
  button: {
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  hoveredButton: {
    padding: 15,
    backgroundColor: 'lightblue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export const ImgBlock = React.memo(
  ({
    item,
    index,
    onPress,
    onPressDelete,
    onLongPress,
    deleteOn,
    deleteArr,
    addToDeleteArray,
    scrollAction,
  }) => {
    console.log(item?.media_type, "media type testinggggggggg")
    const [showImg, setShowImg] = useState(false);
    return (
      <Pressable
        style={{
          marginTop: widthPercentageToDP(4),
          marginLeft: widthPercentageToDP(2),
          justifyContent: 'center',
          alignItems: 'center',
        }}
        // onLongPress={onLongPress}
        onPress={() => {
          deleteOn ? addToDeleteArray() : scrollAction();
        }}>
        <GalleryImageViewer
          visible={showImg}
          media={fileUrl + item?.media_name}
          closeModal={() => setShowImg(false)}
        />
        {item?.media_type == 'video' && (
          <View
            style={{ height: 40, width: 40, position: 'absolute', zIndex: 10 }}>
            <Image
              source={Appimg.play}
              style={{ height: '100%', width: '100%' }}
            />
          </View>
        )}
        {item?.media_type == 'video' ? (
          <VideoThumb source={item?.media_name} resizeMode={"cover"}
            styleMain={{ width: widthPercentageToDP(30), height: widthPercentageToDP(30), borderRadius: 4, }}
          />
        ) : (
          <Image
            source={
              item?.media_name ? { uri: fileUrl + item?.media_name } : Appimg.logo
            }
            style={{
              width: widthPercentageToDP(30),
              height: widthPercentageToDP(30),
              borderRadius: 4,
            }}
          />
        )}
        {deleteOn && (
          <View
            style={{
              backgroundColor: deleteArr?.includes(item?._id)
                ? Appcolor.yellow
                : 'transparent',
              borderWidth: 2,
              borderColor: Appcolor.yellow,
              height: 24,
              width: 24,
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              bottom: 0,
              right: 0,
            }}>
            {deleteArr?.includes(item?._id) && (
              <Image
                source={require('../../assets/read.png')}
                style={{ height: '46%', width: '70%', tintColor: Appcolor.white }}
              />
            )}
          </View>
        )}
      </Pressable>
    );
  },
);

export const SingleBlock = React.memo(({ item, index, onPressVideo }) => {
  return (
    <Pressable style={{ marginTop: widthPercentageToDP(4) }}>
      {item?.media_type == 'video' ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Pressable
            onPress={onPressVideo}
            style={{
              height: 60,
              width: 60,
              position: 'absolute',
              zIndex: 10,
              alignSelf: 'center',
              marginTop: heightPercentageToDP(32),
            }}>
            <Image
              source={Appimg.play}
              style={{ height: '100%', width: '100%' }}
            />
          </Pressable>
          <VideoThumb source={item?.media_name} resizeMode={"cover"}
            styleMain={{ width: widthPercentageToDP(100), height: heightPercentageToDP(70), borderRadius: 4, }}
          />
        </View>
      ) : (
        <Pinchable>
          <FastImage
            source={
              item?.media_name
                ? { uri: fileUrl + item?.media_name }
                : require('../../assets/logoo.png')
            }
            style={{
              width: widthPercentageToDP(100),
              height: heightPercentageToDP(70),
            }}
            resizeMode="contain"
          />
        </Pinchable>
      )}
    </Pressable>
  );
});
