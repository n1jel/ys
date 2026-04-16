import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, PermissionsAndroid, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Appimg from '../../constants/Appimg'
import Appfonts from '../../constants/Appfonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { useSelector } from 'react-redux'

import RtcEngine, { RtcLocalView, RtcRemoteView, VideoRenderMode, ChannelProfile, ClientRole, RtcEngineConfig, } from 'react-native-agora'
import Draggable from 'react-native-draggable';
import KeepAwake from 'react-native-keep-awake';
import firestore from '@react-native-firebase/firestore'
import { store } from '../../redux/Store'
import { SetCallState, SetCurrentNotificationData } from '../../redux/Call'
import getAuthToken from '../../components/CallFunction'

const VideoReceiveCall = ({navigation,route}) => {
    const { width, height } = Dimensions.get('window');
    const { channelId, uid, reciever_id, name, profile } = route?.params??{}
    const config = {
        appId: "8d9e61117d034592b0c2d6a28d123575",
        channelId: channelId,
        uid: uid,
        stringUid: 1234
    }
    // const dispatch = useDispatch()
    const [engine, setEngine] = useState(null)
    const [remoteUid, setremoteUid] = useState(123)
    const [switchCamera, setswitchCamera] = useState(false)
    const [videoEnabled, setvideoEnabled] = useState(true)
    const [audioEnabled, setaudioEnabled] = useState(true)
    const [otherVideoEnabled, setOtherVideoEnabled] = useState(true)
    const [otherAudioEnabled, setOtherAudioEnabled] = useState(true)
    const [callStatus, setCallStatus] = useState('connecting...')
    const [isJoined, setisJoined] = useState(false)
    let user = useSelector((state) => state)?.auth?.user;
    let refState = useRef(null)

      //MARK:- Agora Video Calling Setup-----------------
      const _initEngine = async () => {
        const _engine = await RtcEngine.create(config.appId)
        await _engine.enableVideo();
        await _engine.startPreview();
        await _engine.setChannelProfile(ChannelProfile.LiveBroadcasting);
        await _engine.setClientRole(ClientRole.Broadcaster);

        setEngine(_engine)
        _engine.addListener('JoinChannelSuccess', async (channel, uid, elapsed) => {
            console.info('JoinChannelSuccessCaller', channel, uid, elapsed);
            console.log('beforejoining', remoteUid)
            setisJoined(true)
        });
        _engine.addListener('UserJoined', (uid, elapsed) => {
            console.info('UserJoined', uid, elapsed)
            setremoteUid(uid);
            fetchReceiverCallStatus();

        });
        _engine.addListener('UserOffline', async (uid, reason) => {
            console.info('UserOffline', uid, reason)
            _engine?.leaveChannel()
            setremoteUid(123)
            _engine?.destroy()
            setisJoined(false)
            navigation.goBack()
        });

        _engine.addListener('LeaveChannel', async (stats) => {
            console.info('LeaveChannel', stats);

            setisJoined(false)
            setremoteUid([])
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
    };
    const _switchCamera = () => {
        if (engine) {
            engine.switchCamera()
                .then(() => {
                    setswitchCamera(!switchCamera)
                })
                .catch((err) => {
                    console.warn('switchCamera', err);
                });
        }
    };
    const _disableCamera = () => {
        if (engine) {
            if (videoEnabled) {
                engine.enableLocalVideo(false)
                    .then(() => {
                        setvideoEnabled(false)
                    })
                    .catch((err) => {
                        console.warn('switchCamera', err);
                    });
            }
            else {
                engine.enableLocalVideo(true)
                    .then(() => {
                        setvideoEnabled(true)
                    })
                    .catch((err) => {
                        console.warn('switchCamera', err);
                    });
            }
        }
    };
    const _muteVideo = () => {
        if (engine) {
            if (audioEnabled) {
                engine.muteLocalAudioStream(true)
                    .then(() => {
                        console.log('mute')
                        setaudioEnabled(false)
                    })
                    .catch((err) => {
                        console.warn('switchCamera', err);
                    });
            }
            else {
                engine.muteLocalAudioStream(false)
                    .then(() => {
                        console.log('mute')
                        setaudioEnabled(true)
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
        engine?.leaveChannel()
        setremoteUid(123)
        engine?.destroy()
        setisJoined(false)
        navigation.goBack()
    }


    useEffect(() => {
        firestore().collection('calling').doc(user?._id).set({
            audioEnabled: audioEnabled,
            videoEnabled: videoEnabled
        })
    }, [audioEnabled, videoEnabled])


    //Check Receiver Call Status
    const fetchReceiverCallStatus = async () => {

        firestore().collection('calling').doc(reciever_id)
            .onSnapshot((snapshot) => {
                if (snapshot._exists === true) {
                    let data = snapshot.data();
                    setOtherAudioEnabled(data.audioEnabled);
                    setOtherVideoEnabled(data.videoEnabled);
                    if (data.audioEnabled === false && data.videoEnabled === false) {
                        setCallStatus(name + ' '+'disabled');
                    }
                    else if (data.audioEnabled === false) {
                        setCallStatus(name + ' '+'mute call');
                    }
                    else if (data.videoEnabled === false) {
                        setCallStatus(name + ' '+'camera disabled');
                    } else {
                        isJoined ? setCallStatus('connected') : setCallStatus('connecting...')
                    }
                }
            })
    }

    return (
        <>
         {(isJoined && remoteUid !== 123) ? <RtcRemoteView.SurfaceView
                channelId={'62853'}
                uid={Number(remoteUid)}
                zOrderMediaOverlay={true}
                zOrderOnTop={false}
                style={{ width: width, height: height }} />
                : null
            }
                 {/* {
                remoteUid !== 123 &&
                <Text style={[{ position: 'absolute', top: 60 }]}>{name}</Text>
            } */}
            {
                !otherVideoEnabled &&
                <View style={{ height: '100%', width: '100%', position: 'absolute', backgroundColor: 'black' }} />
            }
                    {
                isJoined ?
                    <Draggable x={width} y={0}>
                        <RtcLocalView.SurfaceView
                            channelId={'62853'}
                            zOrderMediaOverlay={false}
                            zOrderOnTop={true}
                            style={{ width: (width / 100) * 25, height: (height / 100) * 22, top: (height / 100) * 5, right: (height / 100) * 2, position: 'absolute' }} />
                        {
                            videoEnabled ? null :
                                <Image source={Appimg.user} style={{ width: (width / 100) * 25, height: (height / 100) * 22, top: (height / 100) * 5, right: (height / 100) * 2, position: 'absolute' }} blurRadius={15} />
                        }
                    </Draggable>
                    : <ActivityIndicator size="small" color={'pink'} style={{ height: '100%', width: '100%', position: 'absolute' }} />
            }
            {/* <View style={{ marginTop: heightPercentageToDP(45), width: widthPercentageToDP(60),
                 alignSelf: "flex-end", alignItems: "flex-end",flexDirection:"row",
                 justifyContent:"space-between" }}>
                <Text style={{ color: "white",fontSize:RFValue(26),fontFamily:Appfonts.bold,marginRight:5 }}>10:52</Text>
                <Image source={Appimg.vidshortimg} style={styles.imgView} />
            </View> */}

            <View style={{ flexDirection: "row", alignSelf: "center", width: "100%", justifyContent: "space-evenly",position:'absolute',bottom:150 }}>
          
                <Pressable onPress={() => { _switchCamera() }}>
                <Image source={Appimg.cameraflip} style={styles.calling} />
                </Pressable>
                <Pressable onPress={() => { _disableCamera() }}>
                <Image source={!videoEnabled?Appimg.videoOff:Appimg.videoon} style={styles.calling} />
                </Pressable>
                <Pressable  onPress={() => { _muteVideo() }}>
                <Image source={!audioEnabled?Appimg.mikeoff:Appimg.Mike} style={styles.calling} />
                </Pressable>
              
            </View>
            <Pressable style={{position:'absolute',bottom:30,alignSelf:'center'}} onPress={()=>{leaveChannel()}}>
                <Image source={Appimg.Callcut} style={styles.callingcut} />
            </Pressable>
        </>
    )
}

export default VideoReceiveCall

const styles = StyleSheet.create({
    profile: {
        height: 120,
        width: 120,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop: heightPercentageToDP(12)
    },
    calling: {
        height: 65,
        width: 65,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop: heightPercentageToDP(5),
    },
    callingcut: {
        height: 65,
        width: 65,
        alignSelf: "center",
        resizeMode: "contain",
        marginTop: heightPercentageToDP(2),
    },
    imgView: {
        width: 100,
        height: 140,
        resizeMode: "contain",
        alignSelf: "flex-end",
        marginRight: 20
    }
})