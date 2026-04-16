import { FlatList, StyleSheet, ImageBackground, View, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Searchbar from '../../components/Searchbar'
import MessageItem from '../../components/MessageItem'
import Appimg from '../../constants/Appimg'
import { useSelector } from 'react-redux'
import firestore from '@react-native-firebase/firestore';
import MessageItemS from '../../components/MessageItemS'
import showToast from '../../CustomToast'
import { useTheme } from '@react-navigation/native'

const MessageB = ({ navigation }) => {
    const userMe = useSelector((state) => state?.auth?.user);
    const [chatUsers, setChatsUsers] = React.useState([])
    const [search, setSearch] = useState("")
    const [filteredList, setFilteredList] = useState([])
    const { Appcolor } = useTheme()

    useEffect(() => {
        let unsub = firestore().collection("chats").where("userIds", "array-contains", userMe?._id ?? "")
            .onSnapshot((querySnapshot) => {
                let users = []
                for (let snaps of querySnapshot.docs) {
                    let data = snaps.data()
                    let otherUser = data?.users?.filter(x => x?._id != userMe?._id)
                    let unreadCount = data?.unreadCount ? data?.unreadCount[userMe?._id] : 0
                    if (otherUser?.length == 1) {
                        users.push({ user: otherUser[0], lastMessage: data?.lastMessage, unreadCount: unreadCount, type: "chat", key: data?.userIds?.sort()?.join("_") })
                    }
                }
                users.sort((a, b) => b.lastMessage?.createdAt - a.lastMessage?.createdAt)
                setChatsUsers(users)
            }, (error) => console.error(error))
        return () => { unsub() }
    }, [userMe])
    useEffect(() => {
        if (search?.length == 0) {
            setFilteredList([])
        } else if (search?.length > 0) {
            let temp = chatUsers
            let newArr = temp?.filter(x => x?.user?.full_name?.toLowerCase()?.includes(search.toLowerCase()))
            if (newArr?.length == 0) {
                showToast("Not found")
                return
            }
            setFilteredList(newArr)
        }
    }, [search])

    return (
        <ImageBackground source={Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Messages"} />
            <View style={{ marginTop: 20 }} />
            <Searchbar place={"Search..."} value={search} onChangeText={t => setSearch(t)} />
            <FlatList
                data={filteredList?.length > 0 ? filteredList : chatUsers}
                keyExtractor={(item) => item?.key}
                renderItem={({ item, index }) => {
                    return (
                        <MessageItemS
                            item={item}
                            onPress={() => {
                                navigation.navigate("BrandChat", { item: item.user })
                            }}
                        />
                    )
                }}
            />
            <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: Appcolor.white, }]}
                onPress={() => navigation?.navigate("CreateChat")}
            >
                <Image source={Appimg?.plus} style={{ height: "100%", width: "100%" }} />
            </TouchableOpacity>
        </ImageBackground>
    )
}

export default MessageB

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