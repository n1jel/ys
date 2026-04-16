import { Alert, FlatList, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import { SafeAreaView } from 'react-native-safe-area-context'
import Commonstyles from '../../constants/Commonstyles'
import en from '../../translation'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import PasswordresetModal from '../../components/PasswordresetModal'
import showToast from '../../CustomToast'
import { DeleteClientNotes, DeleteNotes, GetClientNotesApi, GetNotesApi, new_passwordstylist } from '../../apimanager/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import Header from '../../components/Header'
import Appfonts from '../../constants/Appfonts'
import moment from 'moment'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { index } from 'realm'
import Searchbar from '../../components/Searchbar'
import { NoteBlock } from '../../components/NoteBlock'
import FastImage from 'react-native-fast-image'

export default function ClientNotes({ navigation }) {
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme
    const [data, setData] = useState([])
    const [filterData, setFilterData] = useState([])
    const [search, setSearch] = useState("")
    const [needCancel, setNeedCancel] = useState(false)

    useFocusEffect(useCallback(() => {
        setSearch("")
        setTimeout(() => {
            get_notes()
        }, 400);
    }, []))
    useEffect(() => {
        if (search.trim() != "") {
            let temp = data?.filter(x => (x?.title?.toLowerCase()?.includes(search?.toLowerCase()) || x?.description?.toLowerCase()?.includes(search?.toLowerCase())))
            if (temp?.length == 0) {
                showToast("No data found.")
                return
            }
            setNeedCancel(true)
            setFilterData(temp)
        }
        if (search.trim() == "") {
            resetSearch()
        }
    }, [search])

    async function get_notes() {
        try {
            dispatch(setLoading(true))
            let res = await GetClientNotesApi()
            if (res?.data?.status) {
                let temp = [...res?.data?.data]
                setData(temp.reverse())
            } else {
                setData([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function on_delete(item) {
        try {
            dispatch(setLoading(true))
            let res = await DeleteClientNotes(item?._id, 0)
            if (res?.data?.status) {
                removeItem(item)
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetSearch = () => {
        setNeedCancel(false)
        setSearch("")
    }
    const removeItem = (i) => {
        let arr1 = removingFn(data, i)
        setData(arr1)
        if (search?.trim() != "") {
            let arr2 = removingFn(filterData, i)
            setFilterData(arr2)
        }
    }
    const removingFn = (arr, i) => {
        let temp = [...arr]
        return temp.filter(x => x?._id != i?._id)
    }

    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header plusimage showBack={true} onBackPress={() => {
                navigation.goBack()
            }} title={"My Notes"} onAddPress={() => { navigation.navigate('AddNotes', { updateData: null }) }} />
            <Searchbar styleMain={{ marginVertical: 5 }}
                value={search} onChangeText={(t) => setSearch(t)}
                place={"Search Note"}
                showCancel={needCancel}
                onPressBtn={() => {
                    resetSearch()
                }}
            />
            <FlatList
                data={search?.trim() == "" ? data : filterData}
                renderItem={({ item, index }) => {
                    return (
                        <NoteBlock item={item} index={index}
                            onPressDelete={() => {
                                Alert.alert(
                                    en.areyousure,
                                    en.deletenote,
                                    [
                                        {
                                            text: en.yes,
                                            onPress: () => {
                                                on_delete(item)
                                            },
                                        },
                                        {
                                            text: en.No,
                                        },
                                    ]
                                );
                            }}
                            onPressNote={() => navigation.navigate('AddNotes', { updateData: item, html: item?.description })}
                            onPressEdit={() => {
                                navigation?.navigate("AddNotes", { updateData: item, html: item?.description })
                            }}
                        />
                    )
                }}
            />
            <TouchableOpacity style={{ position: 'absolute', bottom: 40, right: 30 }}
                onPress={() => {
                    navigation?.navigate("DeletedNotesC")
                }}
            >
                <FastImage source={Appimg?.deleted} style={{ height: 50, width: 50 }} />
            </TouchableOpacity>
        </ImageBackground>
    )
}