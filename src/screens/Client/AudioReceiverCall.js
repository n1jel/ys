import { Dimensions, FlatList, Image, ImageBackground, PermissionsAndroid, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import { RFValue } from 'react-native-responsive-fontsize'
import Appfonts from '../../constants/Appfonts'
import { useDispatch, useSelector } from 'react-redux'
import RtcEngine, { RtcLocalView, RtcRemoteView, VideoRenderMode, ChannelProfile, ClientRole, RtcEngineConfig, } from 'react-native-agora'
import { setCallEngine, setCallS, setCallStates, setNavigationParams, setNavigationSender } from '../../redux/Call'
import { Store } from '../../redux/Store'
import moment from 'moment'
import getAuthToken from '../../components/CallFunction'
import firestore from '@react-native-firebase/firestore';
import { fileUrl } from '../../apimanager/httpmanager'


const AudioReceiveCall = ({navigation,route}) => {
    let user = useSelector((state) => state)?.auth?.user;
    const { width, height } = Dimensions.get('window');
    const { channelId, uid, reciever_id, name, profile } = route?.params
    const engine = useSelector(state => state.calldata.callEngine)
    const callData = useSelector(state => state.calldata.callStates)
 
    const dispatch = useDispatch()
    // const channelId = 12345
    // const uid = "1234"
    // const reciever_id = "123"
    // const tokens = useSelector(state => state.auth)?.token

    const config = {
        appId: "8d9e61117d034592b0c2d6a28d123575",
        channelId: channelId,
        uid: uid,
        stringUid: 1234
    }
    var x = useRef(null);
    let timer = useRef(0)
    const [stateTimer, setStateTimer] = useState(0)
    // const [engine, setEngine] = useState(null)
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
        setStateTimer(ret)
        // return ret;
    }
    const _initEngine = async () => {
        // dispatch(setisVideoCall(false))
        console.log(engine,'engineeee')
        if (engine == null) {
            const _engine = await RtcEngine.create(config.appId)
            await _engine.enableAudio()
            dispatch(setCallEngine(_engine))


            _engine.addListener('JoinChannelSuccess', async (channel, uid, elapsed) => {
                console.info('JoinChannelSuccessCaller', channel, uid, elapsed);
                // console.log('beforejoining', remoteUid)

                // setisJoined(true)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: true }))


            });
            _engine.addListener('UserJoined', (uid, elapsed) => {
                console.info('UserJoined', uid, elapsed)

                // setremoteUid(uid)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: uid, isJoined: true, stateTimer: moment().unix() }))
                timer.current = moment().unix() - Store.getState().calldata.callStates.stateTimer

                x.current = setInterval(() => {
                    timer.current = timer.current + 1
                    fancyTimeFormat(timer.current)
                }, 1000);
                fetchReceiverCallStatus();
            });
            _engine.addListener('UserOffline', async (uid, reason) => {
                console.info('UserOffline', uid, reason)
                clearInterval(x.current)
                x.current = null
                timer.current = 0
                setStateTimer(0)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: 123, isJoined: false }))
                clearStates()

                _engine?.leaveChannel()
                // setremoteUid(123)


                _engine?.destroy()
                // setisJoined(false)
                // Toast.show('Call Ended');
                navigation.goBack()
            });
            _engine.addListener('LeaveChannel', async (stats) => {
                console.info('LeaveChannel', stats);
                clearStates()
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: false, remoteUid: 123 }))

            });
            if (Platform.OS === 'android') {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);
            }
            await getAuthToken(config.uid, config.channelId).then(async (res) => {
                let token = res.data.token

                // let token="006f52d7a2035494de3bacf16fcf437857aIACEHXTH7U4IZNktRtH1ZkK+qaAGU5qF+sQHd8HCMBJpeSg+fkcAAAAAEACbQyLuclrAYAEAAQBxWsBg"
                console.log('------->Token', token)
                if (token) {
                    _engine.joinChannel(
                        token,
                        config.channelId.toString(),
                        null,
                        Number(config.uid)
                    )

                 
                }

            }).catch(err => {
                // props.navigation.pop()
            })

        }
        else {
            timer.current = moment().unix() - Store.getState().calldata.callStates.stateTimer
            console.log(timer,'timerrrr')
            x.current = setInterval(() => {
                timer.current = timer.current + 1
                fancyTimeFormat(timer.current)
            }, 1000);
            engine.addListener('JoinChannelSuccess', async (channel, uid, elapsed) => {
                console.log('JoinChannelSuccessCaller', channel, uid, elapsed);
                // console.log('beforejoining', remoteUid)

                // setisJoined(true)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: true }))


            });
            engine.addListener('UserJoined', (uid, elapsed) => {
                console.log('UserJoined', uid, elapsed)
                x.current = setInterval(() => {
                    timer.current = timer.current + 1
                    fancyTimeFormat(timer.current)
                }, 1000);
                // setremoteUid(uid)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, remoteUid: uid, isJoined: true }))

                fetchReceiverCallStatus();
            });
            engine.addListener('UserOffline', async (uid, reason) => {
                console.info('UserOffline', uid, reason)
                clearInterval(x.current)
                x.current = null
                timer.current = 0
                setStateTimer(0)
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: false, remoteUid: 123, isJoined: false }))
                clearStates()
                engine?.leaveChannel()
                // setremoteUid(123)



                engine?.destroy()



                // isJoined(false)
                // Toast.show('Call Ended');
                navigation.goBack()
            });
            engine.addListener('LeaveChannel', async (stats) => {
                console.info('LeaveChannel', stats);
                dispatch(setCallStates({ ...Store.getState().calldata.callStates, isJoined: false, remoteUid: 123 }))
                clearStates()
                // setisJoined(false)
                // setremoteUid([])
            });
            if (Platform.OS === 'android') {
                await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                ]);
            }
           
        }
    };
    const clearStates = () => {


        dispatch(setCallS(""))
        dispatch(setNavigationParams({}))
        dispatch(setCallEngine(null))
        dispatch(setNavigationSender({}))
        dispatch(setCallStates({
            remoteUid: 123,
            audioEnabled: true,
            otherAudioEnabled: true,
            callStatus: 'connecting',
            isJoined: false,
            stateTimer: 0,
            enableSpeakerphone: false
        }))

    }
    const _switchSpeakerphone = () => {

        engine?.setEnableSpeakerphone(!callData.enableSpeakerphone).then(() => {
            // setenableSpeakerphone(!enableSpeakerphone)
            dispatch(setCallStates({ ...Store.getState().calldata.callStates, enableSpeakerphone: !callData.enableSpeakerphone }))

        }).catch((err) => {
            console.warn('setEnableSpeakerphone', err)
        })
    }
    const _muteVideo = () => {
        if (engine) {
            if (callData.audioEnabled) {
                engine.muteLocalAudioStream(true)
                    .then(() => {
                        console.log('mute')
                        // setaudioEnabled(false)
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

                        // console.log('mute')

                        // setaudioEnabled(true)
                    })
                    .catch((err) => {
                        console.warn('switchCamera', err);
                    });

            }

        }
    }
    useEffect(() => {
        _initEngine()

    }, [])
    const leaveChannel = async () => {
        // setremoteUid(123)

        clearStates()
        engine?.leaveChannel()
        engine?.destroy()
        // setisJoined(false)
        navigation.goBack()
    }

    useEffect(() => {

        firestore().collection('calling').doc(user?._id).set({
            audioEnabled: callData.audioEnabled,
            videoEnabled: false
        })
    }, [callData.audioEnabled])

    //Check Receiver Call Status
    const fetchReceiverCallStatus = async () => {
        console.log("==========Video mute recivedddddddddd", reciever_id);
        firestore().collection('calling').doc(reciever_id)
            .onSnapshot((snapshot) => {
                if (snapshot._exists === true) {
                    let data = snapshot.data();
                    dispatch(setCallStates({ ...Store.getState().calldata.callStates, otherAudioEnabled: data.audioEnabled }))

                    if (data.audioEnabled === false) {
                        dispatch(setCallStates({ ...Store.getState().calldata.callStates, callStatus: (name + ' '+'mute') }));

                    }
                    else {
                        callData.isJoined ? dispatch(setCallStates({ ...Store.getState().calldata.callStates, callStatus: 'connected' })) : dispatch(setCallStates({ ...Store.getState().calldata.callStates, callStatus: 'connecting' }))
                    }
                }
            })
    }
    const setIt = () => {
        dispatch(setCallS('reciever'))
    }
    useEffect(() => {
        this._unsubscribe = navigation.addListener('blur', () => {
            console.log('luredReciever', callData.isJoined)
            if (Store.getState().calldata?.callStates?.isJoined) {
                setIt()
            }
        });
    }, [callData])
    return (
        <ImageBackground style={{flex:1}} source={Appimg.backgroundCall}>
             <Image source={profile == '' ? Appimg.user : { uri: fileUrl + profile }} style={styles.profile} />
            <View style={{justifyContent:"center",alignSelf:"center",marginTop:10}}>
                <Text style={{color:Appcolor.white,fontSize:RFValue(26),fontFamily:Appfonts.medium,textAlign:"center"}}>{name}</Text>
                <Text style={{color:Appcolor.white,fontSize:RFValue(26),fontFamily:Appfonts.bold,textAlign:"center"}}>{stateTimer != 0 ? stateTimer:'Connecting...'}</Text>
            </View>

            <View style={{flexDirection:"row",alignSelf:"center",width:"100%",justifyContent:"space-evenly"}}>
            <Pressable onPress={()=>{_muteVideo()}}>
                <Image source={!callData.audioEnabled?Appimg.mikeoff:Appimg.Mike} style={styles.calling} />
                </Pressable>
           
            <Pressable onPress={()=>{ leaveChannel()}}>
            <Image source={Appimg.Callcut} style={styles.calling} />
            </Pressable>
            <Pressable onPress={()=>_switchSpeakerphone()}>
            <Image source={!callData.enableSpeakerphone?Appimg.speakeroff:Appimg.speaker} style={[styles.calling]} />
            </Pressable>

            </View>
        </ImageBackground>
    )
}

export default AudioReceiveCall

const styles = StyleSheet.create({
    profile: {
        height: 120,
        width: 120,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop:heightPercentageToDP(15)
    },
    calling: {
        height: 65,
        width: 65,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop:heightPercentageToDP(25),

    },
})