import { FlatList, StyleSheet, Text, View, ImageBackground } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import StylistBlock from '../../components/StylistBlock'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import Header from '../../components/Header'
import Searchbar from '../../components/Searchbar'
import Appfonts from '../../constants/Appfonts'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { getClientFollowedStylist, getClientStylist } from '../../apimanager/httpServices'
import { RFValue } from 'react-native-responsive-fontsize'
import { setLoading } from '../../redux/load'
import showToast from '../../CustomToast'
import en from '../../translation'

const SeasonC = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme?.theme)
    const load = useSelector(state => state.load?.isLoading)
    const [text, setText] = useState('')
    const [allStylist, setAllStylist] = useState([])
    const [filteredStylist, setFilteredStylist] = useState([])
    const [needCancel, setNeedCancel] = useState(false)
    const limit = 50
    const [paginationData, setPaginationData] = useState({ page: 0, totalPage: 0 })

    useFocusEffect(useCallback(() => {
        get_stylist(1)
    }, []))
    useEffect(() => {
        if (text.trim() == "") {
            resetSearch()
            setFilteredStylist([])
        }
        if (text?.length > 0) {
            setNeedCancel(true)
        }
    }, [text])

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
    }, 800), [allStylist]);
    async function get_stylist(page) {
        let body = { page, limit }
        try {
            if (text.length == 0) {
                dispatch(setLoading(true))
            }
            let res = await getClientFollowedStylist(body)
            if (res?.data?.status) {
                setAllStylist(res?.data?.data)
                let pageData = res?.data?.other
                setPaginationData({ page: pageData?.current_page, totalPage: pageData?.total_page })
            } else {
                setAllStylist([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const checkForMoreData = () => {
        let { page, totalPage } = paginationData
        if (page < totalPage) {
            get_more_stylist(page + 1)
        }
    }
    async function get_more_stylist(page) {
        let body = { page, limit }
        try {
            let res = await getClientFollowedStylist(body)
            if (res?.data?.status) {
                let temp = [...allStylist]
                temp = temp?.concat(res?.data?.data)
                setAllStylist(temp)
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
            text: key,
            page: 1,
            limit: 1000
        }
        try {
            dispatch(setLoading(true))
            let res = await getClientStylist(body)
            if (res?.data?.status) {
                setFilteredStylist(res?.data?.data)
            } else {
                showToast(res?.data?.message ?? en?.sthwentWrong)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetSearch = () => {
        if (text.trim() != "") {
            setText("")
        }
        setNeedCancel(false)
        setFilteredStylist([])
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1 }}>
            <Header title={"Your Season"} />
            <View style={{ marginTop: 20 }} />
            <Searchbar value={text} onChangeText={(t) => { setText(t); debouncedSearch(t) }} place={"Search Stylist..."}
                showCancel={needCancel}
                textInputProps={{
                    onSubmitEditing: () => {
                        getSearchedStylist(text)
                    }
                }}
                onPressBtn={() => {
                    resetSearch()
                }}
            />
            <Text style={{ fontSize: 18, fontFamily: Appfonts.bold, color: Appcolor.txt, marginHorizontal: 16, marginTop: 20 }}>All Stylist</Text>
            <FlatList
                data={filteredStylist.length == 0 ? allStylist : filteredStylist}
                numColumns={3}
                style={{ marginTop: 20 }}
                ListEmptyComponent={() => {
                    return (load ? null : <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Stylist found</Text>)
                }}
                contentContainerStyle={{ paddingHorizontal: 18 }}
                renderItem={({ item, index }) => {
                    return (
                        <StylistBlock
                            item={item}
                            index={index}
                            styleMain={{ marginBottom: 8 }}
                            isBrand={item?.user_type == "brand"}
                        />
                    )
                }}
                onEndReached={() => {
                    (filteredStylist.length == 0 ? checkForMoreData() : null)
                }}
            />
        </ImageBackground>
    )
}

export default SeasonC

const styles = StyleSheet.create({
    userType: {
        height: 40, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
    userTypeTxt: {
        // fontFamily: fonts.MontBold, fontSize: 14
    },
})