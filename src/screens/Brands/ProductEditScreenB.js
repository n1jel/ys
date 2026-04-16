import { Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Tinput from '../../components/Tinput'
import en from '../../translation'
import CustomDrop from '../../components/CustomDrop'
import Commonstyles from '../../constants/Commonstyles'
import FastImage from 'react-native-fast-image'
import Btn from '../../components/Btn'
import { useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import showToast from '../../CustomToast'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Searchbar from '../../components/Searchbar'
import { searchFollowers, updateCollectionBrands } from '../../apimanager/brandServices'

const ProductEditScreenB = ({ navigation, route }) => {
    let dispatch = useDispatch()
    const { _item } = route.params ?? {}

    let theme = useSelector(state => state.theme)?.theme
    const data = useSelector(state => state.CommanReducer)?.productdetail
    const user = useSelector(state => state?.auth?.user)

    const [collectionName, setCollectionName] = useState('')
    const [collectionAbout, setCollectionAbout] = useState('')
    const [display, setDisplay] = useState([{ label: "public", value: "public" }, { label: "private", value: "private" },])
    const [displayVal, setDisplayVal] = useState("")
    const [uploads, setUploads] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [tagged, setTagged] = useState([])
    const [searchKey, setSearchKey] = useState("")
    const { Appcolor } = useTheme()

    useEffect(() => {
        if (user?.is_added_by_brand == 0) {
            let temp = [...display]
            temp.push({ label: 'employees', value: 'employees' })
            setDisplay(temp)
        }
    }, [user])
    useEffect(() => {
        if (searchKey != "") {
            searchUser(searchKey)
        }
    }, [searchKey])
    useEffect(() => {
        if (displayVal == "public") {
            setSearchKey("")
            setTagged([])
            setSearchResults([])
        }
    }, [displayVal])
    useEffect(() => {
        if (data?._id) {
            setCollectionName(data?.name)
            setCollectionAbout(data?.description)
            setDisplayVal(data?.display_type)
            if (data?.display_to?.length > 0) {
                setTagged(data?.display_to)
            } else {
                setTagged(data?.display_to_stylist)
            }
            // let array = []
            // data?.media_data.forEach((i) => {
            //     if (i.status == 1) {
            //         array.push({
            //             path: i.media_type == 'video' ? 'logo' : fileUrl + i.media_name,
            //             upload: 'server',
            //             _id: i._id,
            //             is_cover_image: i.is_cover_image,
            //             thumbnail: fileUrl + i.thumbnail,
            //             media_type: i.media_type
            //         })
            //     }

            // })

            // setUploads([...array])
            // setUploads(data?.description)
        }
    }, [data])

    const updateCollection = async () => {
        try {
            dispatch(setLoading(true))
            let body = { collection_id: data?._id, display_type: displayVal, display_to: tagged, name: collectionName, description: collectionAbout }
            let res = await updateCollectionBrands(body)
            console.log(res);
            if (res?.data?.status) {
                showToast("Updated sucessfully")
                navigation.goBack()
            } else {
                showToast(res?.data?.message || "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const searchUser = async (key) => {
        try {
            let res = await searchFollowers({ keyword: key, type: "both" })
            if (res?.data?.status) {
                setSearchResults(res?.data?.data)
            } else {
                showToast(res?.data?.message ?? "Network Error")
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }

    return (
        <ImageBackground source={Appimg?.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Edit " + data?.name} showBack={true} onBackPress={() => navigation.goBack()} />
            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <Tinput value={collectionName} onChangeText={(t) => setCollectionName(t)} place={en?.collectionname} styleMain={{ marginTop: 26 }} />
                    <Tinput value={collectionAbout} onChangeText={(t) => setCollectionAbout(t)} place={en?.aboutcollection} styleMain={{ marginTop: 16 }}
                        multiline={true}
                        tav={Platform?.OS === "android" && "top"}
                        styleInput={{ height: 100 }}
                    />
                    <CustomDrop
                        data={display}
                        label={en?.display}
                        place={"Show to..."}
                        styleMain={{ marginTop: 16 }}
                        val={displayVal}
                        setVal={t => setDisplayVal(t)}
                    />
                    {displayVal == "private" && <Searchbar
                        styleMain={{ marginTop: 16 }}
                        value={searchKey}
                        onChangeText={t => {
                            setSearchKey(t)
                        }}
                        textInputProps={{
                            onSubmitEditing: () => {
                                searchUser(searchKey)
                            },
                            onEndEditing: (t) => {
                            }
                        }}
                    />}
                    {searchResults?.length > 0 && <View style={[{ marginHorizontal: 18, backgroundColor: Appcolor.primary, marginTop: 8 }, Commonstyles(Appcolor).shadow]}>
                        {searchResults?.map((i, j) => {
                            return (
                                <Pressable style={{ padding: 8 }} key={i?._id}
                                    onPress={() => {
                                        let temp = [...tagged]
                                        let arr = temp.filter(x => x?._id == i?._id)
                                        if (arr.length == 0) {
                                            temp.push(i)
                                            setTagged(temp)
                                        }
                                        setSearchResults([])
                                        setSearchKey("")
                                    }}
                                >
                                    <Text>{i?.full_name}</Text>
                                </Pressable>
                            )
                        })}
                    </View>}
                    {(displayVal == "private" && tagged?.length > 0) && <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 18, marginVertical: 12 }}>
                        {tagged.map((i, j) => {
                            return (
                                <View key={i?._id} style={{ backgroundColor: Appcolor.primary, minWidth: 60, padding: 8, minHeight: 34, borderRadius: 12, marginRight: 10, justifyContent: "center", alignItems: 'center' }}>
                                    <Pressable
                                        onPress={() => {
                                            let temp = [...tagged]
                                            temp.splice(j, 1)
                                            setTagged(temp)
                                        }}
                                        style={{ position: 'absolute', right: -6, top: -6, backgroundColor: Appcolor.white, borderRadius: 10, }}
                                    >
                                        <FastImage source={Appimg?.bin} style={{ height: 10, width: 10, margin: 4 }} />
                                    </Pressable>
                                    <Text>{i?.full_name}</Text>
                                </View>
                            )
                        })}
                    </ScrollView>}
                    {/* <Text style={[Commonstyles.mediumText10, { marginHorizontal: 18, marginTop: 16, marginBottom: 8 }]}>Upload Photos</Text> */}
                </View>
                <Btn transparent={Appcolor.blackop} title={en?.continue} twhite styleMain={{ alignSelf: "center", marginTop: 40, marginBottom: 100 }}
                    onPress={() => {
                        if (!displayVal || !collectionName || !collectionAbout) {
                            showToast("All fields are required.")
                            return
                        }
                        updateCollection()
                    }}
                />
            </KeyboardAwareScrollView>
        </ImageBackground>
    )
}

export default ProductEditScreenB

const styles = StyleSheet.create({
    mainview: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
})