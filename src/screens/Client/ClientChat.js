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
import { useSelector } from 'react-redux'
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useFocusEffect, useTheme } from '@react-navigation/native'
import moment from 'moment'
import { fileUrl } from '../../apimanager/httpmanager'
import showToast from '../../CustomToast'
import CameraModal from '../../components/CameraModal'
import ImagePicker from 'react-native-image-crop-picker';
import { SendNotification } from '../../apimanager/httpServices'
import EmojiPicker from 'rn-emoji-keyboard'
import Commonstyles from '../../constants/Commonstyles'
import FastImage from 'react-native-fast-image'

const ClientChat = ({ navigation, route }) => {
    const { Appcolor } = useTheme()
    const scrollRef = useRef(null);
    const theme = useSelector(state => state.theme?.theme)
    const userMine = useSelector((state) => state?.auth?.user);
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([]);
    const [showConfirmOrder, setShowConfirmOrder] = useState(false)
    const [user, setUser] = React.useState(route?.params?.item ?? {})
    const [userOnline, setUserOnline] = React.useState(false)
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [item, setItem] = useState({})
    const [roomId, setRoomId] = React.useState([user?._id, userMine?._id].sort().join("_"))
    const [editMode, setEditMode] = useState(false)
    const [editID, setEditID] = useState("")
    const [emojiKeyboard, setEmojiKeyboard] = useState(false)
    const [emojiMessage, setEmojiMessage] = useState(null)
    const [hideAttachment, setHideAttachment] = useState(false)
    const [replyTo, setReplyTo] = useState(null)

    const fromCamera = () => {
        ImagePicker.openCamera({
            mediaType: "photo",
            // cropping: true,
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
                setMessages([...final])
            },
            (error) => console.error(error), // onError
        )

        return () => {
            unsub()
            setMessages([])
        }
    }, [roomId])
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
            users: [userMine, user],
            unreadCount: {
                [`${userMine?._id}`]: 0,
                [`${user?._id}`]: firestore.FieldValue.increment(1),
            },
            userIds: [userMine?._id, user?._id],
            lastMessage: message,
            type: "single"
        }, { merge: true })
        let res = await SendNotification({ sender_user_id: user?._id, user_type: 'stylist', user_id: user._id, payload: { title: 'New Message', body: userMine?.full_name + ' sent you a message', channel_id: "call", android_channel_id: "call", data: { user_type: 'client', type: 'chat', profile: userMine?.profile_pic, name: userMine?.full_name, user_id: userMine._id } } })
    }, [roomId, userMine, user, replyTo])
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
    const uploadImage = async image => {
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
        allReactions?.push({ by: userMine?._id, emoji: emoji })
        // allReactions?.push({ by: userMine?._id, emoji: emoji?.emoji })
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
                        <Pressable style={{ justifyContent: "center" }} onPress={() => { navigation.navigate("BottomTabC") }}>
                            <Image source={Appimg.backwh} style={styles.back} />
                        </Pressable>
                        <Pressable
                            // onPress={() => { navigation?.navigate("SeasonStack", { screen: "StylishProfile", params: { id: user?._id } }) }}
                            onPress={() => {
                                if (user?.user_type == "brand") {
                                    // navigation?.navigate("BrandProfileStylist", { brand: user?._id })
                                    navigation?.navigate("SeasonStack", { screen: "BrandProfile", params: { id: user?._id } })
                                } else {
                                    navigation?.navigate("SeasonStack", { screen: "StylishProfile", params: { id: user?._id } })
                                }
                            }}
                        >
                            <Image source={user?.profile_pic == '' ? Appimg.user : { uri: fileUrl + user.profile_pic }} style={styles.profile} />
                        </Pressable>
                        <Text style={{ color: Appcolor.white, maxWidth: "60%", marginLeft: 6, fontSize: RFValue(14), fontFamily: Appfonts.semiBold }} numberOfLines={2}>{user?.full_name} {user?.user_type == "brand" && `(${user?.parent_brand_detail?.brand_name ?? ""})`}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center", width: widthPercentageToDP(40) }}>
                    <Pressable onPress={() => { navigation.navigate("CallClient", { otherUser: user }) }}>
                        <Image source={Appimg.call} style={styles.Call} />
                    </Pressable>

                    <Pressable style={{ marginLeft: 16 }} onPress={() => { navigation.navigate("VideoCallClient", { otherUser: user }) }}>
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
            <ConfirmOrder vis={showConfirmOrder} item={item} isClient={true}
                onPressOut={() => { setShowConfirmOrder(false) }}
                onPressDone={() => {
                    setShowConfirmOrder(false)
                }}
            />
            <SectionList
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
                                setItem(item)
                                setShowConfirmOrder(true)
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

export default ClientChat

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