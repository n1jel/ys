import { FlatList, StyleSheet, Text, View, ImageBackground, ScrollView, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import { useIsFocused, useNavigation, useTheme } from '@react-navigation/native'
import Searchbar from '../../components/Searchbar'
import Btn from '../../components/Btn'
import FollowComp from '../../components/FollowComp'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { getBrandStylist, getClientStylist, getStylistStylist, SendFollowRequest, SendFollowRequestStylist, SendFollowRequestStylistToBrand } from '../../apimanager/httpServices'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import showToast from '../../CustomToast'
const SearchS = () => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const navigation = useNavigation()
    const theme = useSelector(state => state.theme)?.theme
    const load = useSelector(state => state.load)?.isLoading
    const [search, setSearch] = useState('')
    const [showType, setShowType] = useState(false)
    const [allStylist, setAllStylist] = useState([])

    async function get_stylist(page, limit, text) {
        if (text.length == 0) {
            showToast('Enter stylist name')
            setAllStylist([])
            return false
        }
        let body = { page, limit, text: text.toLowerCase() }
        try {
            dispatch(setLoading(true))
            // let res = await getStylistStylist(body)
            let res = await getBrandStylist(body)
            if (res?.data?.status) {
                setAllStylist(res?.data?.data)
            } else {
                setAllStylist([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function send_request(item) {
        try {
            let _data = {
                'follow_stylist_id': item?._id
            }
            dispatch(setLoading(true))
            let res = await SendFollowRequestStylist(_data)
            if (res?.data?.status) {
                get_stylist(1, 100, search)
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function sendReqBrand(item) {
        try {
            let _data = { 'brand_id': item?._id }
            dispatch(setLoading(true))
            let res = await SendFollowRequestStylistToBrand(_data)
            if (res?.data?.status) {
                get_stylist(1, 100, search)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1 }}>
            <Header title={"Search"} onBackPress={() => {
                navigation.goBack()
            }} showBack={true} />
            <View style={{ marginTop: 20 }} />
            <Searchbar value={search} autoFocus={true}
                place="Search Brands"
                onChangeText={t => {
                    setSearch(t)
                }}
                textInputProps={{
                    onSubmitEditing: () => {
                        setShowType(true)
                        get_stylist(1, 100, search)
                        Keyboard.dismiss()
                    }
                }}
                showCancel={search?.length > 0 ? true : false}
                onPressBtn={() => setSearch("")}
            />
            <View style={{ flex: 0.8 }} >
                {showType &&
                    <FlatList
                        data={allStylist}
                        ListEmptyComponent={() => {
                            return (load ? null : <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No brand found</Text>)
                        }}
                        renderItem={({ item }) => {
                            // console.log(item);
                            return (
                                <FollowComp
                                    item={item}
                                    onPressFolow={() => {
                                        if (item?.user_type == "brand") {
                                            sendReqBrand(item)
                                        } else {
                                            send_request(item)
                                        }
                                    }}
                                    onPress={() => {
                                        navigation.navigate('BrandProfileStylist', { brand: item?._id })

                                        // navigation.navigate('StylistChat', { item })
                                        // return
                                        // navigation?.navigate("OtherStylist", { stylist: item?._id })
                                    }}
                                />
                            )
                        }}
                    />
                }
            </View>
            <Btn
                title="Search"
                onPress={() => {
                    setShowType(true)
                    get_stylist(1, 100, search)
                    Keyboard.dismiss()
                }}
                transparent={Appcolor.blackop}
                styleMain={{ alignSelf: "center" }}
                twhite={true}
            />
        </ImageBackground>
    )
}

export default SearchS

const styles = StyleSheet.create({})