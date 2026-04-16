import { Alert, FlatList, ImageBackground, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Appcolor from '../../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Btn from '../../components/Btn'
import NotificationBlock from '../../components/NotificationBlock'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { DeleteNotclientApi, GetClientFollowRequest } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import showToast from '../../CustomToast'
import { RFValue } from 'react-native-responsive-fontsize'
import { SwipeListView } from 'react-native-swipe-list-view'

const NotificationC = ({ navigation }) => {
    let dispatch = useDispatch()
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme
    const load = useSelector(state => state.load)?.isLoading
    const [notiList, setNotiList] = useState([])
    const [isFetching, setIsFetching] = useState(false)

    useFocusEffect(useCallback(() => {
        get_request()
    }, []))

    async function get_request() {
        try {
            dispatch(setLoading(true))
            let res = await GetClientFollowRequest()
            console.log(res?.data?.status, 'GetFollowRequest')
            if (res?.data?.status) {
                setNotiList([...res?.data?.data])
            } else {
                setNotiList([])
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function request(item, type) {
        try {
            let _data = {
                "client_id": item?.client_id?._id,
                "request_id": item?.follow_request_id,
                "follow_status": type
            }
            dispatch(setLoading(true))
            let res = await AcceptRejectRequest(_data)
            console.log(res.data, status, 'AcceptRejectRequest')
            if (res?.data?.status) {
                get_request()
                showToast(res?.data?.message)
            } else {

            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function on_delete(item) {
        dispatch(setLoading(true))
        let res = await DeleteNotclientApi(item?._id)
        try {
            if (res?.data?.status) {
                get_request()
            } else {
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header showBack={true} onBackPress={() => navigation.goBack()} title={en?.notifications} />
            <SwipeListView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => get_request()} />}
                data={notiList}
                renderItem={({ item, index }) => {
                    return (
                        <NotificationBlock index={index} item={item}
                            onDeletePress={() => {
                                Alert.alert(
                                    en.areyousure,
                                    en.deletenotification,
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
                            onPressAccept={() => { request(item, "accepted") }}
                            onPressReject={() => { request(item, "rejected") }}
                        />
                    )
                }}
                leftOpenValue={75}
                rightOpenValue={-75}
                disableRightSwipe={true}
                keyExtractor={(item, index) => index.toString()}
                onSwipeValueChange={({ swipeData }) => {
                    console.log("swipeData", swipeData)
                }}
                ListEmptyComponent={() => {
                    return (load ? null : <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18, marginTop: 100, textAlign: 'center' }]}>No request found!</Text>)
                }}
            />
        </ImageBackground>
    )
}

export default NotificationC

const styles = StyleSheet.create({})