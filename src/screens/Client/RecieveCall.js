//MARK:- Importing Libraries
import React, { useEffect, useState,useContext } from 'react';
import { Image, View, Text, ImageBackground, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Video from 'react-native-video';
import { Store } from '../../redux/Store';
import { SetCallState, SetCurrentNotificationData, setNavigationParams } from '../../redux/Call';
import { SendNotification } from '../../apimanager/httpServices';
import Appimg from '../../constants/Appimg';
import { fileUrl } from '../../apimanager/httpmanager';


//MARK:- Create Audio Call UI
const RecieveCall = ({ navigation, route }) => {
    // Userdefined Properties

    const callState = useSelector(state => state.calldata.call_state);
    const user =useSelector((state) => state)?.auth?.user;

    const [callAction, setCallAction] = useState(false);
    const { width, height } = Dimensions.get('window');
    const { channelId, name, profile, reciever_id, type,user_type } = route?.params;
    console.log(profile.length,'profile')
    const [paused, setPaused] = useState(false);
    const dispatch = useDispatch()
 

    useEffect(() => {
     let a =  setTimeout(() => {
            if (!callAction) {
                console.log('TimeOUT ..... ')
                Store.dispatch(SetCurrentNotificationData({}))
                Store.dispatch(SetCallState(false))
                setCallAction(true);
            }
        }, 35000)
        return ()=>{
            clearTimeout(a)
        }
    }, [])

    useEffect(() => {
        if (!callState && !callAction) {
            navigation.goBack()
        }
    }, [callState])

    return (
        <ImageBackground style={{ flex: 1, width: width, height: height, backgroundColor: 'black' }} source={profile == ''?Appimg.user:{ uri:fileUrl+profile}} resizeMode="cover" blurRadius={20}>
            <Video source={require('../../assets/calling.mp3')} resizeMode="contain" audioOnly={true} paused={paused}
                ref={(ref) => { this.player = ref }} style={{ width: 0, height: 0 }} repeat={true} />

            <View style={{ width: width, height: height, position: 'absolute', backgroundColor: "#0008" }} />
            <Image style={{ width: width * 0.35, height: width * 0.35, backgroundColor: 'white', borderRadius: width * 0.35 / 2, alignSelf: "center", marginTop: height * 0.18 }} source={profile == ''?Appimg.user:{ uri:fileUrl+profile}} resizeMode="cover" />
            <Text style={styles.appSubtitleText}>{name}</Text>
            <Text style={[styles.appSubtitleText, { fontSize: 20 }]}>{type === 'audio' ? 'Audio Calling' : 'Video Calling'}</Text>


            <View style={{ flexDirection: "row", position: "absolute", bottom: height * 0.1, alignSelf: "center", justifyContent: 'space-evenly', width: width - 40 }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => {

                    setPaused(true);
                    Store.dispatch(SetCurrentNotificationData({}))
                    Store.dispatch(SetCallState(false))
                    setCallAction(true);

                    if (type == 'video') {

                        navigation.replace("VideoReceiveCall", {
                            uid: Number(user._id.replace(/[^0-9]/g, "").substr(-5)),
                            channelId: channelId,
                            profile: profile,
                            name: name,
                            reciever_id: reciever_id,
                            user_type:user_type
                        });
                        dispatch(setNavigationParams(
                            {
                                uid: Number(user._id.replace(/[^0-9]/g, "").substr(-5)),
                                channelId: channelId,
                                profile: profile,
                                name: name,
                                reciever_id: reciever_id,
                                user_type:user_type
                            }
                        ))
                    }
                    else {

                        navigation.replace("AudioReceiveCall", {
                            uid: Number(user._id.replace(/[^0-9]/g, "").substr(-5)),
                            channelId: channelId,
                            profile: profile,
                            name: name,
                            reciever_id: reciever_id,
                            user_type:user_type
                        });
                        dispatch(setNavigationParams({
                            uid: Number(user._id.replace(/[^0-9]/g, "").substr(-5)),
                            channelId: channelId,
                            profile: profile,
                            name: name,
                            reciever_id: reciever_id,
                            user_type:user_type
                        }))
                    }
                }}>
                    <Image style={{ width: 70, height: 70, resizeMode: "cover", alignSelf: "center" }} source={require('../../assets/call-accept.png')} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={async() => {
                    Store.dispatch(SetCurrentNotificationData({}))
                    Store.dispatch(SetCallState(false))
                    // setCallAction(true);
                    setPaused(true);
                    console.log(user?._id)
                    console.log(reciever_id)
                   let res = await SendNotification({ sender_user_id:user?._id,user_type:user_type,user_id: reciever_id, payload: { title: name, body: 'Call Declined', data: { channelId: channelId, type: 'call-declined', profile: '', name: '', user_id: '' } } })
                   
                   console.log(res,'SendNotification')

                }}>
                    <Image style={{ width: 70, height: 70, resizeMode: "cover", alignSelf: "center" }} source={require('../../assets/call-decline.png')} />
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
}
export default RecieveCall;

//MARK:- UI Styling
let styles = StyleSheet.create({
    appSubtitleText: {
        fontSize: 24,
        // fontFamily: 'Raleway-SemiBold',
        color: 'white',
        marginTop: 20,
        width: Dimensions.get('window').width * 0.96,
        alignSelf: "center",
        textAlign: "center"
    },
});