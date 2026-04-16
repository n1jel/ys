import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Commonstyles from '../constants/Commonstyles'
import FastImage from 'react-native-fast-image'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appimg from '../constants/Appimg'
import en from '../translation'
import { fileUrl } from '../apimanager/httpmanager'
import moment from 'moment'
import { useNavigation, useTheme } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import Pinchable from 'react-native-pinchable';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { index } from 'realm'
import VideoThumb from './VideoThumb'
import showToast from '../CustomToast'

const FeedBlock = ({ styleView, item, onPressPost, stylist, brand, onMessagePress, _onViewableItemsChanged, _viewabilityConfig, onPressLike, onPressLikeCount }) => {
    let allMedia = item?.media_data
    let uploadedBy = item?.brand_data ? item?.brand_data?.[0] : item?.stylist_data?.[0]
    let stylistUpload = item?.brand_data ? false : true

    const navigation = useNavigation()
    const { Appcolor } = useTheme()
    const [activeInd, setActiveInd] = useState(0)
    const user = useSelector(state => state?.auth?.user)
    const handleScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const viewSize = event.nativeEvent.layoutMeasurement.width;
        const numItems = allMedia.length;
        const active = Math?.floor(contentOffset / viewSize);
        setActiveInd(active)
    };

    // MARK:- Stylist
    if (stylist) {
        const [isLiked, setIsLiked] = useState(false)

        useEffect(() => {
            if (allMedia[0]?.like_data?.length > 0) {
                setIsLiked(true)
            } else {
                setIsLiked(false)
            }
        }, [allMedia])
        return (
            <View style={[styles?.main, Commonstyles(Appcolor).shadow, styleView, { backgroundColor: Appcolor.white }]}>
                {/* topView */}
                <View style={{ paddingHorizontal: 12 }}>
                    <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", }]}>
                        <View style={[Commonstyles(Appcolor).row]}>
                            <Pressable onPress={() => {
                                if (user?._id == item?.stylist_id) {
                                    navigation.navigate("ProfileS")
                                    return
                                }
                                if (item?.stylist_id) {
                                    navigation.navigate("OtherStylist", { stylist: item?.stylist_id });
                                } else {
                                    navigation.navigate('BrandProfileStylist', { brand: item?.brand_id })
                                }
                            }}>
                                <FastImage source={uploadedBy?.profile_pic == '' ? require('../assets/user.png') : { uri: fileUrl + uploadedBy?.profile_pic }} style={{ height: 40, width: 40, borderRadius: 60 }} />
                            </Pressable>
                            <View style={{ marginLeft: 8 }}>
                                <Text style={[Commonstyles(Appcolor).bold20, styles?.userName]}>{uploadedBy?.full_name}</Text>
                                <Text style={[Commonstyles(Appcolor).mediumText10]}>{moment(item?.updated_at).fromNow()}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[Commonstyles(Appcolor).semiBold26, styles?.name]}>{item?.name}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, styles?.desc]}>{item?.description}</Text>
                </View>
                {allMedia.length > 0 ?
                    <Pressable onPress={onPressPost}>
                        <_renderMedia item={allMedia?.[0]} onPressPost={onPressPost} />
                    </Pressable>
                    :
                    <Pressable
                        style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 6, width: widthPercentageToDP(93), marginRight: 10, alignSelf: 'center', height: heightPercentageToDP(50), marginTop: 6 }}
                        onPress={onPressPost}
                    >
                        <FastImage source={Appimg.logo} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
                    </Pressable>
                }
                {stylistUpload ?
                    <Pressable onPress={onPressLikeCount} style={[Commonstyles(Appcolor)?.row, { marginTop: 8, paddingHorizontal: 12 }]}>
                        <FastImage source={Appimg.like} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                        <Text style={[Commonstyles(Appcolor).mediumText10, { fontSize: 10, marginLeft: 6 }]}>{item?.like_data?.length > 0 ? item?.like_data[0]?.total_likes : 0} Likes</Text>
                    </Pressable>
                    :
                    <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", marginTop: 8, paddingHorizontal: 12 }]}>
                        <Pressable onPress={() => onMessagePress(activeInd)} style={[Commonstyles(Appcolor).row]}>
                            <FastImage source={Appimg.messagef} style={{ height: 20, width: 20 }} />
                            <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, marginLeft: 6 }]}>{en?.message}</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                if (item?.media_data?.length == 0) {
                                    showToast("No cover image in the collection")
                                    return
                                }
                                setIsLiked(!isLiked);
                                onPressLike(activeInd)
                            }}
                            style={[Commonstyles(Appcolor)?.row, { marginTop: 8, paddingHorizontal: 12 }]}
                        >
                            <FastImage source={isLiked ? Appimg.like : Appimg.likeempty} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                        </Pressable>
                    </View>
                }
            </View>
        )
    }

    // MARK:- Brand
    else if (brand) {
        let isMine = item?.brand_id == user?._id
        const [isLiked, setIsLiked] = useState(false)

        useEffect(() => {
            if (allMedia[0]?.like_data?.length > 0) {
                setIsLiked(true)
            } else {
                setIsLiked(false)
            }
        }, [allMedia])
        return (
            <View style={[styles?.main, Commonstyles(Appcolor).shadow, styleView, { backgroundColor: Appcolor.white }]}>
                <View style={{ paddingHorizontal: 12 }}>
                    <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", }]}>
                        <View style={[Commonstyles(Appcolor).row]}>
                            <Pressable onPress={() => {
                                if (user?._id == item?.stylist_id) {
                                    navigation.navigate("ProfileS")
                                    return
                                }
                                // navigation.navigate("OtherStylist", { stylist: item?.stylist_id });
                            }}>
                                <FastImage source={item?.brand_data[0]?.profile_pic == '' ? require('../assets/user.png') : { uri: fileUrl + item?.brand_data[0]?.profile_pic }} style={{ height: 40, width: 40, borderRadius: 60 }} />
                            </Pressable>
                            <View style={{ marginLeft: 8 }}>
                                <Text style={[Commonstyles(Appcolor).bold20, styles?.userName]}>{item?.brand_data[0]?.full_name}</Text>
                                <Text style={[Commonstyles(Appcolor).mediumText10]}>{moment(item?.updated_at).fromNow()}</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={[Commonstyles(Appcolor).semiBold26, styles?.name]}>{item?.name}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, styles?.desc]}>{item?.description}</Text>
                </View>
                {allMedia.length > 0 ?
                    <Pressable onPress={onPressPost}>
                        <_renderMedia item={allMedia?.[0]} onPressPost={onPressPost} />
                    </Pressable>
                    :
                    <Pressable
                        style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 6, width: widthPercentageToDP(93), marginRight: 10, alignSelf: 'center', height: heightPercentageToDP(50), marginTop: 6 }}
                        onPress={onPressPost}
                    >
                        <FastImage source={Appimg.logo} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
                    </Pressable>
                }
                {isMine ?
                    <Pressable onPress={onPressLikeCount} style={[Commonstyles(Appcolor)?.row, { marginTop: 8, paddingHorizontal: 12 }]}>
                        <FastImage source={Appimg.like} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                        <Text style={[Commonstyles(Appcolor).mediumText10, { fontSize: 10, marginLeft: 6 }]}>{item?.like_data?.length > 0 ? item?.like_data[0]?.total_likes : 0} Likes</Text>
                    </Pressable>
                    :
                    <Pressable
                        onPress={() => {
                            if (item?.media_data?.length == 0) {
                                showToast("No cover image in the collection")
                                return
                            }
                            setIsLiked(!isLiked);
                            onPressLike(activeInd)
                        }}
                        style={[Commonstyles(Appcolor)?.row, { marginTop: 8, paddingHorizontal: 12 }]}
                    >
                        <FastImage source={isLiked ? Appimg.like : Appimg.likeempty} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                    </Pressable>
                }
            </View>
        )
    }


    // MARK:- Client
    else {
        const [isLiked, setIsLiked] = useState(false)

        useEffect(() => {
            if (allMedia[0]?.like_data?.length > 0) {
                setIsLiked(true)
            } else {
                setIsLiked(false)
            }
        }, [allMedia])
        return (
            <View style={[styles?.main, Commonstyles(Appcolor).shadow, styleView, { backgroundColor: Appcolor.white }]}>
                {/* topView */}
                <View style={{ paddingHorizontal: 12 }}>
                    <Pressable
                        onPress={() => {
                            if (item?.stylist_id) {
                                navigation.navigate("StylishProfile", { id: item?.stylist_id })
                            } else {
                                navigation.navigate("BrandProfile", { id: item?.brand_id })
                            }
                        }}
                        style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", }]}>
                        <View style={[Commonstyles(Appcolor).row]}>
                            <FastImage source={uploadedBy?.profile_pic == '' ? require('../assets/user.png') : { uri: fileUrl + uploadedBy?.profile_pic }} style={{ height: 40, width: 40, borderRadius: 60 }} />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={[Commonstyles(Appcolor).bold20, styles?.userName]}>{uploadedBy?.full_name} {item?.brand_id && `(${uploadedBy?.parent_brand_detail?.brand_name})`}</Text>
                                <Text style={[Commonstyles(Appcolor).mediumText10]}>{moment(item?.updated_at).fromNow()}</Text>
                            </View>
                        </View>
                    </Pressable>
                    <Text style={[Commonstyles(Appcolor).semiBold26, styles?.name]}>{item?.name}</Text>
                    <Text style={[Commonstyles(Appcolor).regular12, styles?.desc]}>{item?.description}</Text>
                </View>
                {allMedia.length > 0 ?
                    // <FlatList
                    //     data={allMedia} horizontal
                    //     scrollEnabled={false}
                    //     pagingEnabled={true}
                    //     onViewableItemsChanged={_onViewableItemsChanged}
                    //     viewabilityConfig={_viewabilityConfig}
                    //     renderItem={({ item, index }) => {
                    //         return (
                    //             <_renderMedia item={item} index={index} onPressPost={onPressPost} />
                    //         )
                    //     }}
                    //     onScroll={handleScroll}
                    //     showsHorizontalScrollIndicator={false}
                    //     initialNumToRender={allMedia?.length}
                    //     getItemLayout={(data, index) => ({
                    //         length: 100,
                    //         offset: 100 * index,
                    //         index,
                    //     })}
                    // /> 
                    <Pressable onPress={onPressPost}>
                        <_renderMedia item={allMedia?.[0]} onPressPost={onPressPost} />
                    </Pressable>
                    :
                    <Pressable
                        style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 6, width: widthPercentageToDP(93), marginRight: 10, alignSelf: 'center', height: heightPercentageToDP(50), marginTop: 6 }}
                        onPress={onPressPost}
                    >
                        <FastImage source={Appimg.logo} style={{ width: "100%", height: "100%", borderRadius: 10 }} resizeMode="cover" />
                    </Pressable>
                }
                <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", marginTop: 8, paddingHorizontal: 12 }]}>
                    <Pressable onPress={() => onMessagePress(activeInd)} style={[Commonstyles(Appcolor).row]}>
                        <FastImage source={Appimg.messagef} style={{ height: 20, width: 20 }} />
                        <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, marginLeft: 6 }]}>{en?.message}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            if (item?.media_data?.length == 0) {
                                showToast("No cover image in the collection")
                                return
                            }
                            setIsLiked(!isLiked);
                            onPressLike(activeInd)
                        }}
                    >
                        <FastImage source={isLiked ? Appimg.like : Appimg.likeempty} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
                    </Pressable>
                </View>
            </View >
        )
    }
}

export default FeedBlock

const styles = StyleSheet.create({
    main: { paddingVertical: 12, marginVertical: 10 },
    userName: { fontSize: 14 },
    name: { fontSize: 12, marginTop: 6 },
    desc: { fontSize: 10 },
})

const _renderMedia = ({ item, index, onPressPost }) => {
    const imageZoomRef = useRef(null)

    if (item.media_type == 'image') {
        return (
            <ImageZoom
                ref={imageZoomRef}
                uri={fileUrl + item?.media_name ?? ""}
                minScale={0.5}
                maxScale={5}
                doubleTapScale={3}
                minPanPointers={5}
                isSingleTapEnabled
                isDoubleTapEnabled
                // onInteractionStart={() => {
                //     console.log('onInteractionStart');
                // }}
                // onInteractionEnd={() => {
                //     console.log('onInteractionEnd')
                // }}
                // onPanStart={() => console.log('onPanStart')}
                // onPanEnd={() => { }}
                // onPinchStart={() => console.log('onPinchStart')}
                // onDoubleTap={(zoomType) => {
                // }}
                // onResetAnimationEnd={(finished) => {
                // }}
                onPinchEnd={() => imageZoomRef.current?.reset()}
                onSingleTap={onPressPost}
                style={{ justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(100), alignSelf: 'center', height: heightPercentageToDP(56), marginTop: 6 }}
                resizeMode="contain"
            />
            // <Pinchable>
            //     <Pressable style={{ justifyContent: 'center', alignItems: 'center', width: widthPercentageToDP(100), alignSelf: 'center', height: heightPercentageToDP(56), marginTop: 6 }}
            //         onPress={onPressPost}
            //     >


            //         <FastImage source={{ uri: item.media_type == 'video' ? Appimg.logo : fileUrl + item?.media_name }} style={{ width: "100%", height: "100%", }} resizeMode="contain" />
            //     </Pressable>
            // </Pinchable>
        )
    }
    else if (item.media_type == 'video') {
        return (
            <View style={{ height: heightPercentageToDP(56), width: widthPercentageToDP(100), justifyContent: "center", alignItems: "center" }}>
                <VideoThumb source={item?.media_name} styleMain={{ height: "100%", width: "100%" }} />
                <Image source={Appimg.play} style={{ height: 46, width: 46, position: "absolute" }} />
            </View>
        )
    }
    else {
        return (
            <>
                <FastImage source={Appimg.logo} style={{ width: "100%", height: heightPercentageToDP(56) }} resizeMode="contain" />
            </>
        )
    }
}