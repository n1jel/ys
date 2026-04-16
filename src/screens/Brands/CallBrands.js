import { Alert, FlatList, Image, ImageBackground, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import { RFValue } from 'react-native-responsive-fontsize'
import Appfonts from '../../constants/Appfonts'
import { fileUrl } from '../../apimanager/httpmanager'
import { useDispatch, useSelector } from 'react-redux'
import { setCallEngine, setCallS, SetCallState, setCallStates, SetCurrentNotificationData, setisVideoCall, setNavigationParams, setNavigationSender } from '../../redux/Call'
import RtcEngine from 'react-native-agora'
import { Store } from '../../redux/Store'
import moment from 'moment'
import getAuthToken from '../../components/CallFunction'
import firestore from '@react-native-firebase/firestore'
import { SendNotification } from '../../apimanager/httpServices'

const CallBrands = ({ navigation, route }) => {
    const [otherUser, setotherUser] = React.useState(route?.params?.otherUser ?? {})
    const user = useSelector((state) => state)?.auth?.user;
    const channelId = Number(user._id.replace(/[^0-9]/g, "").substr(-5))
    const uid = Number(user._id.replace(/[^0-9]/g, "").substr(-5)).toString()
    const engine = useSelector(state => state.calldata.callEngine)
    const callData = useSelector(state => state.calldata.callStates)
    const paramsSender = useSelector(state => state.calldata.navigationSender);
    const config = {
        appId: "8d9e61117d034592b0c2d6a28d123575",
        channelId: channelId,
        uid: uid,
        stringUid: 1234
    }

    const [remoteUid, setremoteUid] = useState(123)
    const callState = useSelector(state => state.calldata.call_state)
    const currentNotification = useSelector(state => state.calldata.current_notification_data)

    const dispatch = useDispatch()
    var x = useRef(null);
    let timer = useRef(0)
    const [stateTimer, setStateTimer] = useState(0)
    let remoteOtherUID = 123;
    let refState = useRef(false)
    function fancyTimeFormat(duration) {
        // Hours, minutes and seconds
        var hrs = ~~(duration / 3600);
        var mins = ~~((duration % 3600) / 60);
        var secs = ~~duration % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";

        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;

        return ret;
    }
    useEffect(() => {
        firestore().collection('calling').doc(user?._id).set({
            audioEnabled: callData.audioEnabled,
            videoEnabled: false
        })
    }, [callData.audioEnabled])
    useEffect(() => {
        _initEngine();
    }, [])
    useEffect(() => {
        console.log('Dattaaaaaaa', callState)
        if (!callState) {
            console.log('Dattaaaaaaa', currentNotification)
            if (currentNotification) {
                let data = currentNotification
                console.log('Dattaaaaaaasd', data)
                if (data?.type === 'call-declined') {
                    leaveChannel();
                    Store.dispatch(SetCurrentNotificationData({}))
                    Store.dispatch(SetCallState(false))
                }
            }
        }
    }, [callState])

    const _initEngine = async () => {
        // dispatch(setisVideoCall(false))

        if (engine == null) {

            const _engine = await RtcEngine.create(config.appId)
            console.log(_engine, 'engine')
            await _engine.enableAudio()
            dispatch(setCallEngine(_engine))

            _engine.addListener('JoinChannelSuccess', async (channel, uid, elapsed) => {
                console.info('JoinChannelSuccessCaller', channel, uid, elapsed);
                console.log('beforejoining')
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: true }))
                Store.dispatch(SetCallState(true));
                Store.dispatch(SetCurrentNotificationData({}));

            });
            _engine.addListener('UserJoined', (uid, elapsed) => {
                console.info('UserJoined', uid, elapsed)
                remoteOtherUID = uid;
                fetchReceiverCallStatus();
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, stateTimer: moment().unix() }))
                timer.current = moment().unix() - Store.getState().calldata.callStates.stateTimer
                x.current = setInterval(() => {
                    timer.current = timer.current + 1
                    setStateTimer(timer.current)


                }, 1000);
                // setremoteUid(uid)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: uid }))

            });
            _engine.addListener('UserOffline', async (uid, reason) => {
                console.info('UserOffline', uid, reason)
                clearInterval(x.current)
                x.current = null
                timer.current = 0
                setStateTimer(0)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: 123 }))

                clearStates()
                _engine?.leaveChannel()

                remoteOtherUID = 123


                _engine?.destroy()

                navigation.goBack()

                console.log('BOOMMMMMM')

                Store.dispatch(SetCallState(false));
                Store.dispatch(SetCurrentNotificationData({}));
            });
            _engine.addListener('LeaveChannel', async (stats) => {
                console.info('LeaveChannel', stats);
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: false, remoteUid: 123 }))
                clearStates()


                remoteOtherUID = 123

            });
            if (Platform.OS === 'android') {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);
            }
            await getAuthToken(config.uid, config.channelId).then(async (res) => {
                let token = res.data.token
                console.log('------->Token', token)
                if (token) {
                    _engine.joinChannel(
                        token,
                        config.channelId.toString(),
                        null,
                        Number(config.uid)
                    )
                    // let item = user.image_gallery?.length < 1 ? {} : user.image_gallery[0]
                    let res = await SendNotification({ sender_user_id: user?._id, user_type: user?.is_added_by_brand == 1 ? 'client' : 'stylist', user_id: otherUser._id, payload: { title: user.full_name, body: 'Audio Calling', sound: 'calling.mp3', channel_id: "call", android_channel_id: "call", data: { user_type: user?.user_type, channelId: channelId, type: 'audio', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })
                    console.log(res, 'SendNotification')
                }

            }).catch(err => {
                // props.navigation.pop()
            })
        }
        else {

            timer.current = moment().unix() - Store.getState().calldata.callStates.stateTimer
            x.current = setInterval(() => {
                timer.current = timer.current + 1
                setStateTimer(timer.current)

            }, 1000);

            engine.addListener('JoinChannelSuccess', async (channel, uid, elapsed) => {
                console.info('JoinChannelSuccessCaller', channel, uid, elapsed);
                console.log('beforejoining', remoteUid)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: true }))

                Store.dispatch(SetCallState(true));
                Store.dispatch(SetCurrentNotificationData({}));

            });
            engine.addListener('UserJoined', (uid, elapsed) => {
                console.info('UserJoined', uid, elapsed)
                remoteOtherUID = uid;
                fetchReceiverCallStatus();
                timer.current = moment().unix() - Store.getState().calldata.callStates.stateTimer
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, stateTimer: moment().unix() }))

                x.current = setInterval(() => {
                    timer.current = timer.current + 1
                    setStateTimer(timer.current)
                }, 1000);
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: uid }))

            });
            engine.addListener('UserOffline', async (uid, reason) => {
                console.info('UserOffline', uid, reason)
                clearInterval(x.current)
                x.current = null
                timer.current = 0
                setStateTimer(0)
                clearStates()
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: 123 }))

                engine?.leaveChannel()
                remoteOtherUID = 123
                engine?.destroy()

                navigation.goBack()
                console.log('BOOMMMMMMTTT')
                Store.dispatch(SetCallState(false));
                Store.dispatch(SetCurrentNotificationData({}));
            });
            engine.addListener('LeaveChannel', async (stats) => {
                console.info('LeaveChannel', stats);

                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: false, remoteUid: 123 }))
                clearStates()

                remoteOtherUID = 123

            });
            if (Platform.OS === 'android') {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);
            }

        }
    };
    const clearStates = async () => {

        dispatch(setCallStates({
            isJoined: false,
            remoteUid: 123,
            audioEnabled: true,
            otherAudioEnabled: true,
            callStatus: 'connecting',
            stateTimer: moment().unix(),
            enableSpeakerphone: false
        }))
        dispatch(setCallS(""))
        dispatch(setNavigationParams({}))
        dispatch(setCallEngine(null))
        dispatch(setNavigationSender({}))


    }
    //Check Receiver Call Status
    const fetchReceiverCallStatus = async () => {

        firestore().collection('calling').doc(paramsSender.reciever_id)
            .onSnapshot((snapshot) => {
                console.log(snapshot)
                if (snapshot._exists === true) {
                    let data = snapshot.data();
                    dispatch(setCallStates({ ...Store.getState().calldata.callStates, otherAudioEnabled: data.audioEnabled }))
                    if (data.audioEnabled === false) {
                        dispatch(setCallStates({ ...Store.getState().calldata.callStates, callStatus: (paramsSender.name + ' ' + 'mute') }));
                    }
                    else {
                        callData.remoteUid !== 123 ? dispatch(setCallStates({ ...Store.getState().calldata.callStates, callStatus: 'connected' })) : dispatch(setCallStates({ ...Store.getState().calldata.callStates, callStatus: 'connecting' }));
                    }
                }
            })
    }
    const leaveChannel = async () => {
        await clearStates()
        engine?.leaveChannel()
        remoteOtherUID = 123
        engine?.destroy()

        Store.dispatch(SetCallState(false));
        Store.dispatch(SetCurrentNotificationData({}));
        navigation.pop()
        console.log('BOOMLLLLLL')
    }
    const _muteVideo = () => {
        if (engine) {
            if (callData.audioEnabled) {
                engine.muteLocalAudioStream(true)
                    .then(() => {
                        dispatch(setCallStates({ ...Store.getState().calldata.callStates, audioEnabled: false }))
                    })
                    .catch((err) => {
                        console.warn('switchCamera', err);
                    });
            }
            else {
                engine.muteLocalAudioStream(false)
                    .then(() => {
                        dispatch(setCallStates({ ...Store.getState().calldata.callStates, audioEnabled: true }))
                    })
                    .catch((err) => {
                        console.warn('switchCamera', err);
                    });
            }
        }
    }
    const _switchSpeakerphone = () => {

        engine?.setEnableSpeakerphone(!callData.enableSpeakerphone).then(() => {
            dispatch(setCallStates({ ...Store.getState().calldata.callStates, enableSpeakerphone: !callData.enableSpeakerphone }))
        }).catch((err) => {
            console.warn('setEnableSpeakerphone', err)
        })
    }

    return (
        <ImageBackground style={{ flex: 1 }} source={Appimg.backgroundCall}>
            <Image source={otherUser?.profile_pic == '' ? Appimg.user : { uri: fileUrl + otherUser.profile_pic }} style={styles.profile} />
            <View style={{ justifyContent: "center", alignSelf: "center", marginTop: 10 }}>
                <Text style={{ color: Appcolor.white, fontSize: RFValue(26), fontFamily: Appfonts.medium, textAlign: "center" }}>{otherUser?.full_name}</Text>
                <Text style={{ color: Appcolor.white, fontSize: RFValue(26), fontFamily: Appfonts.bold, textAlign: "center" }}>{stateTimer != 0 ? fancyTimeFormat(stateTimer) : callData.remoteUid !== 123 ? 'Connected' : 'Connecting...'}</Text>
            </View>

            <View style={{ flexDirection: "row", alignSelf: "center", width: "100%", justifyContent: "space-evenly" }}>
                <Pressable onPress={() => { _muteVideo() }}>
                    <Image source={!callData.audioEnabled ? Appimg.mikeoff : Appimg.Mike} style={styles.calling} />
                </Pressable>

                <Pressable onPress={async () => {
                    leaveChannel()
                    let res = await SendNotification({ sender_user_id: user?._id, user_type: user?.is_added_by_brand == 1 ? 'client' : 'stylist', user_id: otherUser._id, payload: { title: user?.full_name, body: 'Call Declined', data: { user_type: user?.user_type, channelId: channelId, type: 'call-declined', profile: user?.profile_pic, name: user?.full_name, user_id: user._id } } })

                }}>
                    <Image source={Appimg.Callcut} style={styles.calling} />
                </Pressable>
                <Pressable onPress={() => _switchSpeakerphone()}>
                    <Image source={!callData.enableSpeakerphone ? Appimg.speakeroff : Appimg.speaker} style={[styles.calling]} />
                </Pressable>
            </View>
        </ImageBackground>
    )
}

export default CallBrands

const styles = StyleSheet.create({
    profile: {
        height: 120,
        width: 120,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop: heightPercentageToDP(15),
        borderRadius: 60
    },
    calling: {
        height: 65,
        width: 65,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop: heightPercentageToDP(25),

    },
})