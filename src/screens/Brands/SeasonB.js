import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Appfonts from '../../constants/Appfonts'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { setLoading } from '../../redux/load'
import showToast from '../../CustomToast'
import en from '../../translation'
import FastImage from 'react-native-fast-image'
import { fileUrl } from '../../apimanager/httpmanager'
import Commonstyles from '../../constants/Commonstyles'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Searchbar from '../../components/Searchbar'
import { followersList, getBrandStylist, searchFollowers } from '../../apimanager/brandServices'
import TabBlock from '../../components/TabBlock'

const SeasonB = ({ navigation }) => {
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme)?.theme
    const user = useSelector((state) => state?.auth?.user);
    const [allFollowers, setAllFollowers] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const [search, setSearch] = useState("")
    const [filteredStylist, setFilteredStylist] = useState([])
    const [needCancel, setNeedCancel] = useState(false)
    const limit = 30
    const [paginationData, setPaginationData] = useState({ page: 0, totalPage: 0 })
    const list = [{ name: "Stylist" }, { name: "Employees" }]
    const [showList, setShowList] = useState("Stylist")

    useFocusEffect(useCallback(() => {
        if (showList == "Stylist") {
            getMyFollowers()
        } else {
            getEmployees()
        }
    }, [showList]))
    useEffect(() => {
        if (search.trim() == "") {
            resetSearch()
            setNeedCancel(false)
        }
        if (search?.length > 0) {
            setNeedCancel(true)
        }
    }, [search])

    const getMyFollowers = async () => {
        try {
            dispatch(setLoading(true))
            let res = await followersList()
            if (res?.data?.status) {
                setAllFollowers(res?.data?.data?.total_followers)
            } else {
                showToast(res?.data?.message ?? en?.sthwentWrong)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const getEmployees = async (key = "") => {
        try {
            let query = `?page=1&limit=${limit}`
            if (key?.trim() != "") {
                query = query + `&keyword=${key}`
            }
            let res = await getBrandStylist(query)
            if (res?.data?.status) {
                setEmployeeList(res?.data?.data)
                let pageData = res?.data?.other
                setPaginationData({ page: pageData?.current_page, totalPage: pageData?.total_page })
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
                setEmployeeList([])
            }
        } catch (e) {
            console.error(e);
        }
    }
    const checkformoreData = () => {
        let { page, totalPage } = paginationData
        if (page < totalPage) {
            getMoreEmployees(page + 1)
        }
    }
    const getMoreFollowers = async (page) => {
        try {
            let res = await followersList()
            if (res?.data?.status) {
                let temp = [...allFollowers]
                temp = temp.concat(res?.data?.data?.total_followers)
                setAllFollowers(temp)
                // let pageData = res?.data?.other
                // setPaginationData({ page: pageData?.current_page, totalPage: pageData?.total_page })
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const getMoreEmployees = async (page) => {
        try {
            let query = "?page=${page}&limit=${limit}"
            if (search?.trim() != "") {
                query = `&keyword=${search}`
            }
            let res = await getBrandStylist(query)
            if (res?.data?.status) {
                setEmployeeList(res?.data?.data)
                let pageData = res?.data?.other
                setPaginationData({ page: pageData?.current_page, totalPage: pageData?.total_page })
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
                setEmployeeList([])
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const getSearchedStylist = async (key) => {
        if (key == "") {
            return
        }
        let body = { keyword: key.toLowerCase(), type: "both" }
        try {
            dispatch(setLoading(true))
            let res = await searchFollowers(body)
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
        if (showList != "Stylist") {
            getEmployees()
        }
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
        if (showList == "Stylist") {
            getSearchedStylist(key)
        } else {
            getEmployees(key)
        }
    }, 800), [allFollowers, showList]);
    const showProfile = async (item) => {
        try {
            if (item?.full_name) {
                navigation.navigate("ProfileClientStylist", { uId: item?._id, userType: item?.user_type })
            } else {
                let u = item?.client_detail?.length > 0 ? item?.client_detail?.[0] : item?.stylisy_detail?.[0]
                console.log(u);
                navigation.navigate("ProfileClientStylist", { uId: u?._id, userType: u?.user_type })
            }
        } catch (e) {
            console.error(e);
        }
    }
    const showEmployeeProfile = async (item) => {
        navigation?.navigate("EmployeeProfile", { uId: item?._id })
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg?.darkbg} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Your Season"} />
            <View style={{ height: 5 }} />
            <Searchbar
                value={search}
                onChangeText={(t) => { setSearch(t); debouncedSearch(t) }}
                place={`Search ${user?.is_added_by_brand == 1 ? "Client" : "Stylist"}`}
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
            {user?.is_added_by_brand == 0 && <TabBlock list={list} value={showList} onChange={(t) => setShowList(t)} width={widthPercentageToDP(92)} />}
            <Text style={{ fontSize: 18, fontFamily: Appfonts.bold, color: Appcolor.txt, marginHorizontal: 16, marginVertical: 16 }}>All Followers {user?.is_added_by_brand == 1 && "(Client)"}</Text>
            {showList == "Stylist" ?
                <FlatList
                    data={filteredStylist?.length == 0 ? allFollowers : filteredStylist}
                    numColumns={3}
                    style={{ marginTop: 10 }}
                    renderItem={({ item, index }) => {
                        return (
                            <_userBlock item={item} index={index}
                                onPress={() => {
                                    showProfile(item)
                                }}
                            />
                        )
                    }}
                // onEndReached={() => { checkformoreData() }}
                />
                :
                <FlatList
                    data={employeeList}
                    numColumns={3}
                    style={{ marginTop: 10 }}
                    renderItem={({ item, index }) => {
                        return (
                            <_userBlock item={item} index={index}
                                onPress={() => {
                                    showEmployeeProfile(item)
                                }}
                            />
                        )
                    }}
                    onEndReached={() => { checkformoreData() }}
                />
            }
        </ImageBackground>
    )
}

export default SeasonB

const styles = StyleSheet.create({
    picStyle: {
        height: widthPercentageToDP(24), width: widthPercentageToDP(24), borderRadius: 100
    },
    mainBlock: { alignItems: 'center', marginHorizontal: widthPercentageToDP(4.7), width: widthPercentageToDP(24) }
})

const _userBlock = ({ item, index, onPress }) => {
    const { Appcolor } = useTheme()
    const userDetail = item?.full_name ? item : item?.client_detail?.length > 0 ? item?.client_detail?.[0] : item?.stylisy_detail?.[0]
    return (
        <Pressable style={styles.mainBlock}
            onPress={onPress}
        >
            <FastImage source={userDetail?.profile_pic ? { uri: fileUrl + userDetail?.profile_pic } : Appimg.avatar} style={[styles.picStyle]} />
            <Text style={[Commonstyles(Appcolor).mediumText14, { marginTop: 8 }]}>{userDetail?.full_name}{" "}</Text>
        </Pressable>
    )
}