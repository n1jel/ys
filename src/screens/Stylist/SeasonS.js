import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Appfonts from '../../constants/Appfonts'
import { useTheme } from '@react-navigation/native'
import { setLoading } from '../../redux/load'
import { getAllFollowData, getStylistStylist } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import en from '../../translation'
import StylistBlock from '../../components/StylistBlock'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import Commonstyles from '../../constants/Commonstyles'
import UsersBlock from '../../components/UsersBlock'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Searchbar from '../../components/Searchbar'
import TabBlock from '../../components/TabBlock'

const SeasonS = ({ navigation }) => {
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme?.theme)

    const list = [{ name: "Followers", value: 'followers' }, { name: "Brands", value: "following" }]
    const [showList, setShowList] = useState("Followers")
    const [allFollowers, setAllFollowers] = useState([])
    const [search, setSearch] = useState("")
    const [filteredStylist, setFilteredStylist] = useState([])
    const [needCancel, setNeedCancel] = useState(false)
    const limit = 30
    const [paginationData, setPaginationData] = useState({ page: 0, totalPage: 0 })

    useEffect(() => {
        getMyFollowers()
    }, [showList])
    useEffect(() => {
        if (search.trim() == "") {
            resetSearch()
            setNeedCancel(false)
        }
        if (search?.length > 0) {
            setNeedCancel(true)
        }
    }, [search])

    const getShowType = () => {
        return showList == "Followers" ? "follower" : "following"
    }
    const getMyFollowers = async () => {
        try {
            dispatch(setLoading(true))
            let type = getShowType()
            let res = await getAllFollowData(type, 1, limit)
            if (res?.data?.status) {
                setAllFollowers(res?.data?.data)
                let pageData = res?.data?.other
                setPaginationData({ page: pageData?.current_page, totalPage: pageData?.total_page })
            } else {
                showToast(res?.data?.message ?? en?.sthwentWrong)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkformoreData = () => {
        let { page, totalPage } = paginationData
        if (page < totalPage) {
            getMoreFollowers(page + 1)
        }
    }
    const getMoreFollowers = async (page) => {
        try {
            let type = getShowType()
            let res = await getAllFollowData(type, page, limit)
            if (res?.data?.status) {
                let temp = [...res?.data?.data]
                temp = temp.concat(res?.data?.data)
                setAllFollowers(temp)
                let pageData = res?.data?.other
                setPaginationData({ page: pageData?.current_page, totalPage: pageData?.total_page })
            }
        } catch (e) {
        } finally {
        }
    }
    const getSearchedStylist = async (key) => {
        if (key == "") {
            return
        }
        let body = {
            text: key.toLowerCase(),
            page: 1,
            limit: 1000,
            type: "both"
        }
        try {
            dispatch(setLoading(true))
            let res = await getStylistStylist(body)
            if (res?.data?.status) {
                setFilteredStylist(res?.data?.data)
            } else {
                showToast(res?.data?.message ?? en?.sthwentWrong)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetSearch = () => {
        if (search.trim() != "") {
            setSearch("")
        }
        setNeedCancel(false)
        setFilteredStylist([])
    }
    const debounce = (func, delay) => {
        let timerId;
        return (...args) => {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };
    const debouncedSearch = useCallback(debounce((key) => {
        getSearchedStylist(key)
    }, 800), [allFollowers]);

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg?.darkbg} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Your Season"} />
            <View style={{ height: 5 }} />
            <Searchbar value={search} onChangeText={(t) => { setSearch(t); debouncedSearch(t) }}
                place={"Search Brands/Client..."}
                showCancel={needCancel}
                textInputProps={{
                    onSubmitEditing: () => {
                        getSearchedStylist(search)
                    }
                }}
                onPressBtn={() => {
                    resetSearch()
                }}
            />
            {(filteredStylist?.length == 0 && search?.trim() == "") && <TabBlock list={list} value={showList} onChange={(t) => setShowList(t)} width={widthPercentageToDP(92)} />}
            {(filteredStylist?.length == 0 && search?.trim() == "") ?
                <FlatList
                    data={allFollowers}
                    numColumns={3}
                    style={{ marginTop: 20 }}
                    ListHeaderComponent={() => {
                        return (
                            <Text style={{ fontSize: 18, fontFamily: Appfonts.bold, color: Appcolor.txt, marginHorizontal: 16, marginVertical: 10 }}>All {showList}</Text>
                        )
                    }}
                    renderItem={({ item, index }) => {
                        return <UsersBlock item={item} index={index}
                            styleMain={{ marginHorizontal: widthPercentageToDP(4.7) }}
                            onPressStylist={() => {
                                navigation.navigate("OtherStylist", { stylist: item?.stylisy_detail[0]?._id })
                            }}
                            onPressClient={() => {
                                navigation.navigate("ClientProfile", { item: item?.client_detail[0] })
                            }}
                            onPressBrand={() => {
                                navigation.navigate('BrandProfileStylist', { brand: item?.brand_detail?.[0]?._id })
                            }}
                        />
                    }}
                    onEndReached={() => { checkformoreData() }}
                />
                :
                <FlatList
                    numColumns={3}
                    data={filteredStylist}
                    contentContainerStyle={{ marginTop: 16 }}
                    renderItem={({ item, index }) => {
                        return (
                            <_userBlock item={item} index={index}
                                onPress={() => {
                                    if (item?.user_type == "client") {
                                        navigation.navigate("ClientProfile", { item: item })
                                        return
                                    }
                                    if (item?.user_type == "brand") {
                                        navigation.navigate('BrandProfileStylist', { brand: item?._id })
                                        return
                                    }
                                    navigation?.navigate("OtherStylist", { stylist: item?._id })
                                }}
                            />
                        )
                    }}
                />
            }
        </ImageBackground>
    )
}

export default SeasonS

const styles = StyleSheet.create({})

const _userBlock = ({ item, index, onPress }) => {
    const { Appcolor } = useTheme()
    // let isFreelancer = item?.stylist_type == "freelancer"
    return (
        <Pressable style={{ alignItems: 'center', marginHorizontal: widthPercentageToDP(4.7), width: widthPercentageToDP(24), marginBottom: 16 }}
            onPress={onPress}
        >
            <FastImage source={item?.profile_pic ? { uri: fileUrl + item?.profile_pic } : Appimg.avatar} style={{ height: widthPercentageToDP(24), width: widthPercentageToDP(24), borderRadius: 100 }} />
            <Text style={[Commonstyles(Appcolor).mediumText14, { marginTop: 8 }]}>{item?.full_name}{" "}</Text>
            {/* {item?.user_type != "client" && <View style={{ alignItems: 'center' }}>
                {!isFreelancer && <Text style={[Commonstyles(Appcolor).mediumText10, { marginTop: 0 }]}>({item?.company_name})</Text>}
                <Text style={[Commonstyles(Appcolor).mediumText10]}>{item?.city}</Text>
            </View>} */}
        </Pressable>
    )
}