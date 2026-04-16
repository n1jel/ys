import { BackHandler, Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import en from '../../translation'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import Appfonts from '../../constants/Appfonts'
import showToast from '../../CustomToast'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { storeData } from '../../utils/asyncstore'
import { authorize, setbiometric } from '../../redux/auth'
import { useTheme } from '@react-navigation/native'
import { saveCreds } from '../../utils/utilities'
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage'
import LogRocket from '@logrocket/react-native'
import { signinBrand } from '../../apimanager/brandServices'
import SelectionTab from '../../components/SelectionTab'
import { loginStylist } from '../../apimanager/httpServices'

const LoginB = ({ navigation, route }) => {
    const { from } = route?.params
    const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true, });
    const dispatch = useDispatch();
    const { Appcolor } = useTheme();

    let biometric = useSelector(state => state?.auth?.biometric)
    const fcmtoken = useSelector(state => state.CommanReducer)?.fcmtoken
    const theme = useSelector(state => state.theme)?.theme
    const credList = useSelector(state => state?.creds?.credList)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [credSuggestions, setCredSuggestions] = useState([]);
    const [usertype, setusertype] = useState("")
    const [loginType, setLoginType] = useState(from)
    const [faceLoginCred, setfaceLoginCred] = useState({})
    const [isSupported, setisSupported] = useState(false)

    useEffect(() => {
        if (loginType == 'Stylist') {
            AsyncStorage.getItem('@faceLogin', (err, item) => {
                console.log(item, "S");
                if (JSON.parse(item)?.userType == "Stylist") {
                    setusertype('stylist')
                    setfaceLoginCred(JSON.parse(item))
                }
            })
        } else {
            AsyncStorage.getItem('@faceLoginBrand', (err, item) => {
                console.log(item, ">>>");
                if (JSON.parse(item)?.userType == 'brand') {
                    setusertype('brand')
                    setfaceLoginCred(JSON.parse(item))
                }
            })
        }
    }, [loginType])
    useEffect(() => {
        AsyncStorage.getItem('@faceId', (err, item) => {
            console.log(item, ":::::");
            if (item == "true") {
                dispatch(setbiometric("1"))
            } else if (JSON.parse(item) == "false") {
                dispatch(setbiometric("0"))
                setisSupported(false)
            } else {
                setisSupported(false)
                if (Platform.OS == "android") {
                    dispatch(setbiometric("1"))
                } else {
                    dispatch(setbiometric("0"))
                }
            }
        })
    }, [])
    useEffect(() => {
        if (Platform?.OS == "ios") {
            rnBiometrics
                .isSensorAvailable()
                .then(resultObject => {
                    const { available, biometryType } = resultObject;
                    if (
                        (available && biometryType === BiometryTypes.TouchID) ||
                        (available && biometryType === BiometryTypes.FaceID)
                    ) {
                        setisSupported(true)
                    }
                })
        }
    }, [rnBiometrics])
    useEffect(() => {
        if (email?.trim() == "") {
            setCredSuggestions([])
        }
        if (email && credList) {
            let temp = credList?.filter(x => (x?.email?.toLowerCase()?.includes(email?.toLowerCase()) && x?.type == loginType?.toLowerCase()))
            setCredSuggestions(temp)
        }
    }, [email, credList, loginType])

    const validateEmail = (mail) => {
        return String(mail).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    };
    async function onLoginClient() {
        if (email.length == 0) {
            showToast("Enter Email");
            return;
        }
        if (password.length == 0) {
            showToast("Please enter Password");
            return;
        }
        if (email?.includes('@')) {
            if (validateEmail(email)) {
                handle_Simple_Login(email, password);
            }
            else {
                showToast("enter valid email");
                return;
            }
        } else {
            handle_Simple_Login(email, password);
        }
    }
    const handle_Simple_Login = async (email, password) => {
        try {
            dispatch(setLoading(true))
            let res
            if (loginType == "Stylist") {
                res = await loginStylist(email?.toLocaleLowerCase(), password?.trim(), (fcmtoken || ""));
            } else {
                res = await signinBrand({ email: email?.toLocaleLowerCase(), password: password?.trim(), fcm_token: (fcmtoken || "") });
            }
            if (res?.data?.status) {
                LogRocket.identify(res?.data?.data._id)
                dispatch(authorize({ user: res?.data?.data }))
                storeData("@tokens", res?.data?.other?.token)
                if (loginType == "Stylist")
                    storeData("@faceLogin", { userType: "Stylist", email: email, password: password })
                else
                    storeData("@faceLoginBrand", { userType: "brand", email: email, password: password })
                showToast(res?.data?.message ?? "Login Successfully");
                dispatch(setLoading(false))
                setTimeout(() => {
                    if (from == "Stylist") {
                        if (loginType == "Stylist")
                            navigation.replace("NonAuthS");
                        else
                            navigation.replace("BrandStack", { screen: "NonAuthB" });
                    } else {
                        if (loginType == "Stylist")
                            navigation.replace('StylistStack', { screen: "NonAuthS" });
                        else
                            navigation.replace("NonAuthB");
                    }
                }, 100);
                saveCreds(email, password, loginType?.toLowerCase(), credList)
            } else {
                showToast(res?.data?.message ?? "Something went wrong.");
            }
        } catch (e) {
            console.log(e);
        } finally {
            dispatch(setLoading(false))
        }
    };
    async function iosbiomatric() {
        rnBiometrics
            .isSensorAvailable()
            .then(resultObject => {
                const { available, biometryType } = resultObject;

                if (
                    (available && biometryType === BiometryTypes.TouchID) ||
                    (available && biometryType === BiometryTypes.FaceID)
                ) {
                    rnBiometrics
                        .simplePrompt({ promptMessage: 'Confirm fingerprint' })
                        .then(resultObject => {
                            const { success } = resultObject;

                            if (success) {
                                handle_Simple_Login(faceLoginCred?.email, faceLoginCred?.password)
                                rnBiometrics.createKeys().then(resultObject => {
                                    const { publicKey } = resultObject;
                                    console.log(publicKey);
                                    // sendPublicKeyToServer(publicKey)
                                });
                                console.log('successful biometrics provided', success);
                            } else {

                                console.log('user cancelled biometric prompt');
                            }
                        })
                        .catch(() => {
                            // BackHandler.exitApp();
                            console.log('biometrics failed');
                        });
                    console.log('TouchID is supported');
                } else if (available && biometryType === BiometryTypes.FaceID) {
                    console.log('FaceID is supported');
                } else if (available && biometryType === BiometryTypes.Biometrics) {
                    console.log('Biometrics is supported');
                } else {
                    setplay(false);
                    setTimeout(() => {
                        item
                            ? navigation.replace('NonAuthStack')
                            : navigation.navigate('Welcome');
                    }, 9000);
                    console.log('Biometrics not supported');
                }
            })
            .catch(() => {
                BackHandler.exitApp();
            });
    }

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg} style={{ flex: 1 }}>
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                    <Pressable
                        onPress={() => {
                            if (from == "Stylist") {
                                navigation?.navigate("WelcomeS")
                            } else {
                                navigation?.navigate("WelcomeBrand")
                            }
                        }}
                        style={{ marginHorizontal: 16, marginVertical: 8 }}
                    >
                        <Image source={Appimg?.back} style={{ height: 26, width: 26, resizeMode: "contain" }} />
                    </Pressable>
                    <Image source={Appimg?.logo} style={{ height: 100, width: 90, marginHorizontal: 18, marginTop: 12 }} resizeMode='contain' />
                    <SelectionTab
                        showType={loginType}
                        setShowType={(t) => {
                            // navigation?.navigate("StylistStack", { screen: "LoginS" })
                            setLoginType(t)
                        }}
                    />
                    <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20 }]}>{en?.welcome} {loginType}!</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginTop: 8, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.logintxt}</Text>
                    <Tinput
                        onChangeText={(t) => setEmail(t)}
                        value={email}
                        place={en?.email} styleMain={{ marginTop: 32 }}
                        credSuggestions={credSuggestions}
                        credSelected={(data) => {
                            setEmail(data?.email)
                            setPassword(data?.password)
                            setTimeout(() => {
                                setCredSuggestions([])
                            }, 200);
                        }}
                    />
                    <Text style={[Commonstyles(Appcolor).regular12, { fontSize: 8, marginLeft: 20, marginTop: 4 }]}>{en?.easyemail}</Text>
                    <Tinput
                        onChangeText={(t) => setPassword(t)}
                        value={password}
                        place={en?.password} secure styleMain={{ marginTop: 16 }} />
                    <Text style={[Commonstyles(Appcolor).semiBoldIta10, { marginRight: 20, marginTop: 6, textAlign: "right", color: Appcolor.primary }]} onPress={() => {
                        setEmail('')
                        setPassword('')
                        // navigation.navigate("ForgotpassB")
                        if (from == "Stylist") {
                            if (loginType == "Stylist") {
                                navigation.navigate("ForgotpassS")
                            } else {
                                navigation.navigate("BrandStack", { screen: "ForgotpassB" });
                            }
                        } else {
                            if (loginType == "Stylist") {
                                navigation.navigate('StylistStack', { screen: "ForgotpassS" });
                            } else {
                                navigation.navigate("ForgotpassB")
                            }
                        }
                    }}>{en?.forgotpassword}?</Text>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                        <Btn
                            title={en?.login} transparent={Appcolor.blackop} twhite
                            styleMain={{
                                alignSelf: "center", marginTop: 70,
                                width: (isSupported && usertype == loginType?.toLowerCase() && biometric == "1") ? "70%" : "80%"
                            }}
                            onPress={() => { onLoginClient(email, password) }}
                        />
                        {(isSupported && usertype == loginType?.toLowerCase() && biometric == "1") && <Btn img={<Image source={Appimg?.faceid} style={{ height: 25, width: 25 }} resizeMode='contain' />} transparent={Appcolor.blackop} twhite styleMain={{ marginLeft: 10, marginTop: 70, width: "15%" }}
                            onPress={() => { iosbiomatric() }}
                        />}
                    </View>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginHorizontal: 18, marginTop: 8, textAlign: "center" }]}>{en?.noaccount}?<Text style={{ color: Appcolor.primary, fontFamily: Appfonts.bold, fontSize: 14 }}
                        onPress={() => {
                            setEmail('')
                            setPassword('')
                            if (from == "Stylist") {
                                if (loginType == "Stylist") {
                                    navigation.navigate("SignupS")
                                } else {
                                    navigation.navigate("BrandStack", { screen: "SignupB" });
                                }
                            } else {
                                if (loginType == "Stylist") {
                                    navigation.navigate('StylistStack', { screen: "SignupS" });
                                } else {
                                    navigation.navigate("SignupB")
                                }
                            }
                        }}
                    > {en?.signup}</Text></Text>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default LoginB

const styles = StyleSheet.create({})