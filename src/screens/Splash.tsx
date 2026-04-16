import { AppState, BackHandler, Image, ImageBackground, Linking, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getuserstylistdetail } from '../apimanager/httpServices';
import { Store } from '../redux/Store';
import { setUser, setbiometric } from '../redux/auth';
import { checkSub } from '../utils/utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import RNExitApp from 'react-native-exit-app';
import { useTheme } from '@react-navigation/native';
import LogRocket from '@logrocket/react-native';
import notifee from "@notifee/react-native";
import Appimg from '../constants/Appimg';
import { setSplashShown } from '../redux/splashshown';

interface Props {
    navigation: any;
}

const Splash: React.FC<Props> = ({ navigation }) => {
    const authorize: boolean | undefined = useSelector((state: any) => state?.auth?.authorize);
    const role: boolean | undefined | any = useSelector((state: any) => state?.auth?.user?.user_type);
    const user = useSelector((state: any) => state?.auth?.user);
    const isSplashShown = useSelector((state: any) => state?.splashshown?.isSplashShown);

    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const appState = useRef(AppState.currentState);
    const videoRef = useRef(null)

    const [ispaused, setIspaused] = useState(false)
    const [next, setnext] = useState(false)

    const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
    });

    useEffect(() => {
        AsyncStorage.getItem('@faceId', (err, item) => {
            console.log(item, ":::::");
            if (item == "true") {
                iosbiomatric()
                dispatch(setbiometric("1"))
            } else if (JSON.parse(item) == "false") {
                setnext(true)
                dispatch(setbiometric("1"))
            } else {
                setnext(true)
                if (Platform.OS == "android") {
                    dispatch(setbiometric("1"))
                } else {
                    dispatch(setbiometric("0"))
                }
            }
        })
    }, [])
    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            if (nextAppState === "active") {
                setIspaused(false)
            } else {
                setIspaused(true)
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [])
    useEffect(() => {
        if (isSplashShown) {
            let timeout = setTimeout(() => {
                routecheck()
            }, 2000);
            return () => {
                clearTimeout(timeout)
            }
        }
    }, [isSplashShown])

    async function iosbiomatric() {
        setnext(true)
        return
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
                                setnext(true)
                                rnBiometrics.createKeys().then(resultObject => {
                                    const { publicKey } = resultObject;
                                    console.log(publicKey);
                                    // sendPublicKeyToServer(publicKey)
                                });
                                console.log('successful biometrics provided', success);
                            } else {
                                RNExitApp.exitApp();
                                console.log('user cancelled biometric prompt');
                            }
                        })
                        .catch(() => {
                            RNExitApp.exitApp();
                            console.log('biometrics failed');
                        });
                    console.log('TouchID is supported');
                } else if (available && biometryType === BiometryTypes.FaceID) {
                    console.log('FaceID is supported');
                } else if (available && biometryType === BiometryTypes.Biometrics) {
                    console.log('Biometrics is supported');
                } else {
                }
            })
            .catch(() => {
                RNExitApp.exitApp();
            });
    }
    const routecheck = async () => {
        if (!isSplashShown) {
            dispatch(setSplashShown(true))
        }
        if (authorize) {
            // const message = await messaging().getInitialNotification();
            // console.log(message);

            const initialNotification = await notifee.getInitialNotification();
            console.log("initialNotificationinitialNotification", initialNotification);
            if (initialNotification) {
                let a = JSON.parse(initialNotification?.notification?.data?.data)
                if (a?.type == 'chat' && a?.user_type == 'client') {
                    let _data = {
                        _id: a.user_id,
                        full_name: a.name,
                        profile_pic: a.profile
                    }
                    navigation.navigate('StylistStack', { screen: "NonAuthS", params: { screen: "StylistChat", params: { item: _data } } })
                } else if (a?.type == 'chat' && a?.user_type == 'stylist') {
                    let _data = {
                        _id: a.user_id,
                        full_name: a.name,
                        profile_pic: a.profile
                    }
                    navigation.navigate('ClientStack', { screen: "NonAuthC", params: { screen: "ClientChat", params: { item: _data } } })
                }
                return
            }

            if (role == "client") {
                navigation.replace("ClientStack", { screen: "NonAuthC" })
            } else if (role == "stylist") {
                LogRocket.identify(user._id)
                navigation.replace("StylistStack", { screen: "NonAuthS" })
            } else {
                navigation.replace("BrandStack", { screen: "NonAuthB" })
            }
        } else {
            navigation.replace("Loginas")
        }
    }

    return next && (
        <SafeAreaView style={{ flex: 1, backgroundColor: Appcolor.blackcolor }}>
            {isSplashShown ?
                <ImageBackground source={Appimg.goldborder} imageStyle={{ resizeMode: "stretch" }} style={[styles.main, { alignItems: "center", justifyContent: "center" }]}>
                    <Image source={Appimg.logotxt} style={styles.logo} />
                </ImageBackground>
                :
                <View style={{ flex: 1 }}>
                    <Video
                        source={require("../assets/YourSeason.mp4")}
                        ref={videoRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            zIndex: 100
                        }}
                        resizeMode={'stretch'}
                        paused={ispaused}
                        onEnd={() => routecheck()}

                    />
                </View>
            }
        </SafeAreaView>
    )
}

export default Splash

const styles = StyleSheet.create({
    main: {
        width: "100%", height: "100%"
    },
    logo: {
        width: "66%", resizeMode: "contain"
    }
})