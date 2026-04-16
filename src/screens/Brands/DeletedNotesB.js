import { Alert, FlatList, ImageBackground, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTheme } from '@react-navigation/native'
import Header from '../../components/Header'
import { useDispatch, useSelector } from 'react-redux'
import Appimg from '../../constants/Appimg'
import showToast from '../../CustomToast'
import Searchbar from '../../components/Searchbar'
import { NoteBlock } from '../../components/NoteBlock'
import en from '../../translation'
import { setLoading } from '../../redux/load'
import { deleteNotes, getRecentlyDeletedNotes, restore_note } from '../../apimanager/brandServices'

const DeletedNotesB = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme)?.theme
    const [allNotes, setAllNotes] = useState([])
    const [filterData, setFilterData] = useState([])
    const [search, setSearch] = useState("")
    const [needCancel, setNeedCancel] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            getNotes()
        }, 400);
    }, [])
    useEffect(() => {
        if (search.trim() != "") {
            let temp = allNotes?.filter(x => x?.title?.toLowerCase()?.includes(search?.toLowerCase()))
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

    const getNotes = async () => {
        try {
            dispatch(setLoading(true))
            let res = await getRecentlyDeletedNotes()
            if (res?.data?.status) {
                let temp = res?.data?.data ?? []
                setAllNotes(temp?.reverse())
            } else {
                setAllNotes([])
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const restoreNote = async (note_id) => {
        try {
            let res = await restore_note({ note_id })
            if (res?.data?.status) {
                removeItem(note_id)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const permanentlyDelete = async (note_id) => {
        try {
            dispatch(setLoading(true))
            let res = await deleteNotes(note_id, 1)
            if (res?.data?.status) {
                removeItem(note_id)
                showToast(res?.data?.message ?? "Deleted.")
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetSearch = () => {
        setNeedCancel(false)
        setSearch("")
    }
    const removeItem = (i) => {
        let arr1 = removingFn(allNotes, i)
        setAllNotes(arr1)
        if (search?.trim() != "") {
            let arr2 = removingFn(filterData, i)
            setFilterData(arr2)
        }
    }
    const removingFn = (arr, i) => {
        let temp = [...arr]
        return temp.filter(x => x?._id != i)
    }

    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header title={"Deleted Notes"} showBack={true} onBackPress={() => {
                navigation.goBack()
            }} />
            <Searchbar styleMain={{ marginVertical: 5 }}
                value={search} onChangeText={(t) => setSearch(t)}
                place={"Search Note"}
                showCancel={needCancel}
                onPressBtn={() => {
                    resetSearch()
                }}
            />
            <FlatList
                data={search?.trim() == "" ? allNotes : filterData}
                renderItem={({ item, index }) => {
                    return (
                        <NoteBlock item={item} index={index}
                            isDeleted={true}
                            onPermanentlyDelete={() => {
                                Alert.alert(
                                    en.areyousure,
                                    en.deletenote,
                                    [
                                        {
                                            text: en.yes,
                                            onPress: () => {
                                                permanentlyDelete(item?._id)
                                            },
                                        },
                                        {
                                            text: en.No,
                                        },
                                    ]
                                );
                            }}
                            onRestore={() => {
                                restoreNote(item?._id)
                            }}
                        />
                    )
                }}
            />
        </ImageBackground>
    )
}

export default DeletedNotesB

const styles = StyleSheet.create({})