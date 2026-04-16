import { Alert, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View, NativeModules, NativeEventEmitter } from 'react-native';
import React, { useEffect, useState } from 'react';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import Tinput from '../../components/Tinput';
import en from '../../translation';
import CustomDrop from '../../components/CustomDrop';
import Commonstyles from '../../constants/Commonstyles';
import FastImage from 'react-native-fast-image';
import Btn from '../../components/Btn';
import showToast from '../../CustomToast';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../redux/load';
import Searchbar from '../../components/Searchbar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '@react-navigation/native';
import { getData } from '../../utils/asyncstore';
import OptionsModal from '../../components/OptionsModal';
import { setCollectionData } from '../../redux/CommanReducer';
import { Store } from '../../redux/Store';
import analytics from '@react-native-firebase/analytics';
import { searchFollowers } from '../../apimanager/brandServices';

const CreateCollectionB = ({ navigation }) => {
  let dispatch = useDispatch();
  const { Photopicker } = NativeModules;
  const { Appcolor } = useTheme();

  let theme = useSelector(state => state.theme)?.theme;
  let isUploadingNative = useSelector(state => state?.appstate?.isUploadingNative,);
  const user = useSelector(state => state?.auth?.user)

  const [collectionName, setCollectionName] = useState('');
  const [collectionAbout, setCollectionAbout] = useState('');
  const [display, setDisplay] = useState([{ label: 'public', value: 'public' }, { label: 'private', value: 'private' }]);
  const [displayVal, setDisplayVal] = useState('');
  const [selectionModal, setSelectionModal] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tagged, setTagged] = useState([]);

  useEffect(() => {
    if (user?.is_added_by_brand == 0) {
      let temp = [...display]
      temp.push({ label: 'employees', value: 'employees' })
      setDisplay(temp)
    }
  }, [user])
  useEffect(() => {
    if (displayVal == 'public') {
      setSearchKey('');
      setTagged([]);
      setSearchResults([]);
    }
  }, [displayVal]);
  useEffect(() => {
    if (searchKey != '') {
      searchUser(searchKey);
    }
  }, [searchKey]);
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(Photopicker);

    eventEmitter.addListener('sendDataToJS', i => {
      analytics().logEvent('onDataComingfromListner');
      if (Platform.OS == "ios") {
        if (i?.[0]?.length == 0) {
          analytics().logEvent('cancel_or_EmptyArray');
          setTimeout(() => {
            navigation?.navigate('BottomTabB');
          }, 0);
        } else {
          analytics().logEvent('DAtaFoundFromListner');
        }
      } else {
        if (i == "[]") {
          dispatch(setLoading(false))
          setTimeout(() => {
            navigation?.navigate("BottomTabB");
          }, 0);
        }
      }
    });
    return () => {
      eventEmitter.removeAllListeners('sendDataToJS');
    };
  }, [Photopicker]);
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(Photopicker);

    eventEmitter.addListener('video', i => {
      if (Platform.OS == 'ios') {
        if (i.length == 0) {
          setTimeout(() => {
            navigation?.navigate('BottomTabB');
          }, 0);
        }
      } else {
        if (i == '[]') {
          setTimeout(() => {
            navigation?.navigate('BottomTabB');
          }, 0);
        }
      }
    });
    return () => {
      eventEmitter.removeAllListeners('video');
    };
  }, [Photopicker]);
  useEffect(() => {
    const LogeventEmitter = new NativeEventEmitter(Photopicker);
    LogeventEmitter.addListener('fireEvent', i => {
      analytics().logEvent('fireEvent', { ...i });
    });
    return () => {
      LogeventEmitter.removeAllListeners('video');
    };
  }, [Photopicker]);

  const optSelected = async type => {
    if (type == 'library') {
      let data = {};
      if (displayVal == 'private') {
        data = {
          name: collectionName,
          description: collectionAbout,
          display_type: displayVal,
          display_to: tagged,
        };
      } else {
        data = {
          name: collectionName,
          description: collectionAbout,
          display_type: displayVal,
        };
      }
      const tokens = await getData('@tokens');
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        Photopicker.openCreateLibrary(data, tokens, { collectionType: 'Brands' });
      }
    } else if (type == 'gallery') {
      analytics().logEvent('onNAtivegalleryModal');
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        setTimeout(async () => {
          dispatch(setLoading(true));
          const tokens = await getData('@tokens');
          let obj = {
            collection_id: '',
            type: 'add',
            is_first_chunk: '1',
            saveToLibrary: '1',
            media_type: 'image',
            collectionType: 'Brands',
          };
          Photopicker.openPicker(
            Store.getState().CommanReducer.collectionData,
            tokens,
            obj,
          );
        }, 500);
      }
    } else if (type == 'camera') {
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        navigation?.navigate('ImageSelectionGalleryB', {
          displayVal,
          tagged,
          collectionName,
          collectionAbout,
          picker: 'camera',
        });
      }
    } else if (type == 'video') {
      setSelectionModal(false);
      if (isUploadingNative) {
        Alert.alert('Upload in progress', 'Please wait for current uploading');
      } else {
        setTimeout(async () => {
          const tokens = await getData('@tokens');
          let obj = {
            collection_id: '',
            type: 'update',
            is_first_chunk: '0',
            saveToLibrary: '1',
            media_type: 'video',
            collectionType: 'Brands',
          };
          Photopicker.openVideoPicker(
            Store.getState().CommanReducer.collectionData,
            tokens,
            obj,
          );
        }, 300);
      }
    }
  };
  const searchUser = async (key) => {
    try {
      let res = await searchFollowers({ keyword: key, type: "both" })
      if (res?.data?.status) {
        setSearchResults(res?.data?.data)
      } else {
        showToast(res?.data?.message ?? "Network Error")
      }
    } catch (e) {
      console.error(e);
    } finally {
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Appcolor?.white }}>
      <OptionsModal
        visible={selectionModal}
        onPressOpt={type => {
          optSelected(type);
        }}
        onPressCancel={() => setSelectionModal(false)}
      />
      <ImageBackground
        source={theme == 'dark' ? Appimg.darkbg : Appimg?.bg}
        resizeMode="cover"
        style={{ flex: 1 }}>
        <Header
          title={'Create Collection'}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <Tinput
            value={collectionName}
            onChangeText={t => setCollectionName(t)}
            place={en?.collectionname}
            styleMain={{ marginTop: 26 }}
          />
          <Tinput
            value={collectionAbout}
            onChangeText={t => setCollectionAbout(t)}
            place={en?.aboutcollection}
            styleMain={{ marginTop: 16 }}
            multiline
            styleInput={{ height: 80 }}
            tav={Platform?.OS == 'android' && 'top'}
          />
          <CustomDrop
            data={display}
            label={en?.display}
            place={'Show to...'}
            styleMain={{ marginTop: 16 }}
            val={displayVal}
            setVal={t => setDisplayVal(t)}
          />
          {displayVal == 'private' && (
            <Searchbar
              styleMain={{ marginTop: 16 }}
              value={searchKey}
              onChangeText={t => {
                setSearchKey(t);
              }}
              textInputProps={{
                onSubmitEditing: () => {
                  searchUser(searchKey);
                },
              }}
            />
          )}
          {searchResults?.length > 0 && (
            <View
              style={[
                {
                  marginHorizontal: 18,
                  backgroundColor: Appcolor.primary,
                  marginTop: 8,
                },
                Commonstyles(Appcolor).shadow,
              ]}>
              {searchResults?.map((i, j) => {
                return (
                  <Pressable
                    style={{ padding: 8 }}
                    key={j}
                    onPress={() => {
                      let temp = [...tagged];
                      let arr = temp.filter(x => x?._id == i?._id);
                      if (arr.length == 0) {
                        temp.push(i);
                        setTagged(temp);
                      }
                      setSearchResults([]);
                      setSearchKey('');
                    }}>
                    <Text>{i?.full_name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {tagged?.length > 0 && (
            <ScrollView
              horizontal
              contentContainerStyle={{
                paddingHorizontal: 18,
                marginVertical: 12,
              }}>
              {tagged.map((i, j) => {
                return (
                  <View
                    key={i?._id}
                    style={{
                      backgroundColor: Appcolor.primary,
                      minWidth: 60,
                      padding: 8,
                      minHeight: 34,
                      borderRadius: 12,
                      marginRight: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Pressable
                      onPress={() => {
                        let temp = [...tagged];
                        temp.splice(j, 1);
                        setTagged(temp);
                      }}
                      style={{
                        position: 'absolute',
                        right: -6,
                        top: -6,
                        backgroundColor: Appcolor.white,
                        borderRadius: 10,
                      }}>
                      <FastImage
                        source={Appimg?.bin}
                        style={{ height: 10, width: 10, margin: 4 }}
                      />
                    </Pressable>
                    <Text>{i?.full_name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
          <Btn
            transparent={Appcolor.blackop}
            title={en?.continue}
            twhite
            styleMain={{ alignSelf: 'center', marginTop: 80, marginBottom: 40 }}
            onPress={() => {
              if (!collectionName || !collectionAbout || !displayVal) {
                showToast('All field are required.');
                return;
              }
              if (displayVal == 'private') {
                dispatch(
                  setCollectionData(
                    (a = {
                      name: collectionName,
                      description: collectionAbout,
                      display_type: displayVal,
                      display_to: tagged,
                    }),
                  ),
                );
                // if (user?.is_added_by_brand == 1) {
                //   dispatch(
                //     setCollectionData(
                //       (a = {
                //         name: collectionName,
                //         description: collectionAbout,
                //         display_type: displayVal,
                //         display_to: tagged,
                //       }),
                //     ),
                //   );
                // } else {
                //   dispatch(
                //     setCollectionData(
                //       (a = {
                //         name: collectionName,
                //         description: collectionAbout,
                //         display_type: displayVal,
                //         display_to_stylist: tagged,
                //       }),
                //     ),
                //   );
                // }
              } else {
                dispatch(
                  setCollectionData(
                    (a = {
                      name: collectionName,
                      description: collectionAbout,
                      display_type: displayVal,
                    }),
                  ),
                );
              }
              analytics().logEvent('CreateCollectionPressed');
              setSelectionModal(true);
            }}
          />
        </KeyboardAwareScrollView>
      </ImageBackground>
    </View>
  );
};

export default CreateCollectionB;

const styles = StyleSheet.create({});
