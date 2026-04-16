import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../components/Header'
import Appimg from '../../constants/Appimg'
import { useTheme } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { fileUrl } from '../../apimanager/httpmanager'
import { uploadCloset } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/load'
import VideoThumb from '../../components/VideoThumb'

const UploadScreen = ({ navigation, route }) => {
    const { Appcolor } = useTheme()
    const styles = useStyles(Appcolor)
    const dispatch = useDispatch()
    const [imageList, setImageList] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [caption, setCaption] = useState("")

    useEffect(() => {
        if (route?.params?.images) {
            setSelectedItem(route?.params?.images[0])
            setImageList(route?.params?.images?.map(x => ({ ...x, caption: "" })))
            // setSelectedItem({ url: route?.params?.images[0] })
            // setImageList(route?.params?.images?.map(x => ({ url: x, caption: "" })))
        }
    }, [route?.params?.images])
    useEffect(() => {
        if (selectedItem?.caption) {
            setCaption(selectedItem?.caption)
        } else {
            setCaption("")
        }
    }, [selectedItem])

    const updateCaption = useCallback((caption) => {
        setCaption(caption)
        let temp = [...imageList]
        let data = { ...temp[selectedIndex], caption }
        temp.splice(selectedIndex, 1, data)
        setImageList(temp)
    }, [imageList, selectedIndex])
    function processObjects(objectsArray) {
        objectsArray.forEach(obj => {
            if (obj.hasOwnProperty("caption") && obj.caption === "") {
                delete obj.caption;
            }
            // obj.media_type = "image";
        });
        return objectsArray;
    }
    //MARK: Capition required
    const captionValidate = () => {
        try {
            // let noCap = false
            // imageList?.forEach(e => {
            //     if (e?.caption?.trim() == "") {
            //         noCap = true
            //     }
            // })
            // if (noCap) {
            //     showToast("Caption required")
            //     return
            // }
            submit()
        } catch (e) {
            console.error(e);
        }
    }
    const submit = async () => {
        try {
            dispatch(setLoading(true))
            let closetArray = processObjects(imageList)
            let res = await uploadCloset({ closetArray })
            if (res?.data?.status) {
                showToast(res?.data?.message)
                navigation?.goBack()
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={Appimg.darkbg1} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header
                showBack={true}
                title={"My Closet"}
                onBackPress={() => {
                    navigation.goBack()
                }}
            />
            <KeyboardAwareScrollView extraScrollHeight={40}>
                <View style={{ width: "92%", alignSelf: "center", marginTop: 18 }}>
                    {selectedItem ?
                        <View style={{ height: heightPercentageToDP(40), width: "100%", borderRadius: 8, backgroundColor: Appcolor.modal, justifyContent: "center", alignItems: "center" }}>
                            {selectedItem?.media_type == "video" && <Image source={Appimg.play} style={{ height: 38, width: 38, position: "absolute", zIndex: 10 }} />}
                            {selectedItem?.media_type == "video" ?
                                <VideoThumb source={selectedItem?.url} styleMain={{ height: "100%", width: "100%", borderRadius: 8 }} />
                                :
                                <FastImage
                                    source={{ uri: fileUrl + selectedItem?.url }}
                                    style={{ height: "100%", width: "100%", borderRadius: 8 }}
                                    resizeMode='contain'
                                />
                            }
                        </View>
                        :
                        <View style={{ height: heightPercentageToDP(40), backgroundColor: Appcolor.modal }} />
                    }
                    <FlatList
                        data={imageList}
                        horizontal
                        contentContainerStyle={{ marginTop: 18 }}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                            return (
                                <Pressable onPress={() => { setSelectedItem(item); setSelectedIndex(index) }}>
                                    {
                                        item?.media_type == "video" ?
                                            <VideoThumb source={item?.url} styleMain={{ height: 50, width: 50, marginRight: 10, borderRadius: 4, borderWidth: 2, borderColor: selectedItem?.url == item?.url ? Appcolor.yellow : Appcolor.white }} />
                                            :
                                            <FastImage source={{ uri: fileUrl + item?.url }} style={{ height: 50, width: 50, marginRight: 10, borderRadius: 4, borderWidth: 2, borderColor: selectedItem?.url == item?.url ? Appcolor.yellow : Appcolor.white }} />
                                    }
                                </Pressable>
                            )
                        }}
                    />
                    <Tinput
                        placespecific={"Write a caption"}
                        placeCol={Appcolor.grey}
                        styleMain={{ width: "100%", marginHorizontal: 0, }}
                        styleInput={{ backgroundColor: Appcolor.modal }}
                        value={caption}
                        onChangeText={(t) => { updateCaption(t) }}
                    />
                    <Btn
                        twhite
                        title={"Save"}
                        styleMain={{ alignSelf: "center", marginTop: 30, width: "40%", borderRadius: 4 }}
                        onPress={() => { captionValidate() }}
                    />
                </View>
            </KeyboardAwareScrollView>
        </ImageBackground>
    )
}

export default UploadScreen

const useStyles = (Appcolor) => StyleSheet.create({})