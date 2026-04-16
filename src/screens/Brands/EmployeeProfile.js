import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import Appimg from '../../constants/Appimg'
import { setLoading } from '../../redux/load'
import { getEmployeeProfile, getOtherBrandCollection } from '../../apimanager/brandServices'
import Commonstyles from '../../constants/Commonstyles'
import showToast from '../../CustomToast'
import Header from '../../components/Header'
import PageLoaderComponent from '../../components/PageLoaderComponent'
import VideoThumb from '../../components/VideoThumb'
import Pinchable from 'react-native-pinchable';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appfonts from '../../constants/Appfonts'

const EmployeeProfile = ({ route, navigation }) => {
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()

    const theme = useSelector(state => state.theme)?.theme

    const [uId, setUId] = useState(route?.params?.uId)
    const [userDetails, setUserDetails] = useState(null)
    const [collections, setCollections] = useState([])
    const [collectionLoader, setCollectionLoader] = useState(false)
    const [pageData, setPageData] = useState({ page: 0, totalPage: 0 })
    const [loadingMore, setLoadingMore] = useState(false)
    const limit = 20

    useEffect(() => {
        getUserDetail()
    }, [uId])

    const getUserDetail = async () => {
        try {
            try {
                dispatch(setLoading(true))
                let res = await getEmployeeProfile({ brand_id: uId })
                if (res?.data?.status) {
                    setUserDetails(res?.data?.data)
                    getCollections()
                } else {
                    showToast(res?.data?.message ?? "Something went wrong.")
                }
            } catch (e) {
                console.error(e);
            } finally {
                dispatch(setLoading(false))
            }
        } catch (e) {
            console.error();
        }
    }
    const getCollections = async () => {
        try {
            setCollectionLoader(true)
            let res = await getOtherBrandCollection({ limit, page: 1, id: uId })
            if (res?.data?.status) {
                setCollections(res.data.data)
                let temp = res?.data?.other
                setPageData({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCollectionLoader(false)
        }
    }
    const checkForMore = useCallback(() => {
        let { page, totalPage } = pageData
        if (page < totalPage) {
            getMoreCollections(page + 1)
        }
    }, [pageData])
    async function getMoreCollections(pg) {
        try {
            setLoadingMore(true)
            let res = await getOtherBrandCollection({ limit, page: pg, id: uId })
            if (res?.data?.status) {
                let arr = [...collections].concat(res?.data?.data)
                setCollections(arr)
                let temp = res?.data?.other
                setPageData({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg?.darkbg} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Employee Profile"}
                showBack={true}
                onBackPress={() => {
                    navigation?.goBack()
                }}
            />
            <View style={{ justifyContent: "center", alignItems: 'center', padding: 8 }}>
                <FastImage source={userDetails?.profile_pic ? { uri: fileUrl + userDetails?.profile_pic } : Appimg?.avatar} style={{ height: 100, width: 100, borderRadius: 100 }} />
                <Text style={[{ marginTop: 6 }, Commonstyles(Appcolor).mediumText14]}>{userDetails?.full_name}</Text>
                <Text style={[Commonstyles(Appcolor).mediumText14, { marginTop: 6, color: Appcolor.primary },]}>{userDetails?.email}</Text>
            </View>
            <Text style={[{ marginTop: 6, marginLeft: 16, }, Commonstyles(Appcolor).mediumText14]}>Collections</Text>
            {collectionLoader && <PageLoaderComponent loadingMore={collectionLoader} />}
            <FlatList
                showsVerticalScrollIndicator={false}
                data={collections}
                renderItem={({ item, index }) => (
                    <_renderItem index={index} item={item}
                        onPress={() => {
                            navigation.navigate("ProductScreenB", { _item: item })
                        }}
                    />
                )}
                numColumns={2}
                ListFooterComponent={() => <View style={{ height: 100 }} />}
                ListEmptyComponent={() => (<Text style={[Commonstyles(Appcolor).bold20, { textAlign: "center", margin: 16 }]}>No data found.</Text>)}
                getItemLayout={(data, index) => { return { length: heightPercentageToDP(66), index, offset: heightPercentageToDP(70) * index } }}
                onEndReached={() => { checkForMore() }}
            />
            {loadingMore && <PageLoaderComponent loadingMore={loadingMore} />}
        </ImageBackground>
    )
}

export default EmployeeProfile

const styles = StyleSheet.create({})

const _renderItem = ({ item, index, onPress }) => {
    const { Appcolor } = useTheme()
    const mediaData = item?.media_data?.[0]
    return (
        <Pressable onPress={onPress} style={[{ marginTop: 20, width: widthPercentageToDP(44), marginLeft: widthPercentageToDP(4), justifyContent: "center", alignItems: "center", borderRadius: 10 }]}>
            <View style={{ flexDirection: "row", width: "92%", marginVertical: 6, }}>
                {item?.display_type == "private" ?
                    <Image source={Appimg?.lock} style={{ height: 16, width: 16, resizeMode: "contain", marginLeft: 6 }} />
                    :
                    <Image source={Appimg?.earth} style={{ height: 16, width: 16, resizeMode: "contain", marginLeft: 6 }} />
                }
                <Text style={[{ marginLeft: 8 }, Commonstyles(Appcolor).mediumText14]}>{item?.name}</Text>
            </View>
            {mediaData?.media_type == "video" ?
                <VideoThumb source={mediaData?.media_name} styleMain={{ height: 180, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10, overflow: "hidden" }} resizeMode={"stretch"} />
                :
                <Pinchable>
                    <FastImage source={{ uri: fileUrl + mediaData?.media_name }} style={{ height: 180, alignSelf: 'stretch', width: widthPercentageToDP(44), borderRadius: 10, overflow: "hidden" }} resizeMode='cover' />
                </Pinchable>
            }
            {mediaData?.media_type == "video" && <Image source={Appimg.play} style={{ height: 30, width: 30, position: "absolute", zIndex: 10 }} />}
        </Pressable>
    );
};