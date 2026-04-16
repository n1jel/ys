import { Alert, FlatList, ImageBackground, Pressable, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import { DeleteNotes, GetNotesApi, new_passwordstylist } from '../../apimanager/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import Header from '../../components/Header'
import Appfonts from '../../constants/Appfonts'
import moment from 'moment'
import Searchbar from '../../components/Searchbar'
import showToast from '../../CustomToast'
import FastImage from 'react-native-fast-image'
import Popover from 'react-native-popover-view';
import en from '../../translation'
import { NoteBlock } from '../../components/NoteBlock'

export default function Notes({ navigation }) {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme)?.theme
    const [data, setData] = useState([])
    const [filterData, setFilterData] = useState([])
    const [search, setSearch] = useState("")
    const [needCancel, setNeedCancel] = useState(false)

    useFocusEffect(useCallback(() => {
        setSearch("")
        setTimeout(() => {
            get_notes()
        }, 500);
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
            let res = await GetNotesApi()
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
        dispatch(setLoading(true))
        try {
            let res = await DeleteNotes(item?._id, 0)
            if (res?.data?.status) {
                removeItem(item)
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
            }} title={"My Notes"} onAddPress={() => { navigation.navigate('CreateNotes', { updateData: null }) }} />
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
                            onPressNote={() => navigation.navigate('CreateNotes', { updateData: item, html: item?.description })}
                            onPressEdit={() => navigation.navigate('CreateNotes', { updateData: item, html: item?.description })}
                            onPressDelete={() => {
                                Alert.alert(
                                    en.areyousure,
                                    en.deletenote,
                                    [
                                        { text: en.yes, onPress: () => { on_delete(item) } },
                                        { text: en.No, },
                                    ]
                                );
                            }}
                        />
                    )
                }}
            />
            <TouchableOpacity style={{ position: 'absolute', bottom: 40, right: 30 }}
                onPress={() => {
                    navigation?.navigate("DeletedNotesS")
                }}
            >
                <FastImage source={Appimg?.deleted} style={{ height: 50, width: 50 }} />
            </TouchableOpacity>
        </ImageBackground>
    )
}
