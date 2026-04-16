import { ActivityIndicator, Alert, FlatList, Image, ImageBackground, NativeEventEmitter, NativeModules, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Appcolor from '../../constants/Appcolor';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import FastImage from 'react-native-fast-image';
import { heightPercentageToDP, widthPercentageToDP, } from 'react-native-responsive-screen';
import Commonstyles from '../../constants/Commonstyles';
import JacketModal from '../../components/JacketModal';
import { useDispatch, useSelector } from 'react-redux';
import { fileUrl } from '../../apimanager/httpmanager';
import { useTheme } from '@react-navigation/native';
import { setLoading } from '../../redux/load';
import showToast from '../../CustomToast';
import OptionsModal from '../../components/OptionsModal';
import Appfonts from '../../constants/Appfonts';
import Pinchable from 'react-native-pinchable';
import { FlashList } from '@shopify/flash-list';
import { setUploadTask } from '../../redux/uploadReducer';
import { getData } from '../../utils/asyncstore';
import analytics from '@react-native-firebase/analytics';
import LinkBlock from '../../components/LinkBlock';
import VideoThumb from '../../components/VideoThumb';
import { addCaption, deleteCollectionMedia, getCollectionDetail, setCoverImage } from '../../apimanager/brandServices';

const ProductScreenB = ({ navigation, route }) => {
  let dispatch = useDispatch();
  const { Appcolor } = useTheme();
  const { Photopicker } = NativeModules;

  let theme = useSelector(state => state.theme)?.theme;
  const user = useSelector(state => state?.auth?.user);
  let isUploadingNative = useSelector(state => state?.appstate?.isUploadingNative,);
  let isUploading = useSelector(state => state?.uploadReducer?.isUploading);

  const [showPost, setShowPost] = useState(false);
  const [media, setMedia] = useState('');
  const [mediatype, setMediatype] = useState('');
  const [mediaData, setMediaData] = useState(null);
  const [data, setdata] = useState({});
  const [isMine, setIsMine] = useState(false);
  const [showVertical, setShowVertical] = useState(false);
  const [allMedia, setAllMedia] = useState([]);
  const [initialRenderIndex, setInitialRenderIndex] = useState(0);
  const [gettingMore, setGettingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalMedia, setTotalMedia] = useState(0);
  const limit = 30;
  const [_item, set_item] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingArr, setDeletingArr] = useState([]);
  const [coverSelectionMode, setCoverSelectionMode] = useState(false);
  const [selectionModal, setSelectionModal] = useState(false);
  const chunkSize = 20000;

  const ref = useRef(null);

  const preloadImages = () => {
    allMedia.forEach((item, index) => {
      const { media_name, media_type, thumbnail } = item?.gallery_data;
      let url = fileUrl + (media_type == 'image' ? media_name : thumbnail);
      FastImage.preload([{ uri: url }]);
    });
  };

  useEffect(() => {
    // Start preloading images
    if (allMedia.length > 0) {
      preloadImages();
    }
  }, [allMedia]);
  useEffect(() => {
    if (route.params?._item?._id) {
      get_data(route.params?._item?._id);
      set_item(route.params?._item);
    }
  }, [route?.params?._item?._id]);
  useEffect(() => {
    if (data?.brand_id == user?._id) {
      setIsMine(true);
    } else {
      setIsMine(false);
    }
  }, [data, user]);
  useEffect(() => {
    if (deletingArr?.length == 0) {
      setDeleteMode(false);
    }
  }, [deletingArr]);
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(Photopicker);

    eventEmitter.addListener('sendDataToJS', i => {
      //  console.log(i, "image url", typeof i[0], typeof i[1])

      if (Platform.OS == 'android') {
        if (i == '[]') {
          dispatch(setLoading(false));
          setTimeout(() => {
            navigation?.navigate('BottomTabB');
          }, 0);
        }
      } else {
        if (i[0].length == 0) {
          dispatch(setLoading(false));
          setTimeout(() => {
            navigation?.navigate('BottomTabB');
          }, 0);
        }
      }

      // if (i?.[0]?.length == 0) {
      //     dispatch(setLoading(false))
      //     setTimeout(() => {
      //         navigation?.navigate('BottomTabB');
      //     }, 0);
      // }
      // else {
      //     createCollection([...i[0]]);
      //     console.log('LLLL');
      // }
    });
    return () => {
      eventEmitter.removeAllListeners('sendDataToJS');
    };
  }, [Photopicker]);
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(Photopicker);

    eventEmitter.addListener('video', i => {
      //  console.log(i, "image url", typeof i[0], typeof i[1])

      //  console.log(i,"Videos in js")

      if (i.length == 0) {
        setTimeout(() => {
          navigation?.navigate('BottomTabB');
        }, 0);
        // dispatch(setLoading(false))
        // console.log("Empty Array");
        // showToast('No medias selected');
      } else {
        // uploadCollection([...i])
        // //  createCollection([...i])
        // setfileUrl(i[0].uri)
        // console.log("LLLL");
      }
    });
    return () => {
      eventEmitter.removeAllListeners('video');
    };
  }, [Photopicker]);
  useEffect(() => {
    const LogeventEmitter = new NativeEventEmitter(Photopicker);

    LogeventEmitter.addListener('fireEvent', i => {
      //  console.log(i, "image url", typeof i[0], typeof i[1])

      console.log(i, 'Videos in js');
      analytics().logEvent('fireEvent', { ...i });
    });
    return () => {
      LogeventEmitter.removeAllListeners('fireEvent');
    };
  }, [Photopicker]);

  async function get_data(id) {
    if (!id) {
      return;
    }
    let data = { collection_id: id, page: 1, limit: limit };
    try {
      dispatch(setLoading(true));
      let res = await getCollectionDetail(data);
      if (res?.data?.status) {
        ref.current = res?.data?.data?._id;
        setdata(res.data.data);
        setAllMedia(res?.data?.data?.media_data);
        setTotalPage(res?.data?.other?.total_page);
        setPage(res?.data?.other?.current_page);
        setTotalMedia(res?.data?.other?.total_entries);
      } else {
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false));
    }
  }
  const checkforMoreData = () => {
    if (page < totalPage && !gettingMore) {
      get_more_data(page + 1);
    }
  };
  async function get_more_data(page) {
    let data = { collection_id: _item?._id, page: page, limit: limit };
    try {
      setGettingMore(true);
      let res = await getCollectionDetail(data);
      if (res?.data?.status) {
        let temp = [...allMedia]?.concat(res?.data?.data?.media_data);
        setAllMedia(temp);
        setPage(res?.data?.other?.current_page);
      } else {
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGettingMore(false);
    }
  }
  async function on_set_cover(item) {
    let _data = {
      collection_id: data?._id,
      media_id: item?._id,
    };
    try {
      dispatch(setLoading(true));
      let res = await setCoverImage(_data);
      if (res?.data?.status) {
        showToast(res.data.message);
        get_data(_item?._id);
      } else {
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false));
    }
  }
  const addMediaCaption = async (caption, id, link) => {
    let data = {
      media_id: id,
      caption: caption,
      link,
    };
    try {
      dispatch(setLoading(true));
      let res = await addCaption(data);
      if (res?.data?.status) {
        showToast(res?.data?.message);
        get_data(_item?._id);
      } else {
        showToast(res?.data?.message ?? 'Something went wrong.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false));
    }
  };
  const deleteFunctionCalled = item => {
    setDeleteMode(true);
    addToDeleteArray(item?._id);
  };
  const addToDeleteArray = useCallback(
    id => {
      let temp = [...deletingArr];
      if (!temp?.includes(id)) {
        temp.push(id);
      } else {
        temp = temp.filter(x => x != id);
      }
      setDeletingArr(temp);
    },
    [deletingArr],
  );
  const deleteSelectedMedia = async arr => {
    if (arr?.length == 0) {
      setDeleteMode(false);
      showToast('No media selected');
      return;
    }
    try {
      dispatch(setLoading(true));
      let res = await deleteCollectionMedia({
        media_id: arr,
        collection_id: data?._id,
      });
      if (res?.data?.status) {
        showToast(res?.data?.message);
        let temp = [...allMedia];
        temp = temp?.filter(x => !arr?.includes(x?._id));
        setAllMedia(temp);
        setTotalMedia(totalMedia - arr?.length);
      } else {
        showToast(res?.data?.message || 'Something went wrong.');
      }
    } catch (e) {
    } finally {
      setDeleteMode(false);
      setDeletingArr([]);
      dispatch(setLoading(false));
    }
  };
  const optSelected = async type => {
    if (type == 'library') {
      const tokens = await getData('@tokens');
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        Photopicker.editCollectionGallery(data?._id, tokens, {
          collectionType: 'Brands',
        });
      }
    } else if (type == 'gallery') {
      console.log(data?._id, '::::LLLLLLLLLLL', ref.current);
      const tokens = await getData('@tokens');
      let obj = {
        collection_id: ref.current,
        type: 'update',
        is_first_chunk: '0',
        saveToLibrary: '1',
        media_type: 'image',
        collectionType: 'Brands',
      };
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        dispatch(setLoading(true));
        setTimeout(() => {
          Photopicker.openPicker({}, tokens, obj);
        }, 600);
      }
    } else if (type == 'camera') {
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        navigation?.navigate('ImageSelectionGalleryB', {
          collectionId: data?._id,
          picker: 'camera',
        });
      }
    } else if (type == 'video') {
      const tokens = await getData('@tokens');
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        setTimeout(async () => {
          let obj = {
            collection_id: ref.current,
            type: 'update',
            is_first_chunk: '0',
            saveToLibrary: '1',
            media_type: 'video',
            collectionType: 'Brands',
          };
          Photopicker.openVideoPicker({}, tokens, obj);
        }, 300);
      }
    }
  };
  const _loaderComp = () => {
    return gettingMore ? (
      <ActivityIndicator size={'large'} color={Appcolor.primary} />
    ) : (
      <></>
    );
  };
  const createCollection = async alldata => {
    console.log(data?._id, '::::LLLLLLLLLLL', ref.current);
    dispatch(setLoading(true));
    try {
      divideArrayIntoChunks(alldata, chunkSize, ref.current);
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
        },
      };
      if (isUploading) {
        dispatch(setLoading(false));
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        console.log(options);
        dispatch(setLoading(false));

        dispatch(setUploadTask(options));
        setTimeout(() => {
          navigation?.navigate('BottomTabB');
        }, 0);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Appcolor.white }}>
      <ImageBackground
        source={theme == 'dark' ? Appimg.darkbg : Appimg?.bg}
        resizeMode="cover"
        style={{ flex: 1 }}>
        <Header
          name={route?.params?._item?.brand_data?.[0]?.full_name}
          title={`${data?.name || ''} (${totalMedia ?? 0})`}
          showBack={true}
          onBackPress={() => {
            if (showVertical) {
              setShowVertical(false);
              return;
            }
            navigation.goBack();
          }}
          showSelectionBox={isMine && !deleteMode && !showVertical}
          onPressSelectionBox={() => setDeleteMode(true)}
          showDelete={isMine && deleteMode}
          onPressDelete={() => {
            deleteSelectedMedia(deletingArr);
          }}
        />
        <JacketModal
          vis={showPost}
          data={media}
          mediatype={mediatype}
          mediaData={mediaData}
          onPressOut={() => setShowPost(false)}
          onPressSave={(caption, id, link) => {
            setShowPost(false);
            if (caption.trim() == '' && link.trim() == '') {
              return;
            }
            addMediaCaption(caption, id, link);
          }}
          isMine={isMine}
        />
        {isMine && !showVertical && !deleteMode && (
          <Text
            style={[
              Commonstyles(Appcolor).mediumText14,
              { marginHorizontal: 16, marginTop: 16, textAlign: 'center' },
            ]}>
            Long press any image to set collection Cover image
          </Text>
        )}
        {!showVertical ? (
          <FlashList
            data={allMedia}
            keyExtractor={item => item._id}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: heightPercentageToDP(16),
            }}
            numColumns={3}
            estimatedItemSize={widthPercentageToDP(29)}
            extraData={[deletingArr, deleteMode]}
            removeClippedSubviews={true}
            renderItem={({ item, index }) => {
              return (
                <_renderBlock
                  item={item}
                  index={index}
                  isMine={isMine}
                  hideCapIcon={deleteMode || coverSelectionMode}
                  deleteMode={deleteMode}
                  deleteArr={deletingArr}
                  onLongPress={() => {
                    if (!isMine || deleteMode) {
                      return;
                    }
                    if (item?.gallery_data?.media_type == 'image') {
                      on_set_cover(item);
                    } else {
                      showToast('You cannot set video as cover image');
                    }
                  }}
                  onPress={() => {
                    if (deleteMode) {
                      if (item?.is_cover_image != 1) {
                        addToDeleteArray(item?._id);
                      }
                      return;
                    }
                    if (coverSelectionMode) {
                      if (item?.gallery_data?.media_type == 'image') {
                        on_set_cover(item);
                      } else {
                        showToast('You cannot set video as cover image');
                      }
                      setCoverSelectionMode(false);
                      return;
                    }
                    setInitialRenderIndex(index);
                    setTimeout(() => {
                      setShowVertical(true);
                    }, 400);
                  }}
                  onPressPin={() => {
                    setShowPost(true);
                    setMedia(item?.gallery_data?.media_name),
                      setMediatype(item?.gallery_data?.media_type),
                      setMediaData(item);
                  }}
                />
              );
            }}
            onEndReachedThreshold={0}
            onEndReached={() => {
              checkforMoreData();
            }}
            ListFooterComponent={() => <_loaderComp />}
          />
        ) : (
          <FlatList
            keyExtractor={item => item._id}
            data={allMedia}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={initialRenderIndex}
            getItemLayout={(data, index) => {
              return {
                length: heightPercentageToDP(65),
                index,
                offset: heightPercentageToDP(65) * index,
              };
            }}
            renderItem={({ item }) => {
              return (
                <VerticalBlock
                  item={item}
                  onPressVideo={media_name => {
                    navigation?.navigate('VideoPlayer', { media: media_name });
                  }}
                />
              );
            }}
            onEndReached={() => {
              checkforMoreData();
            }}
            ListFooterComponent={() => <_loaderComp />}
          />
        )}
        <OptionsModal
          visible={selectionModal}
          onPressOpt={type => {
            optSelected(type);
          }}
          onPressCancel={() => setSelectionModal(false)}
        />
        {isMine && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Appcolor.white }]}
            onPress={() => {
              setSelectionModal(true);
            }}>
            <FastImage
              source={Appimg?.plus}
              style={{ height: '100%', width: '100%' }}
            />
          </TouchableOpacity>
        )}
      </ImageBackground>
    </View>
  );
};

export default ProductScreenB;

const styles = StyleSheet.create({
  addBtn: {
    height: 46,
    width: 46,
    position: 'absolute',
    borderRadius: 60,
    zIndex: 1,
    bottom: heightPercentageToDP(10),
    right: 10,
  },
});

const _renderBlock = ({
  item,
  index,
  onPress,
  onLongPress,
  isMine,
  deleteArr,
  onPressPin,
  hideCapIcon,
  deleteMode,
}) => {
  const { media_name, media_type, thumbnail } = item?.gallery_data;
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  console.log('in render block');
  const placeholderImage = Appimg.noImage;
  useEffect(() => {
    if (deleteArr?.includes(item?._id)) {
      setIsBeingDeleted(true);
    } else {
      setIsBeingDeleted(false);
    }
  }, [deleteArr, item]);

  return (
    <Pressable
      style={{
        marginTop: 10,
        marginLeft: widthPercentageToDP(2),
        width: widthPercentageToDP(29),
        height: widthPercentageToDP(29),
        marginBottom: widthPercentageToDP(2),
      }}
      onLongPress={onLongPress}
      onPress={onPress}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        {media_type == 'video' && (
          <FastImage
            source={Appimg.play}
            style={{
              tintColor: Appcolor.white,
              height: 50,
              width: 50,
              position: 'absolute',
              zIndex: 10,
            }}
          />
        )}
        {media_type == 'video' && !thumbnail ? (
          <VideoThumb
            source={media_name}
            onLoad={() => {
              setImageLoaded(true);
            }}
            resizeMode={'cover'}
          />
        ) : (
          <FastImage
            onLoad={() => setImageLoaded(true)}
            resizeMode="cover"
            source={
              media_type == 'video' && !thumbnail
                ? Appimg.logo
                : {
                  uri:
                    fileUrl +
                    (media_type == 'image' ? media_name : thumbnail),
                }
            }
            style={{ width: '100%', height: '100%', borderRadius: 4 }}
          />
        )}
        {!imageLoaded && (
          <Image
            blurRadius={1}
            source={placeholderImage}
            style={{
              position: 'absolute',
              zIndex: 1,
              width: '100%',
              height: '100%',
              borderRadius: 4,
            }}
          />
        )}
      </View>
      {item?.is_cover_image == 1 && isMine && (
        <View
          style={{
            height: 25,
            width: 25,
            borderRadius: 12.5,
            position: 'absolute',
            top: -5,
            left: 0,
            backgroundColor: Appcolor.txt,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FastImage source={Appimg.pin} style={{ height: 15, width: 15 }} />
        </View>
      )}
      {isMine && !hideCapIcon && (
        <TouchableOpacity
          style={{ position: 'absolute', zIndex: 10, right: 0, top: 0 }}
          onPress={onPressPin}>
          <FastImage source={Appimg.edit} style={{ height: 22, width: 22 }} />
        </TouchableOpacity>
      )}
      {deleteMode && (
        <View
          style={{
            backgroundColor: isBeingDeleted ? Appcolor.yellow : 'transparent',
            borderColor: Appcolor.yellow,
            borderWidth: 2,
            height: 24,
            width: 24,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}>
          {isBeingDeleted && (
            <Image
              source={require('../../assets/read.png')}
              style={{ height: '46%', width: '70%', tintColor: Appcolor.white }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

const VerticalBlock = ({ item, onPressVideo }) => {
  console.log('in vertical block');
  const { Appcolor } = useTheme();
  const { media_name, media_type, thumbnail } = item?.gallery_data;
  return (
    <View style={{ marginBottom: 16, backgroundColor: Appcolor.blackcolor, justifyContent: 'center', alignItems: 'center', }}>
      {media_type == 'video' && (
        <Pressable
          onPress={() => {
            onPressVideo(media_name);
          }}
          style={{ position: 'absolute', zIndex: 10 }}>
          <FastImage
            source={Appimg.play}
            style={{ tintColor: Appcolor.txt, height: 50, width: 50 }}
          />
        </Pressable>
      )}
      {media_type == 'video' && !thumbnail ? (
        <VideoThumb
          source={media_name}
          styleMain={{
            width: widthPercentageToDP(100),
            height: heightPercentageToDP(60),
          }}
        />
      ) : media_type == 'video' ? (
        <Pressable
          onPress={() => {
            onPressVideo(media_name);
          }}>
          <FastImage
            resizeMode="cover"
            source={{ uri: fileUrl + (media_type == 'image' ? media_name : thumbnail), }}
            style={{ width: widthPercentageToDP(100), height: heightPercentageToDP(60), borderRadius: 4, }}
          />
        </Pressable>
      ) : (
        <Pinchable>
          <FastImage
            resizeMode="contain"
            source={{ uri: fileUrl + (media_type == 'image' ? media_name : thumbnail), }}
            style={{ width: widthPercentageToDP(100), height: heightPercentageToDP(60), borderRadius: 4, }}
          />
        </Pinchable>
      )}
      {item?.caption && (
        <Text
          style={{
            color: Appcolor.txt,
            fontSize: 14,
            fontFamily: Appfonts.medium,
            marginTop: 8,
            marginLeft: 4,
            alignSelf: 'flex-start',
          }}>
          {item?.caption}
        </Text>
      )}
      <LinkBlock
        styleMain={{ alignSelf: 'flex-end', marginRight: 10 }}
        link={item?.link}
      />
    </View>
  );
};
