import { Alert, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Appimg from '../../constants/Appimg'
import Btn from '../../components/Btn'
import Header from '../../components/Header';
import LogoutModal from '../../components/LogoutModal';
import { authorize, signout } from '../../redux/auth';
import { useDispatch, useSelector } from 'react-redux';
import { clearAll, storeData } from '../../utils/asyncstore';
import { useTheme } from '@react-navigation/native';
import { setTheme } from '../../redux/Theme';
import { LogoutStylist, UpdateNotStylist } from '../../apimanager/httpServices';
import showToast from '../../CustomToast';
import { setLoading } from '../../redux/load';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentBatch, setIsUploading, setProgress, setTotalBatchSize, setUploadTask } from '../../redux/uploadReducer';
import SettingsListRender from '../../components/SettingsListRender'
import { updateNotificationStatus } from '../../apimanager/brandServices'
import { setUnreadChats } from '../../redux/ChatCount'

const SettingB = ({ navigation }) => {
    const isUploading = useSelector(state => state?.uploadReducer?.isUploading)
    const theme = useSelector(state => state.theme?.theme)
    const user = useSelector((state) => state?.auth?.user);
    const fcmtoken = useSelector(state => state.CommanReducer?.fcmtoken)

    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const [biometric, setbiometric] = useState(false)
    const [logoutMod, setLogoutMod] = useState(false)
    const [list, setList] = useState([
        { title: 'Profile', onPress: () => navigation.navigate("ProfileB") },
        { title: 'Change Password', onPress: () => navigation.navigate("ChangePasswordB") },
        { title: 'Contact Us', onPress: () => navigation.navigate("ContactusB") },
        { title: 'Notification' },
        Platform.OS == "ios" ? { title: 'Biometrics' } : {},
        // { title: 'Confirmed Orders', onPress: () => { navigation.navigate("ConfirmedOrders") } },
        user?.is_added_by_brand == 1 ? null : { title: 'Add Employees', onPress: () => navigation.navigate("AddStylistsB") },
    ])
    const [list2, setList2] = useState([
        { title: "Terms & Services", onPress: () => navigation.navigate("TermsB", { from: "terms" }) },
        { title: 'Privacy Policy', onPress: () => navigation.navigate("TermsB", { from: "privacy" }) },
        { title: 'Delete Account', onPress: () => { navigation.navigate("DeleteAccountB") } },
    ])

    useEffect(() => {
        AsyncStorage.getItem('@faceId', (err, item) => {
            console.log(item, ":::::");

            if (item == "true") {

                setbiometric(true)
            } else if (JSON.parse(item) == "false") {

                setbiometric(false)
            } else {

                if (Platform.OS == "android") {
                    setbiometric(false)
                } else {
                    setbiometric(false)
                }

            }

        })
    }, [])

    async function on_click() {
        try {
            let res = await updateNotificationStatus({ 'notification_status': user?.notification_status == '0' && user?.notification_status != undefined ? 1 : '0', 'fcm_token': user?.notification_status == '0' && user?.notification_status != undefined ? fcmtoken : '' });
            console.log(res);
            if (res?.data?.status) {
                dispatch(authorize({ user: res?.data?.data }))
            } else {
                showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const logOut = async () => {
        try {
            // let res = await LogoutStylist();
            // console.log(res);
            dispatch(signout())
            dispatch(setUnreadChats(0))
            AsyncStorage.removeItem("@tokens")
            setTimeout(() => {
                navigation.replace("Loginas")
            }, 100);
        } catch (e) {
            console.error(e);
        } finally {
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1 }}>
                <LogoutModal vis={logoutMod}
                    onPressYes={async () => {
                        setLogoutMod(false)
                        if (isUploading) {
                            Alert.alert("Are you sure?", "Your uploads will be incomplete.",
                                [
                                    {
                                        text: 'Cancel',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // dispatch(setUploadTask({}))
                                            // dispatch(setIsUploading(false))
                                            // dispatch(setProgress(0))
                                            // dispatch(setCurrentBatch(0))
                                            // dispatch(setTotalBatchSize(0))
                                            logOut()
                                        }
                                    },
                                ]
                            )
                            return
                        }
                        logOut()
                    }}
                    onPressNo={() => {
                        setLogoutMod(false)
                    }}
                    onPressOut={() => {
                        setLogoutMod(false)
                    }}
                />
                <Header title={en?.settings} />
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    <Pressable onPress={() => { navigation.navigate('NotesB') }} style={{ borderRadius: 10, marginTop: 20, height: 90, marginHorizontal: 16, paddingHorizontal: 15, backgroundColor: theme == 'dark' ? "#22222280" : "#FEFBF4", flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", marginBottom: 4 }}>
                        <View>
                            <Image source={require('../../assets/notes.png')} style={{ height: 20, width: 20, tintColor: theme == 'dark' ? 'white' : Appcolor.txt }} ></Image>
                            <Text style={[Commonstyles(Appcolor).mediumText14, { color: theme == 'dark' ? 'white' : Appcolor.txt, marginTop: 10 }]}>My Notes</Text>
                        </View>
                        <Image source={Appimg.arrowright} style={{ height: 14, width: 10, resizeMode: "contain" }} />
                    </Pressable>
                    <Text style={[Commonstyles(Appcolor).bold20, { fontSize: 18, margin: 18 }]}>{en?.accountsettings}</Text>
                    {list?.map((i, j) => {
                        if (i?.title) {
                            return (
                                <SettingsListRender
                                    onbiometricPress={() => {
                                        if (biometric) {
                                            storeData("@faceId", JSON.stringify(false))
                                            setbiometric(false)
                                        } else {
                                            storeData("@faceId", true)
                                            setbiometric(true)
                                        }
                                    }}
                                    biometric={!biometric ? Appimg.switchoff : Appimg?.switchon}
                                    i={i} j={j} key={j}
                                    notSource={user?.notification_status == '0' ? Appimg.switchoff : Appimg?.switchon}
                                    theme={theme}
                                    darksource={theme == 'light' ? Appimg.switchoff : Appimg.switchon}
                                    onPressSwitch={() => {
                                        if (theme == 'light') {
                                            dispatch(setTheme('dark'))
                                        }
                                        else {
                                            dispatch(setTheme('light'))
                                        }
                                    }}
                                    onNotClick={() => {
                                        on_click()
                                    }}
                                />
                            )
                        }

                    })}
                    <Text style={[Commonstyles(Appcolor).bold20, { fontSize: 18, margin: 18 }]}>{en?.contactus}</Text>
                    {list2?.map((i, j) => {
                        return (
                            <SettingsListRender theme={theme} i={i} j={j} key={j} />
                        )
                    })}
                    <Btn title={"Logout"} transparent={Appcolor.blackop} twhite img={<Image source={Appimg.logout} style={{ height: 16, width: 16, marginRight: 6, tintColor: Appcolor.white }} />} styleMain={{ alignSelf: "center", marginVertical: 40 }}
                        onPress={() => {
                            setLogoutMod(true)
                        }}
                    />
                </ScrollView>
            </ImageBackground>
        </View>
    )
}

export default SettingB

const styles = StyleSheet.create({})