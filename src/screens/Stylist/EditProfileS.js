import { Image, ImageBackground, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import FastImage from 'react-native-fast-image'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import UpdateModal from '../../components/UpdateModal'
import CameraModal from '../../components/CameraModal'
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch, useSelector } from 'react-redux'
import { CountryPicker } from 'react-native-country-codes-picker'
import Appfonts from '../../constants/Appfonts'
import { fileUrl } from '../../apimanager/httpmanager'
import { setLoading } from '../../redux/load'
import { editProfileStylist } from '../../apimanager/httpServices'
import { setUser } from '../../redux/auth'
import showToast from '../../CustomToast'
import { useTheme } from '@react-navigation/native'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import AppUtils from '../../utils/apputils'


const EditProfileS = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const user = useSelector((state) => state?.auth?.user);
    let theme = useSelector(state => state.theme?.theme)

    const [updatedModal, setUpdatedModal] = useState(false)
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [profilepic, setProfilepic] = useState("")
    const [newPic, setNewPic] = useState(null)
    const [countryCode, setCountryCode] = useState("")
    const [showCountryModal, setShowCountryModal] = useState(false)

    useEffect(() => {
        if (user?.full_name) {
            setFullname(user?.full_name)
        }
        if (user?.email) {
            setEmail(user?.email)
        }
        if (user?.phone_number) {
            setPhone(user?.phone_number)
        }
        if (user?.profile_pic) {
            setProfilepic(user?.profile_pic)
        }
        if (user?.country_code) {
            setCountryCode(user?.country_code)
        }
    }, [user])

    const fromCamera = async () => {
        let cameraPerm = await AppUtils.cameraPermisssion()
        if (!cameraPerm) {
            Linking.openSettings()
        }
        ImagePicker.openCamera({
            mediaType: "photo",
            cropping: true,
            cropperCircleOverlay: true
        }).then((image) => {
            setNewPic(image)
        }).catch((error) => {
            console.log(error)
        });
    };
    const fromGallery = async () => {
        let galleryPerm = await AppUtils.galleryPermisssion()
        if (!galleryPerm) {
            Linking.openSettings()
        }
        ImagePicker.openPicker({
            mediaType: "photo",
            cropping: true,
            cropperCircleOverlay: true
        }).then((image) => {
            setNewPic(image)
        }).catch((error) => {
            console.log(error)
        });
    };
    const updateProfile = async () => {
        try {
            dispatch(setLoading(true))
            let formdata = new FormData()
            newPic != null && formdata.append("profile_pic", {
                name: Date.now() + "." + newPic?.mime?.split("/")[1],
                type: newPic.mime,
                uri: newPic.path
            })
            formdata.append("full_name", fullname)
            formdata.append("email", email)
            formdata.append("country_code", countryCode)
            formdata.append("phone_number", phone)

            let res = await editProfileStylist(formdata)
            console.log(JSON.stringify(res));
            if (res?.data?.status) {

                dispatch(setUser({ user: res?.data?.data }))
                setTimeout(() => {
                    setUpdatedModal(true)
                }, 200);
            } else {
                showToast(res?.data?.message ?? "Network error")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header title={en?.editProfile} showBack={true} onBackPress={() => navigation.goBack()} />
            <CameraModal visible={showCameraModal} onPressCancel={() => setShowCameraModal(false)}
                txt={"Add Profile"}
                hideVideoOption={true}
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
            <UpdateModal vis={updatedModal}
                onPressDone={() => { setUpdatedModal(false); navigation.goBack() }}
            />
            <CountryPicker
                show={showCountryModal}
                pickerButtonOnPress={(item) => {
                    setCountryCode(item.dial_code);
                    setShowCountryModal(false);
                }}
                onBackdropPress={() => { setShowCountryModal(false) }}
                style={{
                    textInput: {
                        height: 40,
                        borderRadius: 0,
                    },
                    modal: {
                        height: Platform?.OS == "android" ? heightPercentageToDP(40) : heightPercentageToDP(80),
                    },
                    dialCode: {
                        color: Appcolor.blackcolor
                    },
                    countryName: {
                        color: Appcolor.blackcolor
                    }
                }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={{ marginTop: 16 }}>
                    <Pressable style={{ alignSelf: "center" }} onPress={() => {
                        setShowCameraModal(true)
                    }}>
                        <FastImage source={newPic != null ? { uri: newPic?.path } : profilepic ? { uri: fileUrl + profilepic } : Appimg.avatar} style={{ height: 100, width: 100, borderRadius: 100, borderWidth: 0.6, borderColor: Appcolor.primary }} />
                        <FastImage source={Appimg.edit} style={{ height: 22, width: 22, position: "absolute", right: 6 }} />
                    </Pressable>
                    <Text onPress={() => { setShowCameraModal(true) }}
                        style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, textAlign: "center", marginTop: 8, color: Appcolor.primary }]}>{en?.changepicture}</Text>
                </View>
                <Text style={[Commonstyles(Appcolor).bold20, { margin: 18, fontSize: 18 }]}>{en?.accountinformation}</Text>
                <Tinput place={en?.fullname} img={Appimg.user}
                    value={fullname}
                    onChangeText={t => setFullname(t)}
                />
                <Tinput place={en?.email} img={Appimg.mail} styleMain={{ marginTop: 16 }}
                    value={email}
                    onChangeText={t => setEmail(t)}
                    editable={false}
                />
                <Text style={{ color: Appcolor.txt, fontSize: 10, fontFamily: Appfonts.medium, marginTop: 16, marginLeft: 18 }}>{en?.phonenumber}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, marginTop: 10, marginHorizontal: 18 }} >
                    <TouchableOpacity
                        onPress={() => { setShowCountryModal(true) }}
                        style={{ width: '16%', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.grad1, backgroundColor: Appcolor.white, }}
                    >
                        <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                            {countryCode}
                        </Text>
                    </TouchableOpacity>
                    <View style={{
                        height: 48, width: "80%", borderColor: Appcolor.grad1, borderRadius: 4, borderWidth: 0.8,
                        color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium, flexDirection: "row",
                        paddingLeft: 8, justifyContent: "center", alignItems: "center", backgroundColor: Appcolor.white,
                    }}>
                        <TextInput
                            place={en?.phonenumber}
                            placeholderTextColor={Appcolor.txt}
                            value={phone}
                            onChangeText={t => setPhone(t)}
                            keyboardType={"numeric"}
                            maxLength={10}
                            style={{
                                height: 48, width: "90%", color: Appcolor.txt, fontSize: 14, paddingLeft: 8, fontFamily: Appfonts.medium
                            }}
                            autoCapitalize={"none"}
                        >
                        </TextInput>
                        <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                    </View>
                </View>
                <Btn transparent={Appcolor.primary} title={en?.update} twhite styleMain={{ alignSelf: "center", marginTop: 46 }}
                    onPress={() => {
                        updateProfile()
                    }}
                />
                <Btn title={en?.changepassword} transparent={Appcolor.primary} twhite styleMain={{ alignSelf: "center", marginTop: 20 }}
                    onPress={() => navigation.navigate("ChangePasswordS")}
                />
            </ScrollView>
        </ImageBackground>
    )
}

export default EditProfileS

const styles = StyleSheet.create({})