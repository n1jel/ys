import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import Appimg from '../../constants/Appimg';
import { setLoading } from '../../redux/load';
import { get_like_list } from '../../apimanager/httpServices';
import showToast from '../../CustomToast';
import en from '../../translation';
import FastImage from 'react-native-fast-image';
import { fileUrl } from '../../apimanager/httpmanager';
import Commonstyles from '../../constants/Commonstyles';
import { getBrandLikeList } from '../../apimanager/brandServices';

const LikedList = ({ navigation, route }) => {
    const { id } = route?.params
    const from = route?.params?.from ?? "stylist"

    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme)?.theme;
    const [userList, setUserList] = useState([])

    useEffect(() => {
        if (id) {
            getLikedList(id)
        }
    }, [id])

    const getLikedList = async (media_id) => {
        try {
            dispatch(setLoading(true));
            let res
            if (from == 'stylist') {
                res = await get_like_list({ media_id })
            } else {
                res = await getBrandLikeList({ media_id })
            }
            // let res = await get_like_list({ media_id });
            if (res?.data?.status) {
                setUserList(res?.data?.data);
            } else {
                showToast(res?.data?.message ?? en?.sthwentWrong);
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <ImageBackground source={theme == "dark" ? Appimg?.darkbg : Appimg.bg} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header showBack={true}
                onBackPress={() => {
                    navigation.goBack()
                }}
                title={"Likes"}
            />
            <FlatList
                data={userList}
                renderItem={({ item, index }) => <_userBlock index={index} item={item} from={from} />}
            />
        </ImageBackground>
    )
}

export default LikedList

const styles = StyleSheet.create({})

const _userBlock = ({ item, index, from }) => {
    const { Appcolor } = useTheme()
    let likeduser = item?.client_data?._id ? item?.client_data : item?.brand_data?._id ? item?.brand_data : item?.stylist_data
    return (
        <Pressable style={[Commonstyles(Appcolor).row, { marginHorizontal: 16, marginTop: 8, borderBottomWidth: 1, borderColor: Appcolor.whiteop, paddingBottom: 10 }]}>
            <FastImage source={likeduser?.proifile_pic ? { uri: fileUrl + likeduser?.proifile_pic } : Appimg?.avatar} style={{ height: 60, width: 60, borderRadius: 60, marginRight: 16 }} />
            <View>
                <Text style={[Commonstyles(Appcolor).mediumText14]}>{likeduser?.full_name}</Text>
                <Text style={[Commonstyles(Appcolor).mediumText12]}>{likeduser?.email}</Text>
            </View>
        </Pressable>
    )
}