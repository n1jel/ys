import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import en from '../../translation'
import Btn from '../../components/Btn'
import CameraModal from '../../components/CameraModal'
import ImagePicker from 'react-native-image-crop-picker';
import { register } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../redux/load'
import { useTheme } from '@react-navigation/native'

const AddProfile = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const info = route?.params
    const [img1, setImg] = useState(null);
    const [showCameraModal, setShowCameraModal] = useState(false)

    const fromCamera = () => {
        ImagePicker.openCamera({
            mediaType: "photo",
            cropping: true,
            cropperCircleOverlay: true
        }).then((image) => {
            setImg(image);
        }).catch((error) => {
            console.log(error)
        });
    };
    const fromGallery = () => {
        ImagePicker.openPicker({
            mediaType: "photo",
            cropping: true,
            cropperCircleOverlay: true
        }).then((image) => {
            setImg(image);
        }).catch((error) => {
            console.log(error)
        });
    };
    const submitskip = async () => {
        let formdata = new FormData()
        formdata.append("full_name", info?.fullname)
        formdata.append("email", info?.email)
        formdata.append("country_code", info?.countryCode)
        formdata.append("phone_number", info?.phone_number)
        formdata.append("password", info?.password)
        try {
            dispatch(setLoading(true))
            let res = await register(formdata)
            if (res?.data?.status) {
                showToast(res?.data?.message || "Account created sucessfully.");
                navigation.navigate("LoginC")
            } else {
                showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const submit = async () => {
        if (img1 == null) {
            showToast("No image is selected.")
            return
        }
        let formdata = new FormData()
        formdata.append("profile_pic", {
            name: Date.now() + "." + img1?.mime?.split("/")[1],
            type: img1.mime,
            uri: img1.path
        })
        formdata.append("full_name", info?.fullname)
        formdata.append("email", info?.email)
        formdata.append("country_code", info?.countryCode)
        formdata.append("phone_number", info?.phone_number)
        formdata.append("password", info?.password)
        try {
            dispatch(setLoading(true))
            let res = await register(formdata)
            if (res?.data?.status) {
                showToast(res?.data?.message || "Account created sucessfully.");
                navigation.navigate("LoginC")
            } else {
                showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor?.white }}>
            <CameraModal visible={showCameraModal} onPressCancel={() => setShowCameraModal(false)}
                hideVideoOption={true}
                onPressCamera={() => {
                    setShowCameraModal(false)
                    setTimeout(() => {
                        fromCamera()
                    }, 200);
                }}
                onPressGallery={() => {
                    setShowCameraModal(false)
                    setTimeout(() => {
                        fromGallery()
                    }, 200);
                }}
            />
            <ImageBackground source={Appimg?.darkbg} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Image source={Appimg?.logo} style={{ height: 100, width: 90, marginHorizontal: 18, marginTop: 12 }} resizeMode='contain' />
                    <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20, color: Appcolor.txt }]}>{en?.addprofilepicture}</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginHorizontal: 18, marginTop: 8, width: "76%", lineHeight: 20, color: Appcolor.txt }]}>{en?.addprofilepicture1}</Text>
                    <Pressable style={{ alignSelf: "center", borderRadius: 100, marginTop: 32 }}
                        onPress={() => { setShowCameraModal(true) }}
                    >
                        <Image
                            source={img1 == null ? Appimg.img : { uri: img1?.path }}
                            style={{ height: 130, width: 130, borderRadius: 100, alignSelf: "center" }} />
                    </Pressable>
                    <Text style={[Commonstyles(Appcolor)?.mediumText14, { marginTop: 8, textAlign: "center", color: Appcolor.txt }]}>{en?.addprofilepicture}</Text>
                    <Btn title={en?.signup} transparent={Appcolor.blackop} twhite styleMain={{ alignSelf: "center", marginTop: 200 }} onPress={() =>
                        submit()
                    }
                    />
                    <Text style={[Commonstyles(Appcolor)?.mediumText12, { marginTop: 16, textAlign: "center", color: Appcolor.txt }]}
                        onPress={() =>
                            submitskip()
                        }
                    >{en?.skipfornow}</Text>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default AddProfile

const styles = StyleSheet.create({})