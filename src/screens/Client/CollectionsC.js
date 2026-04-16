import { FlatList, Image, Pressable, StyleSheet, Text, View, ImageBackground, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import Commonstyles from '../../constants/Commonstyles'
import Header from '../../components/Header'
import { useNavigation, useTheme } from '@react-navigation/native'
import MasonryList from '@react-native-seoul/masonry-list';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { fileUrl } from '../../apimanager/httpmanager'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import firestore from '@react-native-firebase/firestore';
import { setLoading } from '../../redux/load'
import { GetBrandCollectionDetail, GetStylistCollectionDetail, LikeUnlike, LikeUnlikeBrand, SendNotification } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import FastImage from 'react-native-fast-image'
import en from '../../translation'
import MediaDisplay from '../../components/MediaDisplay'
import Pinchable from 'react-native-pinchable';
import LinkBlock from '../../components/LinkBlock'
import VideoThumb from '../../components/VideoThumb'

const CollectionsC = ({ route }) => {
  let dispatch = useDispatch()

  let theme = useSelector(state => state.theme?.theme)
  let user = useSelector((state) => state?.auth?.user);

  const navigation = useNavigation()
  const [_item, set_item] = useState(null)
  const [orders, setOrders] = useState([])
  const [collectionitem, setcollectionitem] = useState({})
  const [showPost, setShowPost] = useState(false)
  const [selecteditem, setselecteditem] = useState({})
  const [initialRenderIndex, setInitialRenderIndex] = useState(0)
  const limit = 20
  const [page, setPage] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [gettingMore, setGettingMore] = useState(false)

  const renderItem = ({ item, i }) => {
    return (
      <FurnitureCard
        onPress={() => {
          setInitialRenderIndex(i)
          setTimeout(() => {
            setselecteditem(item)
            setShowPost(true)
          }, 400);
        }}
        // showPost={showPost}
        onPressOut={() => { setShowPost(false) }}
        selecteditem={selecteditem}
        onPressLike={() => { on_press_like(selecteditem) }}
        onPressMessage={() => { on_press_message(selecteditem) }}
        _item={collectionitem} item={item}
        // style={{ marginLeft: i % 2 === 0 ? 0 : 6 }}
        style={{ marginLeft: widthPercentageToDP(1) }}
      />
    );

  };

  useEffect(() => {
    set_item(route?.params?._item)
  }, [route?.params?._item])
  useEffect(() => {
    if (_item) {
      get_data()
    }
  }, [_item])

  async function get_data() {
    let data = { collection_id: _item?._id, page: 1, limit: limit }
    if (_item?.stylist_id) {
      data = { ...data, stylist_id: _item?.stylist_id }
    } else {
      data = { ...data, brand_id: _item?.brand_id }
    }
    try {
      dispatch(setLoading(true))
      if (_item?.brand_id) {
        res = await GetBrandCollectionDetail(data)
      } else {
        res = await GetStylistCollectionDetail(data)
      }
      if (res?.data?.status) {
        setcollectionitem(res.data.data[0])
        setOrders([...res.data.data[0].media_data])
        setPage(res?.data?.other?.current_page)
        setTotalPage(res?.data?.other?.total_page)
      } else {
        showToast(res?.data?.message)
        navigation?.goBack()
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false))
    }
  }
  async function get_more_data(page) {
    // let data = { stylist_id: _item?.stylist_id, collection_id: _item?._id, page: page, limit: limit }
    let data = { collection_id: _item?._id, page: page, limit: limit, }
    if (_item?.stylist_id) {
      data = { ...data, stylist_id: _item?.stylist_id }
    } else {
      data = { ...data, brand_id: _item?.brand_id }
    }
    try {
      let res
      setGettingMore(true)
      if (_item?.brand_id) {
        res = await GetBrandCollectionDetail(data)
      } else {
        res = await GetStylistCollectionDetail(data)
      }
      if (res?.data?.status) {
        let temp = [...orders]
        temp = temp.concat(res.data.data[0].media_data)
        setOrders(temp)
        setPage(res?.data?.other?.current_page)
      } else {
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGettingMore(false)
    }
  }
  async function on_press_message(mediaitem, from = "message") {
    let item = collectionitem

    const isBrand = item?.brand_id ? true : false
    const uploadedBy = isBrand ? item?.brand_data?.[0] : item?.stylist_data?.[0]
    const uId = isBrand ? item?.brand_id : item?.stylist_id

    let room = [uId, user?._id].sort().join("_")
    let type = mediaitem?.gallery_data?.media_type
    const message = {
      _id: moment().unix(),
      text: type == "video" ? "Video" : 'Picture',
      type: type || "image",
      image: fileUrl + mediaitem?.gallery_data?.media_name,
      imageData: mediaitem,
      collectionitem: item,
      isConfirmed: 0,
      isLiked: from == "liked" ? 1 : 0,
      createdAt: moment().unix(),
      user: {
        _id: user?._id,
        full_name: user?.full_name,
        profile_pic: user?.profile_pic
      }
    }
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
    }, { merge: true }).then(async (res) => {
      (from == "message" && navigation.navigate('ClientChat', { item: uploadedBy }), SendNotification({ collection_id: collectionitem?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'stylist', user_id: uId, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'client', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } }))
    })
  }
  // async function on_press_message(mediaitem, from = "message") {
  //   let item = collectionitem

  //   const isBrand = item?.brand_id ? true : false
  //   const uploadedBy = isBrand ? item?.brand_data?.[0] : item?.stylist_data?.[0]
  //       const uId = isBrand ? item?.brand_id : item?.stylist_id

  //   // let room = [item?.stylist_id, user?._id].sort().join("_")
  //   let room = [uId, user?._id].sort().join("_")
  //   let type = mediaitem?.gallery_data?.media_type
  //   const message = {
  //     _id: moment().unix(),
  //     text: type == "video" ? "Video" : 'Picture',
  //     type: type || "image",
  //     image: fileUrl + mediaitem?.gallery_data?.media_name,
  //     imageData: mediaitem,
  //     collectionitem: item,
  //     isConfirmed: 0,
  //     isLiked: from == "liked" ? 1 : 0,
  //     createdAt: moment().unix(),
  //     user: {
  //       _id: user?._id,
  //       full_name: user?.full_name,
  //       profile_pic: user?.profile_pic
  //     }
  //   }
  //   firestore().collection('chats').doc(room).collection("messages").add(message)
  //   firestore().collection('chats').doc(room).set({
  //     users: [user, item.stylist_data[0]],
  //     unreadCount: {
  //       [`${user?._id}`]: 0,
  //       [`${item?.stylist_id}`]: firestore.FieldValue.increment(1),
  //     },
  //     userIds: [user?._id, item?.stylist_id],
  //     lastMessage: message,
  //     type: "single",
  //   }, { merge: true }).then(async (res) => {
  //     (from == "message" && navigation.navigate('ClientChat', { item: item?.stylist_data[0] }), SendNotification({ collection_id: collectionitem?._id, sender_user_id: user?._id, is_new_order: 1, user_type: 'stylist', user_id: item?.stylist_id, payload: { title: 'New Message', body: user?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'client', type: 'chat', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } }))
  //   })
  // }
  async function on_press_like(mediaitem, type) {
    let isBrand = collectionitem?.brand_id ? true : false
    let body = {
      collection_id: collectionitem?._id,
      media_id: mediaitem?._id,
      ...(!isBrand ? { stylist_id: collectionitem?.stylist_id } : { brand_id: collectionitem?.brand_id })
    }
    console.log(body);
    try {
      dispatch(setLoading(true))
      let res
      if (isBrand)
        res = await LikeUnlikeBrand(body)
      else
        res = await LikeUnlike(body)
      if (res?.data?.status) {
        showToast(res?.data?.message)
        let newItem = { ...mediaitem, like_data: res?.data?.data ? [res?.data?.data] : [] }
        updateData(newItem)
        if (mediaitem?.like_data?.length) {
          return
        }
        if (type == "like") {
          on_press_message(mediaitem, "liked")
        }
      } else {
        showToast(res?.data?.message ?? "Something went wrong.")
      }
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(setLoading(false))
    }
  }
  const onEndReached = () => {
    if (page < totalPage) {
      get_more_data(page + 1)
    }
  }
  const updateData = useCallback((item) => {
    let temp = [...orders]
    let ind = temp.findIndex(x => x?._id == item?._id)
    temp.splice(ind, 1, item)
    setOrders(temp)
  }, [orders])

  return (
    <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1 }}>
      <Header name={route?.params?._item?.stylist_data?.[0]?.full_name} title={_item?.name} showBack={true}
        onBackPress={() => {
          if (showPost) {
            setShowPost(!showPost)
            return
          }
          navigation.goBack()
        }}
      />
      <View style={{ marginTop: 0 }} />
      {!showPost ?
        <MasonryList
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          numColumns={2}
          data={orders}
          renderItem={renderItem}
          onEndReached={() => onEndReached()}
        />
        :
        <FlatList
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          data={orders}
          initialScrollIndex={initialRenderIndex}
          getItemLayout={(data, index) => { return { length: heightPercentageToDP(65), index, offset: heightPercentageToDP(65) * index } }}
          onEndReached={() => onEndReached()}
          renderItem={({ item, index }) => {
            return (
              <VerticalList item={item} index={index}
                onPressLike={() => { on_press_like(item, "like") }}
                onPressMessage={() => {
                  on_press_message(item);
                  if (item?.like_data?.length == 0) {
                    on_press_like(item, "message")
                  }
                }}
                onPressVideo={() => { navigation?.navigate("VideoPlayer", { media: item?.media_name }) }}
              />
            )
          }}
        />
      }
      {gettingMore && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
    </ImageBackground>
  )
}

export default CollectionsC

const FurnitureCard = ({ item, style, _item, onPressMessage, onPressLike, showPost, onPressOut, onPress, selecteditem }) => {
  const randomBool = useMemo(() => Math.random() < 0.5, []);
  const { Appcolor } = useTheme()
  return (
    <Pressable onPress={onPress} style={[{ marginTop: 10 }, style]}>
      <MediaDisplay media={item?.gallery_data} />
    </Pressable>
  );
};

const VerticalList = ({ item, index, onPressLike, onPressMessage, onPressVideo }) => {
  const { Appcolor } = useTheme()
  const navigation = useNavigation();

  const { media_type, media_name, thumbnail } = item?.gallery_data

  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (item?.like_data?.length > 0) {
      setIsLiked(true)
    } else {
      setIsLiked(false)
    }
  }, [item?.like_data])

  return (
    <View style={{ backgroundColor: Appcolor.white, marginBottom: 12 }}>
      <>
        {(media_type == 'video' && !thumbnail) ?
          <View style={{ justifyContent: "center", alignItems: "center", borderRadius: 10, overflow: "hidden", }}>
            {/* <Image source={Appimg.logo} style={[{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0 }]} resizeMode={"stretch"} /> */}
            <VideoThumb source={media_name} styleMain={{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0 }} resizeMode={"cover"} />
            <Pressable onPress={() => navigation?.navigate("VideoPlayer", { media: media_name })} style={{ position: "absolute" }}>
              <Image source={Appimg.play} style={{ height: 50, width: 50, tintColor: Appcolor.txt }} />
            </Pressable>
          </View>
          :
          media_type == 'video' ?
            <View style={{ justifyContent: "center", alignItems: "center", borderRadius: 10, overflow: "hidden", }}>
              <FastImage source={{ uri: fileUrl + thumbnail }} style={[{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0 }]} resizeMode={"cover"} />
              <Pressable onPress={() => navigation?.navigate("VideoPlayer", { media: media_name })} style={{ position: "absolute", zIndex: 10 }}>
                <Image source={Appimg.play} style={{ height: 50, width: 50, tintColor: Appcolor.txt }} />
              </Pressable>
            </View>
            :
            <Pinchable>
              <FastImage source={{ uri: fileUrl + (media_type == "image" ? media_name : thumbnail) }} style={[{ height: heightPercentageToDP(60), width: widthPercentageToDP(100), borderRadius: 0 }]} resizeMode={"contain"} />
            </Pinchable>
        }
      </>
      {item?.caption && <Text style={[Commonstyles(Appcolor).mediumText14, { marginTop: 8, marginLeft: 16 }]}>{item?.caption}</Text>}
      <LinkBlock styleMain={{ alignSelf: "flex-end" }} link={item?.link} />
      <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between", margin: 12 }]}>
        <Pressable style={[Commonstyles(Appcolor).row]}
          onPress={() => {
            onPressMessage();
            !isLiked && setIsLiked(true)
          }}
        >
          <FastImage source={Appimg.messagef} style={{ height: 20, width: 20 }} />
          <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, marginLeft: 6 }]}>{en?.message}</Text>
        </Pressable>
        <Pressable onPress={() => { setIsLiked(!isLiked); onPressLike() }}>
          <Image source={isLiked ? Appimg.like : Appimg.likeempty} style={{ height: 20, width: 22 }} resizeMode={"contain"} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
})