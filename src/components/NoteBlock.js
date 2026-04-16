import { useTheme } from "@react-navigation/native"
import React, { useState } from "react"
import { Pressable, Text, View } from "react-native"
import Commonstyles from "../constants/Commonstyles"
import Appfonts from "../constants/Appfonts"
import FastImage from "react-native-fast-image"
import Popover from 'react-native-popover-view';
import moment from "moment"
import Appimg from "../constants/Appimg"

export const NoteBlock = ({ item, index, onPressNote, onPressEdit, onPressDelete, isDeleted = false, onPermanentlyDelete, onRestore }) => {
    const { Appcolor } = useTheme()
    const [showPopOver, setShowPopOver] = useState(false)
    return (
        <Pressable style={[Commonstyles(Appcolor).shadow, { padding: 15, backgroundColor: Appcolor.white, width: '95%', alignSelf: 'center', justifyContent: 'center', marginVertical: index == 0 ? 5 : 5, borderRadius: 10, borderBottomWidth: 1, borderColor: Appcolor.txt }]}
            onPress={onPressNote}
        >
            <Text style={{ fontSize: 16, color: Appcolor.txt, fontFamily: Appfonts.semiBold }}>{item.title}</Text>
            <Text style={[Commonstyles(Appcolor).mediumText12]}>{moment(item.updated_at).format('MM/DD/YYYY') + ', ' + moment(item.created_at).format('hh:mm A')}</Text>
            <Popover
                isVisible={showPopOver}
                onRequestClose={() => { setShowPopOver(false) }}
                from={
                    <Pressable style={{ position: 'absolute', right: 10, padding: 8 }}
                        onPress={() => {
                            setShowPopOver(true)
                        }}
                    >
                        <FastImage source={Appimg?.more} style={{ height: 20, width: 20 }} resizeMode='contain' />
                    </Pressable>
                }
            >
                <View style={{ backgroundColor: Appcolor.txt, minWidth: isDeleted ? 160 : 120 }}>
                    {!isDeleted ?
                        <>
                            <Pressable style={{ justifyContent: 'center', padding: 8, borderBottomWidth: 1, borderColor: Appcolor.white }}
                                onPress={() => {
                                    setShowPopOver(false)
                                    onPressEdit()
                                }}
                            >
                                <Text style={{ color: Appcolor.white, fontFamily: Appfonts.regular, fontSize: 14 }}>Edit</Text>
                            </Pressable>
                            <Pressable style={{ justifyContent: 'center', padding: 8, borderBottomWidth: 1, borderColor: Appcolor.white }}
                                onPress={() => {
                                    setShowPopOver(false)
                                    onPressDelete()
                                }}
                            >
                                <Text style={{ color: Appcolor.white, fontFamily: Appfonts.regular, fontSize: 14 }}>Delete</Text>
                            </Pressable>
                        </>
                        :
                        <>
                            <Pressable style={{ justifyContent: 'center', padding: 8, borderBottomWidth: 1, borderColor: Appcolor.white }}
                                onPress={() => {
                                    setShowPopOver(false)
                                    onRestore()
                                }}
                            >
                                <Text style={{ color: Appcolor.white, fontFamily: Appfonts.regular, fontSize: 14 }}>Restore</Text>
                            </Pressable>
                            <Pressable style={{ justifyContent: 'center', padding: 8, borderBottomWidth: 1, borderColor: Appcolor.white }}
                                onPress={() => {
                                    setShowPopOver(false)
                                    onPermanentlyDelete()
                                }}
                            >
                                <Text style={{ color: Appcolor.white, fontFamily: Appfonts.regular, fontSize: 14 }}>Permanently Delete</Text>
                            </Pressable>
                        </>
                    }
                </View>
            </Popover>
        </Pressable>
    )
}