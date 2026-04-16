import { Easing, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Appfonts from '../constants/Appfonts'
import Appimg from '../constants/Appimg'
import FastImage from 'react-native-fast-image'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Commonstyles from '../constants/Commonstyles'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { useTheme } from '@react-navigation/native'
import { SwipeRow } from 'react-native-swipe-list-view'
import Popover from 'react-native-popover-view'
import { fileUrl } from '../apimanager/httpmanager'
import VideoThumb from './VideoThumb'

const ChatView = ({ item, onPressImg, onLongPress, onPressEmoji, onSwipe, onPressRepliedTxt, openreaction, onRequestClose }) => {
    const userMine = useSelector((state) => state?.auth?.user);
    const { Appcolor } = useTheme()
    const [showPopOver, setShowPopOver] = useState(false)
    const emojiList = ["HEART", "LIKE", "DISLIKE", "EXCLA", "HAHA", "QUESTION"]
    const isMine = item?.user?._id == userMine?._id

    const animationConfig = {
        duration: 260, easing: Easing.out(Easing.quad)
    }
    const _renderReactions = () => {
        return (
            <View style={{ flexDirection: 'row' }}>
                {item?.reactions?.map((ele, j) => {
                    let i = ele?.emoji
                    return (
                        <Image
                            key={j}
                            source={i == "HEART" ? Appimg?.HEART : (i == "LIKE" ? Appimg.LIKE : (i == "DISLIKE" ? Appimg.DISLIKE : (i == "EXCLA" ? Appimg?.EXCLA : (i == "HAHA" ? Appimg?.HAHA : Appimg?.QUESTION))))}
                            style={[styles.emote, { marginHorizontal: 4 }]}
                            tintColor={i == "HEART" ? Appcolor.red : Appcolor.white}
                        />
                    )
                })}
            </View>
        )
    }
    const _repliedmessage = () => {
        return (
            <Pressable style={{ borderBottomWidth: 2, borderColor: Appcolor.yellowop, paddingBottom: 4, marginBottom: 4, paddingRight: 18 }}
                onPress={onPressRepliedTxt}
            >
                <FastImage source={Appimg.reply} style={{ height: 16, width: 16, marginBottom: 4 }} resizeMode='contain' />
                {item?.repliedTo?.type == "text" ?
                    <Text style={[Commonstyles(Appcolor).semiBoldIta10, { fontSize: 12, color: Appcolor.white }]}>{item?.repliedTo?.text}</Text>
                    :
                    <FastImage source={item?.repliedTo?.imageData?.media_name ? { uri: fileUrl + item?.repliedTo?.imageData?.media_name } : { uri: item?.repliedTo?.image }} style={{ height: 80, width: 80 }} />
                }
            </Pressable>
        )
    }
    const emoteList = useCallback(() => {
        return (
            emojiList.map((i, j) => {
                let reactedEmote = item?.reactions ? item?.reactions[0]?.emoji == i : ""
                return (
                    <Pressable
                        onPress={() => {
                            onPressEmoji(i)
                            setShowPopOver(false)
                        }}
                        key={j}
                    >
                        <FastImage
                            source={i == "HEART" ? Appimg?.HEART : (i == "LIKE" ? Appimg.LIKE : (i == "DISLIKE" ? Appimg.DISLIKE : (i == "EXCLA" ? Appimg?.EXCLA : (i == "HAHA" ? Appimg?.HAHA : Appimg?.QUESTION))))}
                            style={styles.emote}
                        // tintColor={reactedEmote ? Appcolor.grad2 : null}
                        />
                    </Pressable>
                )
            }))
    }, [emojiList])
    const EmojiBlock = () => {
        return (
            <View style={{ backgroundColor: Appcolor.white }}>
                <View style={{ backgroundColor: Appcolor.txt, minHeight: 60, padding: 20, flexDirection: 'row', justifyContent: "center", alignItems: 'center', borderRadius: 40 }}>
                    {emoteList()}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 4, alignSelf: isMine ? 'flex-end' : "flex-start" }}>
                    {isMine && <View>
                        <View style={[styles.upperBubble, { backgroundColor: Appcolor.txt }]} />
                        <View style={[styles.lowerBubble, { backgroundColor: Appcolor.txt }]} />
                    </View>}
                    {item?.type == "text" ?
                        <View style={[{ backgroundColor: "#f6edd5", paddingHorizontal: 20, paddingVertical: 16, borderRadius: 20, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, maxWidth: widthPercentageToDP(80) }, isMine && { borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}>
                            <Text>{item?.text}</Text>
                        </View>
                        :
                        <View>
                            <FastImage source={{ uri: item?.image }} style={{ height: 160, width: 160, borderRadius: 4 }} />
                        </View>
                    }
                    {!isMine && <View>
                        <View style={[styles.upperBubble, { backgroundColor: Appcolor.txt }]} />
                        <View style={[styles.lowerBubble, { backgroundColor: Appcolor.txt }]} />
                    </View>}
                </View>
            </View>
        )
    }
    if (item?.type == "image" || item?.type == "video") {
        return (
            <>
                {isMine ?
                    <SwipeRow swipeGestureBegan={onSwipe} directionalDistanceChangeThreshold={24}>
                        <View />
                        <View style={{ marginBottom: 12, alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: "row" }}>
                                <Popover
                                    onRequestClose={() => setShowPopOver(false)}
                                    from={
                                        <TouchableOpacity
                                            style={{ padding: 8, maxHeight: 30 }}
                                            onPress={() => {
                                                setShowPopOver(true)
                                            }}
                                        >
                                            <FastImage source={Appimg?.emoji} style={styles.emoji} />
                                        </TouchableOpacity>
                                    }
                                    isVisible={showPopOver}
                                    arrowSize={{ height: 0, width: 0 }}
                                    placement={"top"}
                                    backgroundStyle={{ borderRadius: 40, backgroundColor: Appcolor.white }}
                                    verticalOffset={50}
                                >
                                    <>
                                        <EmojiBlock />
                                    </>
                                </Popover>
                                <Pressable onPress={onPressImg} style={{ maxWidth: '80%', marginRight: 8 }}>
                                    {item?.type == "video" ?
                                        <VideoThumb source={item?.imageData?.gallery_data?.media_name} styleMain={{ height: 160, width: 160, borderRadius: 4 }} resizeMode={"stretch"} />
                                        :
                                        <FastImage source={item?.type == "video" ? { uri: fileUrl + item?.imageData?.gallery_data?.thumbnail } : { uri: item?.image }} style={{ height: 160, width: 160, borderRadius: 4 }} />
                                    }
                                    {item?.isConfirmed == 1 && <View style={styles.overlay} >
                                        <Image source={Appimg?.confirmed} style={styles.overlayImg} />
                                        <Text style={[Commonstyles(Appcolor).semiBold26, { color: Appcolor.white, fontSize: 10, textAlign: "center", marginTop: 6 }]}>Order Confirmed</Text>
                                    </View>}
                                    {item?.isLiked == 1 && item?.isConfirmed != 1 && <View style={styles.overlay} >
                                        <Image source={Appimg?.like} style={styles.overlayImg} />
                                    </View>}
                                </Pressable>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 2, alignItems: 'center' }}>
                                <Text style={{ fontFamily: Appfonts.semiBoldItalic, fontSize: 8.6, color: Appcolor.txt, textAlign: "right", marginRight: 4 }}>{moment(item?.createdAt).format('hh:mm A')}</Text>
                            </View>
                            {item?.reactions?.length && <View style={{ position: 'absolute', backgroundColor: Appcolor.txt, borderRadius: 12, padding: 4, bottom: 0, right: 100 }}>
                                {_renderReactions()}
                            </View>}
                        </View >
                    </SwipeRow>
                    :
                    <SwipeRow swipeGestureBegan={onSwipe} directionalDistanceChangeThreshold={24}>
                        <View />
                        <Pressable style={{ flexDirection: 'row', marginBottom: 12, marginHorizontal: 8 }}
                            onPress={onPressImg}
                        >
                            <View style={{ maxWidth: '80%', }}>
                                {item?.type == "video" ?
                                    <VideoThumb source={item?.imageData?.gallery_data?.media_name} styleMain={{ height: 160, width: 160, borderRadius: 4 }} resizeMode={"stretch"} />
                                    :
                                    <FastImage source={item?.type == "video" ? { uri: fileUrl + item?.imageData?.gallery_data?.thumbnail } : { uri: item?.image }} style={{ height: 160, width: 160, borderRadius: 4 }} />
                                }
                                <Text style={{ fontFamily: Appfonts.semiBoldItalic, fontSize: 8.6, color: Appcolor.txt, textAlign: "left", marginTop: 2, marginLeft: 16 }}>{moment(item?.createdAt).format('hh:mm A')}</Text>
                                {(item?.type == "video" && item?.isConfirmed != 1 && item?.isLiked != 1) &&
                                    <View style={[styles.overlay, { backgroundColor: 'transparent' }]} >
                                        <Image source={Appimg.play} style={[styles.overlayImg]} />
                                    </View>
                                }
                                {item?.isConfirmed == 1 && <View style={styles.overlay} >
                                    <Image source={Appimg?.confirmed} style={styles.overlayImg} />
                                    <Text style={[Commonstyles(Appcolor).semiBold26, { color: Appcolor.white, fontSize: 10, textAlign: "center", marginTop: 6 }]}>Order Confirmed</Text>
                                </View>}
                                {item?.isLiked == 1 && item?.isConfirmed != 1 && <View style={styles.overlay} >
                                    <Image source={Appimg?.like} style={styles.overlayImg} />
                                </View>}
                            </View>
                            <Popover
                                onRequestClose={() => setShowPopOver(false)}
                                from={
                                    <TouchableOpacity
                                        style={{ padding: 8, maxHeight: 30 }}
                                        onPress={() => {
                                            setShowPopOver(true)
                                        }}
                                    >
                                        <FastImage source={Appimg?.emoji} style={styles.emoji} />
                                    </TouchableOpacity>
                                }
                                isVisible={showPopOver}
                                arrowSize={{ height: 0, width: 0 }}
                                placement={"top"}
                                backgroundStyle={{ borderRadius: 40, backgroundColor: Appcolor.white }}
                                verticalOffset={100}
                            >
                                <>
                                    <EmojiBlock />
                                </>
                            </Popover>
                            {item?.reactions?.length && <View style={{ position: 'absolute', backgroundColor: Appcolor.txt, borderRadius: 12, padding: 4, bottom: 0, left: 100 }}>
                                {_renderReactions()}
                            </View>}
                        </Pressable>

                    </SwipeRow>
                }
            </>
        )
    }
    else {
        return (
            <>
                {isMine ?
                    <SwipeRow style={{ flexGrow: 1 }} swipeGestureBegan={onSwipe} directionalDistanceChangeThreshold={24}>
                        <View />
                        <View style={{ marginBottom: 12, alignItems: "flex-end" }}>
                            <View style={{ flexDirection: "row" }}>
                                <Popover
                                    onRequestClose={() => setShowPopOver(false)}
                                    from={
                                        <TouchableOpacity
                                            style={{ padding: 8, maxHeight: 30 }}
                                            onPress={() => {
                                                setShowPopOver(true)
                                            }}
                                        >
                                            <FastImage source={Appimg?.emoji} style={styles.emoji} />
                                        </TouchableOpacity>
                                    }
                                    isVisible={showPopOver}
                                    arrowSize={{ height: 0, width: 0 }}
                                    placement={"top"}
                                    backgroundStyle={{ borderRadius: 40, backgroundColor: Appcolor.white }}
                                    verticalOffset={50}
                                >
                                    <>
                                        <EmojiBlock />
                                    </>
                                </Popover>
                                <Pressable style={{ backgroundColor: Appcolor.primary, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderTopRightRadius: 0, borderBottomRightRadius: 0, maxWidth: widthPercentageToDP(80) }}
                                    onLongPress={onLongPress}>
                                    {item?.repliedTo && _repliedmessage()}
                                    <Text style={{ fontFamily: Appfonts.regular, fontSize: 12, color: 'black' }}>{item?.text}</Text>
                                </Pressable>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 2, alignItems: 'center' }}>
                                <Text style={{ fontFamily: Appfonts.semiBoldItalic, fontSize: 8.6, color: Appcolor.txt, textAlign: "right", marginRight: 4 }}>{moment(item?.createdAt).format('hh:mm A')}</Text>
                            </View>
                            {item?.reactions?.length && <View style={{ position: 'absolute', backgroundColor: Appcolor.txt, borderRadius: 12, padding: 4, bottom: 0, right: 50 }}>
                                {_renderReactions()}
                            </View>}
                        </View>
                    </SwipeRow>
                    :
                    <SwipeRow swipeGestureBegan={onSwipe} directionalDistanceChangeThreshold={24}>
                        <View />
                        <Pressable style={{ flexDirection: 'row', marginBottom: 12 }} >
                            <View style={{ maxWidth: '80%', minWidth: widthPercentageToDP(20) }}>
                                <View style={{ backgroundColor: "#f6edd5", minWidth: "20%", paddingHorizontal: 20, paddingVertical: 16, borderRadius: 20, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    {item?.repliedTo && _repliedmessage()}
                                    <Text style={{ fontFamily: Appfonts.regular, fontSize: 12, color: 'black' }}>{item?.text}</Text>
                                </View>
                                <Text style={{ fontFamily: Appfonts.semiBoldItalic, fontSize: 8.6, color: Appcolor.txt, textAlign: "left", marginTop: 2, marginLeft: 16 }}>{moment(item?.createdAt).format('hh:mm A')}</Text>
                            </View>
                            <Popover
                                onRequestClose={() => setShowPopOver(false)}
                                from={
                                    <TouchableOpacity
                                        style={{ padding: 8, maxHeight: 30 }}
                                        onPress={() => {
                                            setShowPopOver(true)
                                        }}
                                    >
                                        <FastImage source={Appimg?.emoji} style={styles.emoji} />
                                    </TouchableOpacity>
                                }
                                isVisible={showPopOver}
                                arrowSize={{ height: 0, width: 0 }}
                                placement={"top"}
                                backgroundStyle={{ borderRadius: 40, backgroundColor: Appcolor.white }}
                                verticalOffset={50}
                            >
                                <>
                                    <EmojiBlock />
                                </>
                            </Popover>
                            {item?.reactions?.length && <View style={{ position: 'absolute', backgroundColor: Appcolor.txt, borderRadius: 12, padding: 4, bottom: 0, left: 58 }}>
                                {_renderReactions()}
                            </View>}
                        </Pressable>
                    </SwipeRow>
                }
            </>
        )
    }
}

const styles = StyleSheet.create({
    Call: {
        height: 42,
        width: 42,
        alignSelf: "center",
        resizeMode: "contain",
    },
    share: {
        height: 40,
        width: 40,
        alignSelf: "center",
        resizeMode: "contain",
    },
    attachment: {
        height: 40,
        width: 40,
        alignSelf: "center",
        resizeMode: "contain",
    },
    overlay: {
        height: 160, width: 160, borderRadius: 4, backgroundColor: 'rgba(198, 148, 33, 0.7)', position: 'absolute', zIndex: 1, justifyContent: 'center', alignItems: 'center'
    },
    overlayImg: {
        height: 50, width: 50, resizeMode: 'contain'
    },
    emoji: {
        height: 16, width: 16
    },
    emote: {
        height: 20, width: 20, marginHorizontal: 8
    },
    upperBubble: {
        height: 20, width: 20, borderRadius: 10
        // , left: 200
    },
    lowerBubble: {
        height: 10, width: 10, borderRadius: 10
        // , left: 200
    }
})

const ChatInput = ({ value, onChangeText, onSendPress, onAttachPress, editMode, onPressCancel, hideAttachment }) => {
    const { Appcolor } = useTheme()
    return (
        <View style={{ height: heightPercentageToDP(8), width: widthPercentageToDP(100), backgroundColor: Appcolor.white, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: "row" }}>
            <TextInput value={value} onChangeText={onChangeText} multiline={true} style={{ width: widthPercentageToDP(60), height: "90%", paddingTop: 20, paddingLeft: 10, color: Appcolor.txt }} placeholderTextColor={Appcolor.txt} placeholder='Message...'></TextInput>
            <View style={{ height: heightPercentageToDP(5), width: widthPercentageToDP(30), flexDirection: "row", justifyContent: "space-around" }}>
                {
                    hideAttachment ?
                        // true ?
                        <View style={styles.attachment} />
                        :
                        !editMode && <Pressable onPress={onAttachPress}>
                            <Image source={Appimg.attachment} style={styles.attachment} />
                        </Pressable>
                }
                <Pressable onPress={onSendPress}>
                    <Image source={Appimg.share} style={styles.share} />
                </Pressable>
                {editMode &&
                    <Pressable onPress={onPressCancel}>
                        <Image source={Appimg.cancel} style={styles.attachment} />
                    </Pressable>
                }
            </View>
        </View>
    )
}

export { ChatView, ChatInput }