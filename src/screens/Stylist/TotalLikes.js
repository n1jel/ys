import { FlatList, ImageBackground, Pressable, StyleSheet, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import { useDispatch, useSelector } from 'react-redux'
import Header from '../../components/Header'
import { getLikedMediaList } from '../../apimanager/httpServices'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Commonstyles from '../../constants/Commonstyles'
import { useTheme } from '@react-navigation/native'
import { setLoading } from '../../redux/load'
import { getBrandLikedMediaList } from '../../apimanager/brandServices'

const TotalLikes = ({ navigation, route }) => {
    const from = route?.params?.from ?? "stylist"
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()
    const theme = useSelector(state => state.theme)?.theme;
    const [allLikedPost, setAllLikedPost] = useState([])
    const limit = 16
    const [pageOrders, setPageOrders] = useState({ page: 0, totalPage: 0 })

    useEffect(() => {
        getAllData()
    }, [])

    const getAllData = async () => {
        try {
            dispatch(setLoading(true))
            let res
            if (from == 'stylist') {
                res = await getLikedMediaList({ page: 1, limit })
            } else {
                res = await getBrandLikedMediaList({ page: 1, limit })
            }
            if (res?.data?.status) {
                setAllLikedPost(res?.data?.data)
                let temp = res?.data?.other
                setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            } else {
                setAllLikedPost([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreData = () => {
        let { page, totalPage } = pageOrders
        if (page < totalPage) {
            getMoreLikes(page + 1)
        }
    }
    const getMoreLikes = async (page) => {
        try {
            let res
            if (from == 'stylist') {
                res = await getLikedMediaList({ page: page, limit })
            } else {
                res = await getBrandLikedMediaList({ page: page, limit })
            }
            if (res?.data?.status) {
                let data = [...allLikedPost]
                data = data?.concat(res?.data?.data)
                setAllLikedPost(data)
                let temp = res?.data?.other
                setPageOrders({ page: temp?.current_page, totalPage: temp?.total_page })
            }
        } catch (e) {
        } finally {
        }
    }
    return (
        <ImageBackground source={theme == "dark" ? Appimg?.darkbg : Appimg.bg} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header showBack={true}
                onBackPress={() => {
                    navigation.goBack()
                }}
                title={"Likes"}
            />
            <FlatList
                data={allLikedPost}
                numColumns={2}
                onEndReached={() => checkForMoreData()}
                renderItem={({ item, index }) => {
                    return (
                        <Pressable
                            style={{ backgroundColor: Appcolor.white, marginHorizontal: widthPercentageToDP(2.5), borderRadius: 8, marginVertical: 8 }}
                            onPress={() => {
                                // console.log(item);
                                // return
                                navigation?.navigate("LikedList", { id: item?._id })
                            }}
                        >
                            <FastImage source={item?.media_type == "image" ? { uri: fileUrl + item?.media_name } : Appimg.logo} style={{ height: widthPercentageToDP(46), width: widthPercentageToDP(45), borderRadius: 8, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} resizeMode='stretch' />
                            <Text style={[Commonstyles(Appcolor).mediumText14, { marginTop: 8, marginLeft: 8 }]}>{item?.collection_data[0]?.name}</Text>
                            <Text style={[Commonstyles(Appcolor).mediumText12, { margin: 8, marginTop: 0 }]}>Total likes: {item?.like_data?.total}</Text>
                        </Pressable>
                    )
                }}
            />
        </ImageBackground>
    )
}

export default TotalLikes

const styles = StyleSheet.create({})