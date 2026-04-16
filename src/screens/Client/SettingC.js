import { Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import LinearGradient from 'react-native-linear-gradient';
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import Btn from '../../components/Btn'
import Header from '../../components/Header';
import CustomSwitch from '../../components/CustomSwitch';
import LogoutModal from '../../components/LogoutModal';
import { useDispatch, useSelector } from 'react-redux';
import { authorize, signout } from '../../redux/auth';
import { clearAll, storeData } from '../../utils/asyncstore';
import { setTheme } from '../../redux/Theme';
import { useTheme } from '@react-navigation/native';
import { LogoutClient, UpdateNotClient } from '../../apimanager/httpServices';
import { setLoading } from '../../redux/load';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnreadChats } from '../../redux/ChatCount'

const SettingC = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    let theme = useSelector(state => state.theme?.theme)
    const user = useSelector((state) => state?.auth?.user);
    const fcmtoken = useSelector(state => state.CommanReducer?.fcmtoken)

    const [biometric, setbiometric] = useState(false)
    const [logoutMod, setLogoutMod] = useState(false)
    const [list, setList] = useState([
        { title: 'Profile', onPress: () => navigation.navigate("ProfileC") },
        { title: 'Change Password', onPress: () => navigation.navigate("ChangePasswordC") },
        { title: 'Contact Us', onPress: () => navigation.navigate("ContactusC") },
        { title: 'Notification' },
        Platform.OS == "ios" ? { title: 'Biometrics' } : {},
        // { title: 'Dark Theme' },
        { title: 'My Measurement', onPress: () => navigation.navigate("MeasurementC") },

    ])
    const [list2, setList2] = useState([
        { title: "Terms & Services", onPress: () => navigation.navigate("TermsC", { from: "terms" }) },
        { title: 'Privacy Policy', onPress: () => navigation.navigate("TermsC", { from: "privacy" }) },
        { title: 'Delete Account', onPress: () => { navigation.navigate("DeleteAccountC") } },
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
            let res = await UpdateNotClient({ 'notification_status': user?.notification_status == '0' && user?.notification_status != undefined ? 1 : '0', 'fcm_token': user?.notification_status == '0' && user?.notification_status != undefined ? fcmtoken : '' });
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

    return (
        <View style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <LogoutModal vis={logoutMod}
                onPressYes={async () => {
                    try {
                        let res = await LogoutClient();
                        if (res?.data?.status) {
                            setLogoutMod(false)
                            dispatch(signout())
                            AsyncStorage.removeItem("@tokens")
                            dispatch(setUnreadChats(0))
                            setTimeout(() => {
                                navigation.replace("Loginas")
                            }, 100);
                        } else {
                            showToast(res?.data?.message);
                        }
                    } catch (e) {
                    } finally {
                        dispatch(setLoading(false))
                    }
                }}
                onPressNo={() => {
                    setLogoutMod(false)
                }}
                onPressOut={() => {
                    setLogoutMod(false)
                }}
            />
            <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} style={{ flex: 1 }}>
                <Header title={en?.settings} />
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    <Pressable onPress={() => { navigation.navigate('ClientNotes') }} style={{ borderRadius: 10, marginTop: 20, height: 90, marginHorizontal: 16, paddingHorizontal: 15, backgroundColor: theme == 'dark' ? "#22222280" : "#FEFBF4", flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", marginBottom: 4 }}>
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
                                <_renderList
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
                                    }
                                    }
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
                            <_renderList theme={theme} i={i} j={j} key={j} />
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

export default SettingC

const styles = StyleSheet.create({})

const _renderList = ({ i, j, onPressSwitch, notSource, darksource, theme, onNotClick, onbiometricPress, biometric }) => {
    return (
        <Pressable
            style={{ height: 48, marginHorizontal: 16, paddingHorizontal: 8, backgroundColor: theme == 'dark' ? "#22222280" : "#FEFBF4", flexDirection: 'row', justifyContent: 'space-between', alignItems: "center", marginBottom: 4 }}
            onPress={i?.onPress}
        >
            <Text style={[Commonstyles(Appcolor).mediumText14, { color: theme == 'dark' ? Appcolor.white : Appcolor.txt }]}>{i?.title}</Text>
            {i?.title == "Notification" ?
                <CustomSwitch onPress={onNotClick} source={notSource} /> : i?.title == "Biometrics" ?
                    <CustomSwitch source={biometric} onPress={onbiometricPress} /> :
                    i?.title == "Dark Theme" ?
                        <CustomSwitch source={darksource} onPress={onPressSwitch} />
                        :
                        <Image source={Appimg.arrowright} style={{ height: 14, width: 10, resizeMode: "contain", tintColor: Appcolor.yellowop }} />}
        </Pressable>
    )
}