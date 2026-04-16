import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import Commonstyles from '../../constants/Commonstyles'
import en from '../../translation'
import Btn from '../../components/Btn'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import CameraModal from '../../components/CameraModal'
import ImagePicker from 'react-native-image-crop-picker';
import { setLoading } from '../../redux/load'
import { useDispatch } from 'react-redux'
import { useTheme } from '@react-navigation/native'
import showToast from '../../CustomToast'
import { registerBrand } from '../../apimanager/brandServices'
import RNFetchBlob from 'rn-fetch-blob'

const AddProfileB = ({ navigation, route }) => {
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
    const submit = async (type) => {
        const { fullname, email, phone_number, countryCode, password, country } = info
        let obj = [
            { name: "full_name", data: fullname },
            { name: "email", data: email },
            { name: "phone_number", data: phone_number },
            { name: "country_code", data: countryCode },
            { name: "password", data: password },
            { name: "country", data: country },
            { name: "state", data: info?.state ?? "" },
            { name: "city", data: info?.city ?? "" },
        ];
        if (type == 1) {
            if (img1 == null) {
                showToast("No image selected.")
                return
            }
            let finalPath = RNFetchBlob.wrap(img1?.path);
            let temp = {
                filename: img1.filename == null ? Date.now() + "uff.jpg" : img1.filename,
                type: img1.mime,
                data: finalPath,
                name: "profile_pic",
            };
            obj.push(temp);
        }
        try {
            dispatch(setLoading(true))
            let resp = await registerBrand(obj)
            let res = JSON.parse(resp?.data);
            if (res?.status) {
                showToast(res?.message || "Account created sucessfully.");
                navigation.navigate("LoginB");
            } else {
                showToast(res?.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor?.white }}>
            <ImageBackground source={Appimg?.darkbg} style={{ flex: 1 }}>
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Image source={Appimg?.logo} style={{ height: 100, width: 90, marginHorizontal: 18, marginTop: 12 }} resizeMode='contain' />
                    <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20, color: Appcolor.txt }]}>{en?.addprofilepicture}</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginHorizontal: 18, marginTop: 8, width: "76%", lineHeight: 20, color: Appcolor.txt }]}>{en?.addprofilepicture1}</Text>
                    <Pressable onPress={() => { setShowCameraModal(true) }}
                        style={{ alignSelf: "center", borderRadius: 100, marginTop: 32 }}>
                        <Image source={img1 == null ? Appimg.img : { uri: img1?.path }} style={{ height: 130, width: 130, borderRadius: 100, alignSelf: "center" }} />
                    </Pressable>
                    <Text style={[Commonstyles(Appcolor)?.mediumText14, { marginTop: 8, textAlign: "center", color: Appcolor.txt }]}>{en?.addprofilepicture}</Text>
                    <Btn title={en?.signup} styleMain={{ alignSelf: "center", marginTop: 200 }}
                        transparent={Appcolor.blackop} twhite
                        onPress={() => submit(1)}
                    />
                    <Text style={[Commonstyles(Appcolor)?.mediumText12, { marginTop: 16, textAlign: "center", color: Appcolor.txt }]}
                        onPress={() => { submit(2) }}
                    >
                        {en?.skipfornow}
                    </Text>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView >
    )
}

export default AddProfileB

const styles = StyleSheet.create({
    mainview: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modelcontain: {
        height: 184,
        width: widthPercentageToDP(86),
        backgroundColor: Appcolor.white,
        borderRadius: widthPercentageToDP(3.3),
        paddingVertical: heightPercentageToDP(0.8),
    },
    cameracontainer: {
        height: 60,
        width: 60,
        backgroundColor: Appcolor.lightgray,
        borderRadius: widthPercentageToDP(10),
        borderWidth: 1.5,
        borderColor: Appcolor.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    camerapic: { height: 56, width: 56, resizeMode: "contain" },
}
)