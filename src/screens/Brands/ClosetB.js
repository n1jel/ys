import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import ClosetBlock from '../../components/ClosetBlock'
import FastImage from 'react-native-fast-image'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { useTheme } from '@react-navigation/native'
import en from '../../translation'
import { Productdetail, ProductdetailBrands } from '../../redux/CommanReducer'
import Searchbar from '../../components/Searchbar'
import { deleteCollection, getCollection } from '../../apimanager/brandServices'
import LibraryBlock from '../../components/LibraryBlock'

const ClosetB = ({ navigation }) => {
    const dispatch = useDispatch();
    const { Appcolor } = useTheme();

    const [collection, setCollection] = useState([])
    const [flatlistRerender, setflatlistRerender] = useState(false)
    const [filteredCollection, setFilteredCollection] = useState([])
    const [search, setSearch] = useState("")
    const limit = 10;
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)
    const [gettingmoreCollections, setGettingmoreCollections] = useState(false)
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        get_collection(true)
        const onFocus = () => {
            get_collection(true)
        };
        const unsubscribe = navigation.addListener("focus", onFocus);
        return () => {
            unsubscribe();
        };
    }, [navigation]);
    useEffect(() => {
        let key = search?.trim()?.toLowerCase()
        if (key) {
            setFilteredCollection(collection?.filter(x => (x?.name?.toLowerCase()?.includes(key) || x?.description?.toLowerCase()?.includes(key))))
        }
    }, [search])

    async function get_collection(state) {
        try {
            dispatch(setLoading(state))
            let res = await getCollection({ limit, page: 1 })
            if (res?.data?.status) {
                let collections = res.data.data
                if (collections?.length) {
                    setCollection([...collections])
                }
                setTotalPage(res?.data?.other?.total_page)
                setPage(res?.data?.other?.current_page)
                setflatlistRerender(true)
            } else {
                setCollection([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
            setIsFetching(false);
        }
    }
    const getMoreDataCollection = async (page) => {
        try {
            setGettingmoreCollections(true)
            let res = await getCollection({ limit, page })
            if (res?.data?.status) {
                let collections = res.data.data
                if (collections?.length) {
                    setCollection([...collection]?.concat(res?.data?.data))
                }
                setTotalPage(res?.data?.other?.total_page)
                setPage(res?.data?.other?.current_page)
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGettingmoreCollections(false)
        }
    }
    async function on_delete(item) {
        try {
            dispatch(setLoading(true))
            let res = await deleteCollection(item._id)
            if (res?.data?.status) {
                get_collection()
            }
        } catch (e) {
            console.error(e);
        } finally {
        }
    }
    const _headerComp = () => {
        return (
            <LibraryBlock onPress={() => navigation?.navigate("UserGalleryB")} />
        )
    }
    const _renderItem = ({ item, index }) => {
        return (
            <ClosetBlock item={item} index={index}
                onpressdelete={() => {
                    Alert.alert(
                        en.areyousure, en.deletepost,
                        [{ text: en.yes, onPress: () => { on_delete(item) } }, { text: en.No },]
                    );
                }}
                onPressEdit={() => {
                    dispatch(ProductdetailBrands(item._id))
                    navigation.navigate("ProductEditScreenB", { _item: item })
                }}
                onPress={() => {
                    navigation.navigate("ProductScreenB", { _item: item })
                }}
            />
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            <Header title={"Albums"}
            // showBack
            // onBackPress={() => {
            //     navigation?.navigate("FeedStackB")
            // }}
            />
            <View style={{ height: 16 }} />
            <Searchbar place={en?.SearchAlbums} value={search} onChangeText={t => setSearch(t)}
                showCancel={search?.length > 0 ? true : false}
                onPressBtn={() => setSearch("")}
            />
            <FlatList
                data={search?.trim()?.length > 0 ? filteredCollection : collection}
                numColumns={2}
                contentContainerStyle={{ marginVertical: 10 }}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => { setIsFetching(true); get_collection(true) }} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={_headerComp}
                ListEmptyComponent={() => {
                    return (<Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, textAlign: 'center' }]}>No Collection found</Text>)
                }}
                renderItem={_renderItem}
                ListFooterComponent={() => {
                    return (
                        <View style={{ height: 100 }}>
                            {gettingmoreCollections && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
                        </View>
                    )
                }}
                onEndReached={() => {
                    if (page < totalPage) {
                        getMoreDataCollection(page + 1)
                    }
                }}
                extraData={flatlistRerender}
            />
            <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: Appcolor.white, }]}
                onPress={() => navigation.navigate("CreateCollectionB")}
            >
                <FastImage source={Appimg?.plus} style={{ height: "100%", width: "100%" }} />
            </TouchableOpacity>
        </View>
    )
}

export default ClosetB

const styles = StyleSheet.create({
    addBtn: {
        height: 46,
        width: 46,
        position: "absolute",
        borderRadius: 60,
        zIndex: 1,
        bottom: 16,
        right: 10,
    },
})
