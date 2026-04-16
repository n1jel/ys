import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import LinearGradient from 'react-native-linear-gradient'
import BellIcon from './Bell'
import Appfonts from '../constants/Appfonts'
import Appimg from '../constants/Appimg'
import DeleteBlock from './DeleteBlock'

const Header = ({ showCloset, showUser, showBack, isHome, showNoti, title, name, containerStyle, onBackPress, onBellPress, onPressProfile, shownotes, onNotespress, plusimage, onAddPress, showDelete, onPressDelete, showPin, onPressPin, showSelectionBox, onPressSelectionBox, onHangerPress, camera, onPressCamera, done, onPressDone }) => {
    return (
        <LinearGradient colors={isHome ? [Appcolor.txt, Appcolor.txt] : [Appcolor.grad1, Appcolor.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.headerContainer, containerStyle]}>
            {showUser &&
                <Pressable onPress={onPressProfile}>
                    <Text style={[{ fontFamily: Appfonts.semiBold, fontSize: 20, color: Appcolor.prim }]}>YOUR SEASON</Text>
                </Pressable>
            }
            <View style={{ flexDirection: "row" }}>
                {showCloset &&
                    <Pressable onPress={onHangerPress} style={{ marginRight: 12 }}>
                        <Image source={require("../assets/hanger.png")} style={{ height: 19, width: 22, resizeMode: "contain", }} />
                    </Pressable>
                }
                {shownotes &&
                    <Pressable onPress={onNotespress} style={{ marginRight: 12 }}>
                        <Image source={require("../assets/notesGold.png")} style={{ height: 19, width: 19, resizeMode: "contain", }} />
                    </Pressable>
                }
                {showNoti && <Pressable onPress={onBellPress}><BellIcon /></Pressable>}
            </View>
            {Boolean(title) &&
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ width: camera ? 70 : 50 }}>
                        {showBack &&
                            <Pressable onPress={() => {
                                if (onBackPress) {
                                    onBackPress()
                                }
                            }}>
                                <Image source={Appimg.backwh} style={{ height: 20, width: 20 }} />
                            </Pressable>
                        }
                    </View>
                    <Text numberOfLines={1} style={[{ flex: 1 }, styles.headerText]}>{title}<Text maxFontSizeMultiplier={1} numberOfLines={1} style={[{ width: 100, textTransform: "capitalize" }, styles.headerText]}>{name ? ` - ${name}` : ""}</Text></Text>
                    {camera ?
                        <View style={{ flexDirection: "row" }}>
                            <Pressable onPress={onPressDone} style={{ alignSelf: "flex-end", marginRight: 8 }}>
                                <Text style={{ fontFamily: Appfonts.semiBold, fontSize: 12, color: Appcolor.txt }}>Done</Text>
                            </Pressable>
                            <Pressable onPress={onPressCamera} style={{ alignSelf: "flex-end" }}>
                                <Image source={Appimg.cam} style={{ height: 20, width: 20, resizeMode: "contain", }} />
                            </Pressable>
                        </View>
                        :
                        <View style={{ width: 50 }}>
                            {plusimage &&
                                <Pressable onPress={onAddPress} style={{ position: 'absolute', right: 0, top: -10 }}>
                                    <Image source={require("../assets/add1.png")} style={{ height: 19, width: 19, resizeMode: "contain", }} />
                                </Pressable>
                            }
                            {showDelete && <DeleteBlock onPress={onPressDelete} styleMain={{ alignSelf: "flex-end" }} />}
                            {showPin &&
                                <Pressable onPress={onPressPin} style={{ borderRadius: 16, backgroundColor: Appcolor.white, alignSelf: "flex-end", padding: 4 }}>
                                    <Image source={Appimg.pin} style={{ height: 16, width: 16, resizeMode: "contain", }} />
                                </Pressable>
                            }
                            {showSelectionBox && <Pressable onPress={onPressSelectionBox} style={{ height: 20, width: 20, borderRadius: 20, borderColor: Appcolor.white, borderWidth: 1, alignSelf: "flex-end" }}></Pressable>}

                            {/* {done ? <Pressable onPress={onPressDone} style={{ alignSelf: "flex-end" }}>
                            <Text style={{ fontFamily: Appfonts.semiBold, fontSize: 14, color: Appcolor.txt }}>Done</Text>
                        </Pressable>
                            :
                            camera ?
                                <Pressable onPress={onPressCamera} style={{ alignSelf: "flex-end" }}>
                                    <Image source={Appimg.cam} style={{ height: 20, width: 20, resizeMode: "contain", }} />
                                </Pressable>
                                : <></>
                        } */}
                        </View>}
                </View>
            }
        </LinearGradient>
    )
}

export default Header

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Appcolor.primary,
        shadowColor: "#2626260D",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
        height: 48, width: "100%",
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16
    },
    headerText: {
        fontFamily: Appfonts.medium,
        color: Appcolor.txt,
        textAlign: "center",
        fontSize: 18
    }
})