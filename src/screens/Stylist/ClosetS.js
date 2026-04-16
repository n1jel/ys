import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import ClosetBlock from '../../components/ClosetBlock'
import FastImage from 'react-native-fast-image'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch, useSelector } from 'react-redux'
import { DeleteCollection, GetCollection } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import en from '../../translation'
import { Productdetail } from '../../redux/CommanReducer'
import Searchbar from '../../components/Searchbar'

const ClosetS = ({ navigation }) => {
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

    //     useFocusEffect(()=>{ console.log("inside  useCallback")
    //     get_collection(false)} ,[])

    //    useEffect(() => {
    //     console.log("inside  useEffect")
    //     get_collection(true)

    //    }, [])



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
        console.log("inside get collection")
        dispatch(setLoading(state))
        try {
            let res = await GetCollection({ limit, page: 1 })
            // console.log(res,"statusssssss")
            if (res?.data?.status) {

                let collections = res.data.data
                // console.log(collections,"here is data")
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
        } finally {
            dispatch(setLoading(false))
        }
    }
    const getMoreDataCollection = async (page) => {
        try {
            setGettingmoreCollections(true)
            let res = await GetCollection({ limit, page })
            if (res?.data?.status) {
                let collections = res.data.data
                if (collections?.length) {
                    setCollection([...collection]?.concat(res?.data?.data))
                }
                setTotalPage(res?.data?.other?.total_page)
                setPage(res?.data?.other?.current_page)
            }
        } catch (e) {
        } finally {
            setGettingmoreCollections(false)
        }
    }
    async function on_delete(item) {
        dispatch(setLoading(true))
        let res = await DeleteCollection(item._id)
        try {
            if (res?.data?.status) {
                get_collection()
            }
        } catch (e) {
        } finally {
            // dispatch(setLoading(false))
        }
    }
    const _headerComp = () => {
        return (
            <LibraryBlock onPress={() => navigation?.navigate("UserGallery")} />
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
                    dispatch(Productdetail(item._id))
                    navigation.navigate("ProductEditScreen", { _item: item })
                }}
                onPress={() => {
                    // setShowPost(true)
                    // setShowMedia(item?.media_data)
                    // dispatch(Productdetail(item._id))
                    navigation.navigate("ProductScreen", { _item: item })
                }}
            />
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            <Header title={"Albums"}
            // showBack
            // onBackPress={() => {
            //     navigation?.navigate("FeedStackS")
            // }}
            />
            <View style={{ height: 16 }} />
            <Searchbar place={en?.SearchAlbums} value={search} onChangeText={t => setSearch(t)}
                showCancel={search?.length > 0 ? true : false}
                onPressBtn={() => setSearch("")}
            />
            {/* data={search?.trim()?.length > 0 ? filteredCollection : collection} */}
            <FlatList
                data={search?.trim()?.length > 0 ? filteredCollection : collection}
                numColumns={2}
                contentContainerStyle={{ marginVertical: 10 }}
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
                onPress={() => navigation.navigate("CreateCollection")}
            >
                <FastImage source={Appimg?.plus} style={{ height: "100%", width: "100%" }} />
            </TouchableOpacity>
        </View>
    )
}

export default ClosetS

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

const LibraryBlock = React.memo(({ onPress }) => {
    const { Appcolor } = useTheme();
    return (
        <Pressable onPress={onPress} style={{ height: heightPercentageToDP(32), width: "92%", alignSelf: "center", backgroundColor: "white", borderRadius: 10, overflow: "hidden", marginVertical: 18 }}>
            <FastImage source={Appimg.ysgallery} style={{ height: "84%", width: "100%", resizeMode: "cover" }} />
            <View style={{ height: "16%", backgroundColor: Appcolor.whiteop, justifyContent: "center" }}>
                <Text style={[Commonstyles(Appcolor).mediumText14, { fontSize: RFValue(13), marginLeft: 8 }]}>Your Season Gallery</Text>
            </View>
        </Pressable>
    )
})
