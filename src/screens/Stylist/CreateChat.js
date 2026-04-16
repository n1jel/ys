import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { getAllFollowData } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import Appcolor from '../../constants/Appcolor'
import Appfonts from '../../constants/Appfonts'
import { setLoading } from '../../redux/load'
import Searchbar from '../../components/Searchbar'

const CreateChat = ({ navigation }) => {
    const dispatch = useDispatch();

    const [allFollowers, setAllFollowers] = useState([])
    const [filteredList, setFilteredList] = useState([])
    const [search, setSearch] = useState("")

    useFocusEffect(useCallback(() => {
        getAllFollowers()
    }, []))
    useEffect(() => {
        if (search?.trim() != "") {
            let temp = allFollowers?.filter(x => x?.client_detail[0]?.full_name?.toLowerCase()?.includes(search?.toLowerCase()))
            setFilteredList(temp)
        } else {
            setFilteredList(allFollowers)
        }
    }, [search])

    const getAllFollowers = async () => {
        try {
            dispatch(setLoading(true))
            let res = await getAllFollowData()
            if (res?.data?.status) {
                let temp = res?.data?.data?.total_followers?.reduce((arr, item) => {
                    if (item?.follow_by == "client") {
                        arr.push(item)
                    }
                    return arr;
                }, [])
                setAllFollowers(temp)
                setFilteredList(temp)
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header
                title={"Messages"}
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />
            <Searchbar place={"Search"} styleMain={{ marginTop: 18 }}
                value={search}
                onChangeText={(t) => setSearch(t)}
            />
            <FlatList
                data={filteredList}
                contentContainerStyle={{ paddingVertical: 18 }}
                renderItem={({ item, index }) => {
                    return <_renderList
                        item={item} index={index}
                        onPress={() => navigation?.navigate("StylistChat", { item: item?.client_detail[0] })}
                    />
                }}
            />
        </ImageBackground>
    )
}

export default CreateChat

const styles = StyleSheet.create({})

const _renderList = ({ item, index, onPress }) => {
    let { profile_pic, full_name, email } = item?.client_detail[0]
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: Appcolor.white, marginHorizontal: 18, paddingVertical: 12 }}>
            <FastImage source={profile_pic ? { uri: fileUrl + profile_pic } : Appimg.avatar} style={{ height: 80, width: 80, borderRadius: 80, marginRight: 16 }} />
            <View>
                <Text style={{ color: Appcolor.white, fontSize: 16, fontFamily: Appfonts.semiBold }}>{full_name}</Text>
                <Text style={{ color: Appcolor.white, fontSize: 14, fontFamily: Appfonts.medium }}>{email}</Text>
            </View>
        </TouchableOpacity>
    )
}