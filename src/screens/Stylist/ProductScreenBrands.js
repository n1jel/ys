import { ActivityIndicator, FlatList, ImageBackground, StyleSheet, View, } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import FastImage from 'react-native-fast-image';
import { heightPercentageToDP, widthPercentageToDP, } from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { fileUrl } from '../../apimanager/httpmanager';
import { useTheme } from '@react-navigation/native';
import { setLoading } from '../../redux/load';
import { GetCollectionDetail, SendNotification, getBrandCollectionDetail, likeUnlikeStylist, } from '../../apimanager/httpServices';
import showToast from '../../CustomToast';
import { FlashList } from '@shopify/flash-list';
import { N3Block, VerticalBlock } from './ProductScreen';
import moment from 'moment'
import firestore from '@react-native-firebase/firestore';

const ProductScreenBrands = ({ navigation, route }) => {
    let dispatch = useDispatch();
    const { Appcolor } = useTheme();

    let theme = useSelector(state => state.theme)?.theme;
    const user = useSelector(state => state?.auth?.user);

    const [data, setdata] = useState({});
    const [isMine, setIsMine] = useState(false);
    const [showVertical, setShowVertical] = useState(false);
    const [allMedia, setAllMedia] = useState([]);
    const [initialRenderIndex, setInitialRenderIndex] = useState(0);
    const [gettingMore, setGettingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalMedia, setTotalMedia] = useState(0);
    const limit = 18;
    const [_item, set_item] = useState('');

    const preloadImages = () => {
        allMedia.forEach((item, index) => {
            const { media_name, media_type, thumbnail } = item?.gallery_data;
            let url = fileUrl + (media_type == 'image' ? media_name : thumbnail);
            FastImage.preload([{ uri: url }]);
        });
    };

    useEffect(() => {
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

    const ref = useRef(null);
    async function get_data(id) {
        if (!id) {
            return;
        }
        let data = { collection_id: id, page: 1, limit: limit };
        try {
            dispatch(setLoading(true));
            let res = await getBrandCollectionDetail(data);
            if (res?.data?.status) {
                ref.current = res?.data?.data?._id;
                setdata(res.data.data);
                setAllMedia(res?.data?.data?.media_data);
                setTotalPage(res?.data?.other?.total_page);
                setPage(res?.data?.other?.current_page);
                setTotalMedia(res?.data?.other?.total_entries);
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
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
            let res = await getBrandCollectionDetail(data);
            if (res?.data?.status) {
                let temp = [...allMedia]?.concat(res?.data?.data?.media_data);
                setAllMedia(temp);
                setPage(res?.data?.other?.current_page);
            } else {
            }
        } catch (e) {
        } finally {
            setGettingMore(false);
        }
    }
    const _loaderComp = () => {
        return gettingMore ? (
            <ActivityIndicator size={'large'} color={Appcolor.primary} />
        ) : (
            <></>
        );
    };
    const likingFuntion = async (data, index, item) => {
        try {
            let response = await likeUnlikeStylist(data)
            if (response?.data?.status) {
                updateData(response?.data?.data ?? "", index)
                if (item?.like_data?.length) {
                    return
                }
                sendMessage(item, "liked")
            } else {
                showToast(response?.data?.message)
            }
        } catch (e) {
            console.error(e);
        }
    }
    const updateData = useCallback((data, index) => {
        let temp = [...allMedia]
        let x = temp[index]
        x = { ...x, like_data: data ? [data] : [] }
        temp.splice(index, 1, x)
        setAllMedia(temp)
    }, [allMedia])
    async function sendMessage(item, from = "message") {
        const isBrand = data?.brand_id ? true : false

        const uploadedBy = isBrand ? data?.brand_data?.[0] : item?.stylist_data?.[0]
        const uId = isBrand ? data?.brand_id : item?.stylist_id

        let room = [uId, user?._id].sort().join("_")
        let type = item?.gallery_data?.media_type

        const message = {
            _id: moment().unix(),
            text: type == "video" ? "Video" : 'Picture',
            type: type || "image",
            image: fileUrl + item?.gallery_data?.media_name,
            imageData: item,
            collectionitem: data,
            isConfirmed: 0,
            isLiked: from == "liked" ? 1 : 0,
            createdAt: moment().unix(),
            user: {
                _id: user?._id,
                full_name: user?.full_name,
                profile_pic: user?.profile_pic
            }
        }
        firestore().collection('chats').doc(room).get().then(documentSnapshot => {
            firestore().collection('chats').doc(room).collection("messages").add(message)
            firestore().collection('chats').doc(room).set({
                users: [user, uploadedBy],
                unreadCount: {
                    [`${user?._id}`]: 0,
                    [`${uId}`]: firestore.FieldValue.increment(1),
                },
                userIds: [user?._id, uId],
                lastMessage: message,
                type: "single",
            }, { merge: true }).then((res) => {
                if (from != "liked") {
                    navigation.navigate('StylistChat', { item: isBrand ? { ...uploadedBy, user_type: "brand" } : uploadedBy })
                    SendNotification({ collection_id: item?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'brand', user_id: uId, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'brand', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
                }
            })
        });
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground
                source={theme == 'dark' ? Appimg.darkbg : Appimg?.bg}
                resizeMode="cover"
                style={{ flex: 1 }}>
                <Header
                    name={route?.params?._item?.stylist_data?.[0]?.full_name}
                    title={`${data?.name || ''} (${totalMedia ?? 0})`}
                    showBack={true}
                    onBackPress={() => {
                        if (showVertical) {
                            setShowVertical(false);
                            return;
                        }
                        navigation.goBack();
                    }}
                />
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
                        extraData={[]}
                        removeClippedSubviews={true}
                        renderItem={({ item, index }) => {
                            return (
                                <N3Block
                                    item={item}
                                    index={index}
                                    isMine={isMine}
                                    onPress={() => {
                                        setInitialRenderIndex(index);
                                        setTimeout(() => {
                                            setShowVertical(true);
                                        }, 400);
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
                        renderItem={({ item, index }) => {
                            return (
                                <VerticalBlock
                                    brand={true}
                                    item={item}
                                    onPressVideo={media_name => {
                                        navigation?.navigate('VideoPlayer', { media: media_name });
                                    }}
                                    onPressLike={() => {
                                        let obj = { collection_id: item?.gallery_data?.collection_id, brand_id: item?.gallery_data?.brand_id, media_id: item?._id }
                                        likingFuntion(obj, index, item)
                                    }}
                                    onMessagePress={() => {
                                        sendMessage(item)
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
            </ImageBackground>
        </View>
    );
};

export default ProductScreenBrands;

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