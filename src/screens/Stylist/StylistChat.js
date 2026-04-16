import { FlatList, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import Appimg from '../../constants/Appimg'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appcolor from '../../constants/Appcolor'
import { RFValue } from 'react-native-responsive-fontsize'
import Appfonts from '../../constants/Appfonts'
import { ChatView, ChatInput } from '../../components/ChatView'
import LinearGradient from 'react-native-linear-gradient'
import ConfirmOrder from '../../components/ConfirmOrder'
import { useDispatch, useSelector } from 'react-redux'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useFocusEffect, useTheme } from '@react-navigation/native'
import moment from 'moment'
import { fileUrl } from '../../apimanager/httpmanager'
import showToast from '../../CustomToast'
import CameraModal from '../../components/CameraModal'
import ImagePicker from 'react-native-image-crop-picker';
import { ConfirmOrderApi, SendNotification } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import EmojiPicker, { tr } from 'rn-emoji-keyboard'
import en from '../../translation'
import FastImage from 'react-native-fast-image'
import Commonstyles from '../../constants/Commonstyles'

const StylistChat = ({ navigation, route }) => {
    let dispatch = useDispatch()
    const scrollRef = useRef(null);

    let theme = useSelector(state => state.theme?.theme)
    const userMine = useSelector((state) => state?.auth?.user);

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([]);
    const [showConfirmOrder, setShowConfirmOrder] = useState(false)
    const [user, setUser] = React.useState(route?.params?.item ?? {})
    const [userOnline, setUserOnline] = React.useState(false)
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [item, setItem] = useState({})
    const [changeID, setChangeID] = useState("")
    const { Appcolor } = useTheme()
    const [roomId, setRoomId] = React.useState([user?._id, userMine?._id].sort().join("_"))
    const [editMode, setEditMode] = useState(false)
    const [editID, setEditID] = useState("")
    const [emojiKeyboard, setEmojiKeyboard] = useState(false)
    const [emojiMessage, setEmojiMessage] = useState(null)
    const [hideAttachment, setHideAttachment] = useState(false)
    const [replyTo, setReplyTo] = useState(null)

    const getChatRef = (room) => {
        return firestore().collection("chats").doc(room)
    }
    useEffect(() => {
        if (user?._id && userMine?._id) {
            setRoomId([user?._id, userMine?._id].sort().join("_"))
        }
    }, [userMine, user])
    React.useEffect(() => {
        if (route?.params?.item) {
            // console.log(route?.params?.item, 'stylist_data')
            setUser(route?.params?.item)
        }
    }, [route?.params?.item])
    React.useEffect(() => {
        if (route?.params?.key) {
            setRoomId(route?.params?.key);
            getChatRef(route?.params?.key)
                .onSnapshot(querySnapshot => {
                    let users = []
                    users = querySnapshot?._data?.users
                    let otherUser = users?.filter(x => x?._id != userMine?._id)
                    setUser(...otherUser)
                })
        }

    }, [route?.params?.key])

    const clearUnReadCount = (roomIds) => {
        getChatRef(roomIds).get().then(doc => {
            let prevData = doc.data()
            if (prevData?.unreadCount) {
                getChatRef(roomIds).update({
                    unreadCount: {
                        [`${userMine?._id}`]: 0,
                        [`${user?._id}`]: prevData?.unreadCount[`${user?._id}`],
                    }
                })
            }

        }).catch(err => {
            console.log(err)
        })
    }
    useFocusEffect(React.useCallback(() => {
        clearUnReadCount(roomId)
        return () => {
            clearUnReadCount(roomId)
        }
    }, [roomId, userMine, user, messages]))
    // online and offline
    useEffect(() => {
        let unsub = firestore().collection("onlines").doc(user?.stylist_id).onSnapshot(
            (querySnapshot) => {
                let data = querySnapshot?.data()
                if (data?.online) {
                    setUserOnline(true)
                } else {
                    setUserOnline(false)
                }
            },
            (error) => console.log(error)
        )

        return () => {
            unsub()
            setUserOnline(false)

        }
    }, [user])
    useEffect(() => {
        let unsub = getChatRef(roomId).collection("messages").orderBy("createdAt", "desc").onSnapshot(
            (querySnapshot) => {
                let messagesC = []
                let total = []
                let final = []
                for (let doc of querySnapshot.docs) {
                    // for clearing the chats uncomment under one
                    // getChatRef(roomId).collection("messages").doc(doc.id).delete()
                    let title = moment(doc?.data()?.createdAt * 1000).format("Do MMM")
                    if (total.includes(title)) {
                    } else {
                        total.push(title)
                    }
                    messagesC.push({ ...doc?.data(), createdAt: moment(doc?.data()?.createdAt * 1000).toDate(), title: title })
                }
                total.forEach(e => {
                    let newa = messagesC?.filter(x => x?.title == e)
                    final?.push({ title: e, data: newa })
                });
                // console.log(final, 'finalllll')
                setMessages([...final])
            }, // onNext
            (error) => console.error(error), // onError
        )

        return () => {
            unsub()
            setMessages([])
        }
    }, [roomId])

    const fromCamera = () => {
        ImagePicker.openCamera({
            mediaType: "photo",
            // cropping: true
        }).then((image) => {
            uploadImage(image)
        });
    };
    const fromGallery = () => {
        ImagePicker.openPicker({
            mediaType: "photo",
            // cropping: true
        }).then((image) => {
            uploadImage(image)
        });
    };
    const onSend = useCallback(async (messages = []) => {
        let message = {
            _id: moment().unix(),
            text: messages[0].text,
            type: messages[0].type ?? "text",
            image: messages[0].image ?? "",
            location: messages[0].location ?? {},
            createdAt: moment().unix(),
            user: {
                _id: userMine?._id,
                full_name: userMine?.full_name,
                profile_pic: userMine?.profile_pic
            }
        }
        if (replyTo) {
            message = { ...message, repliedTo: replyTo }
        }
        setReplyTo(null)
        getChatRef(roomId).collection("messages").add(message)
        getChatRef(roomId).set({
            users: [{ _id: userMine?._id, full_name: userMine?.full_name, profile_pic: userMine?.profile_pic }, user],
            unreadCount: {
                [`${userMine?._id}`]: 0,
                [`${user?._id}`]: firestore.FieldValue.increment(1),
            },
            userIds: [userMine?._id, user?._id],
            lastMessage: message,
            type: "single"
        }, { merge: true })
        let res = await SendNotification({ sender_user_id: userMine?._id, user_type: user?.user_type == "brand" ? "brand" : 'client', user_id: user._id, payload: { title: 'New Message', body: userMine?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'stylist', type: 'chat', profile: userMine?.profile_pic, name: userMine?.full_name, user_id: userMine._id } } })
    }, [roomId, userMine, user, replyTo])
    const uploadImage = async image => {
        console.log(image.path)
        try {
            let filename = image.path.split('/').pop();
            const uploadUri = image.path;
            onSend([{ text: "Picture", type: "image", image: uploadUri }])
            await storage().ref(filename).putFile(uploadUri);
            const url = await storage().ref(filename).getDownloadURL();
            updateImageURL(uploadUri, url)
        } catch (error) {
            console.log(error)
            alert('Something went wrong while sending your image!');
        }
    };
    const updateImageURL = async (path, url) => {
        let datas = await getChatRef(roomId).collection("messages").where('image', "==", path).get()
        datas.docs.map(doc => {
            getChatRef(roomId).collection("messages").doc(doc.id).update({
                image: url
            })
        })
    }
    async function on_confirm() {
        let _data = {
            'client_id': item?.user?._id,
            'collection_id': item?.collectionitem?._id,
            'media_id': item?.imageData?._id
        }
        try {
            dispatch(setLoading(true))
            let res = await ConfirmOrderApi(_data)
            if (res?.data?.status) {
                showToast(res?.data?.message)
                setTimeout(() => {
                    updateOrder(changeID, item?.imageData?._id)
                }, 200);
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const changeThis = async (txt) => {
        getChatRef(roomId).collection("messages").get().then((querySnapshot) => {
            let temp = []
            temp = querySnapshot.docs
            let x = temp?.filter(x => x?._data?._id == txt?._id)
            let id = x[0]?.id
            setChangeID(id)
        })
    }
    const updateOrder = async (id, pid) => {
        try {
            let querySnapshot = await getChatRef(roomId).collection("messages").where("imageData._id", "==", pid).where('isConfirmed', '==', 0).get()
            const batch = firestore().batch();
            querySnapshot?._docs.forEach((doc) => {
                const documentRef = getChatRef(roomId).collection("messages").doc(doc.id);
                batch.update(documentRef, { isConfirmed: 1 });
            });
            await batch.commit();

            // .doc(id).set({
            //     isConfirmed: 1
            // }, { merge: true })
            // getChatRef(roomId).collection("messages").doc(id).set({
            //     isConfirmed: 1
            // }, { merge: true })
            // getChatRef(roomId).get().then(documentSnapshot => {
            //     let temp = []
            //     temp = documentSnapshot?._data?.products?.filter(x => x?.id != pid)
            //     let x = { "id": pid, isConfirmed: 1 }
            //     temp.push(x)
            //     getChatRef(roomId).set({
            //         products: temp
            //     }, { merge: true })
            // })
        } catch (e) {

        }
    }
    const editMessage = async (item) => {
        let temp = await getChatRef(roomId).collection("messages").where("_id", "==", item?._id).get()
        let data = temp?._docs[0]
        let id = data?.id
        let message = data?._data?.text
        setMessage(message)
        setEditID(id)
        setEditMode(true)
    }
    const submitEdit = (id, txt) => {
        try {
            getChatRef(roomId).collection("messages").doc(id).set({
                text: txt,
                updatedAt: moment().unix()
            }, { merge: true })
            endEditMode()
        } catch (e) {
            console.log("while editing message", e);
        }
    }
    const endEditMode = () => {
        setEditID("")
        setEditMode(false)
    }
    const sendEmoji = async (emoji, emojiMessage) => {
        let temp = await getChatRef(roomId).collection("messages").where("_id", "==", emojiMessage?._id).get()
        let data = temp?._docs[0]
        let id = data?.id
        let allReactions = data?._data?.reactions ?? []
        if (allReactions?.length > 0) {
            let temp = allReactions?.filter(x => x?.by != userMine?._id)
            allReactions = [...temp]
        }
        // allReactions?.push({ by: userMine?._id, emoji: emoji?.emoji })
        allReactions?.push({ by: userMine?._id, emoji })
        if (!id) {
            showToast(en?.sthwentWrong)
            return
        }
        getChatRef(roomId).collection("messages").doc(id).set({
            reactions: allReactions,
            updatedAt: moment().unix()
        }, { merge: true })
    }
    const scrollToRepliedMessage = async (item, index) => {
        let itemInd = -1
        let sectionInd = -1
        messages?.forEach((e, ind) => {
            if (e?.title == item?.repliedTo?.title) {
                itemInd = e?.data?.findIndex(x => x?._id == item?.repliedTo?._id)
                sectionInd = ind
            }
        })
        scrollRef?.current?.scrollToLocation({ itemIndex: itemInd, sectionIndex: sectionInd })
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <LinearGradient colors={[Appcolor.grad1, Appcolor.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.headerView]}>
                <View style={{ flexDirection: "row", width: widthPercentageToDP(60) }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16 }}>
                        <Pressable style={{ justifyContent: "center" }} onPress={() => { navigation.goBack() }}>
                            <Image source={Appimg.backwh} style={styles.back} />
                        </Pressable>
                        <Pressable onPress={() => {
                            if (user?.user_type == "brand") {
                                navigation?.navigate("BrandProfileStylist", { brand: user?._id })
                            } else {
                                navigation?.navigate("ClientProfile", { item: user })
                            }
                        }}>
                            <Image source={user?.profile_pic == '' ? Appimg.user : { uri: fileUrl + user.profile_pic }} style={styles.profile} />
                        </Pressable>
                        <Text style={{ color: Appcolor.white, fontSize: RFValue(14), marginLeft: 4, maxWidth: "60%", fontFamily: Appfonts.semiBold }} numberOfLines={2}>{user?.full_name}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", width: widthPercentageToDP(40), justifyContent: "center" }}>
                    <Pressable onPress={() => { navigation.navigate("CallStylist", { otherUser: user }) }}>
                        <Image source={Appimg.call} style={styles.Call} />
                    </Pressable>

                    <Pressable style={{ marginLeft: 16 }} onPress={() => { navigation.navigate("VideoCallStylist", { otherUser: user }) }}>
                        <Image source={Appimg.VideoCall} style={[styles.Call, {}]} />
                    </Pressable>
                </View>
            </LinearGradient>

            <CameraModal visible={showCameraModal} onPressCancel={() => setShowCameraModal(false)}
                hideVideoOption
                onPressCamera={() => {
                    setShowCameraModal(false)
                    setTimeout(() => {
                        fromCamera()
                    }, 400);
                }}
                onPressGallery={() => {
                    setShowCameraModal(false)
                    setTimeout(() => {
                        fromGallery()
                    }, 400);
                }}
            />
            <ConfirmOrder vis={showConfirmOrder}
                item={item}
                onPressOut={() => { setShowConfirmOrder(false) }}
                onPressDone={() => {
                    setShowConfirmOrder(false)
                    setTimeout(() => {
                        on_confirm()
                    }, 200);
                }}
                isParentBrand={user?.user_type == "brand" ? true : false}
            />
            <SectionList
                keyboardShouldPersistTaps={"handled"}
                ref={scrollRef}
                inverted={true}
                sections={messages}
                showsVerticalScrollIndicator={false}
                renderSectionFooter={({ section: { title } }) => {
                    return (
                        <Text style={{ fontFamily: Appfonts.semiBoldItalic, fontSize: 8.6, color: Appcolor.txt, textAlign: 'center', marginVertical: 16 }}>{title}</Text>
                    )
                }}
                onScrollEndDrag={() => {
                    Keyboard.dismiss()
                }}
                renderItem={({ item, index }) => {
                    return (
                        <ChatView
                            item={item}
                            index={index}
                            onPressImg={() => {
                                // if (item?.isConfirmed == 1) {
                                //     return
                                // }
                                setItem(item)
                                changeThis(item)
                                setTimeout(() => {
                                    setShowConfirmOrder(true)
                                }, 500);
                            }}
                            onLongPress={() => {
                                editMessage(item)
                            }}
                            onPressEmoji={(emoji) => {
                                sendEmoji(emoji, item)
                            }}
                            onSwipe={(e) => {
                                setHideAttachment(true)
                                setReplyTo(item)
                            }}
                            onPressRepliedTxt={() => {
                                scrollToRepliedMessage(item, index)
                            }}
                        />
                    )
                }}
            />
            {replyTo != null && <View style={{ backgroundColor: Appcolor.blackop, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 16, borderRadius: 12, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <View>
                    <FastImage source={Appimg.reply} style={{ height: 18, width: 22, marginBottom: 4 }} resizeMode='contain' />
                    {
                        replyTo?.type == "text" ?
                            <Text style={[Commonstyles(Appcolor).semiBoldIta10, { fontSize: 14, color: Appcolor.white, maxWidth: "88%" }]}>{replyTo?.text}</Text>
                            :
                            <FastImage source={replyTo?.imageData?.media_name ? { uri: fileUrl + replyTo?.imageData?.media_name } : { uri: replyTo?.image }} style={{ height: 80, width: 80 }} />
                    }
                </View>
                <Pressable
                    onPress={() => { setReplyTo(null); setHideAttachment(false) }}
                >
                    <FastImage source={Appimg?.cancel} style={{ height: 26, width: 26 }} />
                </Pressable>
            </View>}
            <KeyboardAvoidingView keyboardVerticalOffset={66} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ChatInput value={message} onChangeText={(t) => { setMessage(t) }}
                    editMode={editMode} hideAttachment={hideAttachment}
                    onAttachPress={() => {
                        setShowCameraModal(true)
                    }}
                    onSendPress={() => {
                        if (message.trim() == "") {
                            showToast('Enter message')
                            return
                        }
                        setMessage("")
                        if (editMode) {
                            submitEdit(editID, message)
                            return
                        }
                        onSend([{ text: message }])
                        setHideAttachment(false)
                    }}
                    onPressCancel={() => {
                        endEditMode()
                    }}
                />
            </KeyboardAvoidingView>
        </View>
    )
}

export default StylistChat

const styles = StyleSheet.create({
    headerView: {
        minHeight: 70,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    back: {
        height: 25,
        width: 25,
        alignSelf: "center",
        resizeMode: "contain"
    },
    profile: {
        height: 50,
        width: 50,
        alignSelf: "center",
        resizeMode: "cover",
        marginLeft: 10,
        borderRadius: 25
    },
    Call: {
        height: 40,
        width: 40,
        alignSelf: "center",
        resizeMode: "contain",
    },
})