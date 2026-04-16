import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Splash from '../screens/Splash'
import Loginas from '../screens/Loginas'
import ClientStack from './ClientStack'
import StylistStack from './StylistStack'
import LoaderCommon from '../components/LoaderComman'
import { useDispatch, useSelector } from 'react-redux'
import { DarkTheme, LightTheme } from '../constants/Theme'
import { navigationRef } from '../components/RootNavigation'
import messaging from '@react-native-firebase/messaging';
import { Store } from '../redux/Store'
import { SetCallState, SetCurrentNotificationData } from '../redux/Call'
import * as RootNavigation from '../components/RootNavigation';
import notifee, { AuthorizationStatus, EventType, AndroidImportance } from '@notifee/react-native';
import useNotification from '../components/UseNotificationHooks'
import VideoPlayer from '../screens/VideoPlayer'
import UserGallery from '../screens/Stylist/UserGallery';
import CreateCollection from '../screens/Stylist/CreateCollection'
import BrandStack from './BrandStack'

const MainNavigation = () => {
    const Stack = createNativeStackNavigator();
    // const loading = useSelector((state: any) => state?.load?.isLoading);
    let theme = useSelector((state: any) => state.theme?.theme)
    const callState = useSelector((state: any) => state.calldata.call_state)
    const currentNotification = useSelector((state: any) => state.calldata.current_notification_data)
    const dispatch = useDispatch();
    useNotification()

    const getNf = async () => {
        let remoteMessage = await messaging().getInitialNotification();
        if (remoteMessage) {
            let a = JSON.parse(remoteMessage?.data?.data)
            if (a?.type == 'video' || a?.type == 'audio') {
                console.log('Dattaaaaaaa Cards', a)
                Store.dispatch(SetCurrentNotificationData(a))
                Store.dispatch(SetCallState(true))
            }
            else if (a?.type == 'call-declined') {
                console.log('Dattaaaaaaa Cards', a)
                Store.dispatch(SetCurrentNotificationData(a))
                Store.dispatch(SetCallState(false))
            }
        }
    }

    useEffect(() => {
        if (callState) {
            let data = currentNotification
            if (data) {
                if (data?.type === 'audio' || data?.type === 'video') {
                    RootNavigation.navigate('ReceiveCall', {
                        channelId: data?.channelId,
                        name: data?.name,
                        profile: data?.profile,
                        reciever_id: data?.user_id,
                        type: data?.type,
                        user_type: data?.user_type
                    })
                }
            }
        }
    }, [callState, currentNotification])

    useEffect(() => {
        getNf()
    }, [])

    return (
        <NavigationContainer ref={navigationRef} theme={theme == 'dark' ? DarkTheme : LightTheme} >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen component={Splash} name="Splash" />
                <Stack.Screen component={Loginas} name="Loginas" options={{ gestureEnabled: false }} />
                <Stack.Screen component={ClientStack} name="ClientStack" options={{ gestureEnabled: false }} />
                <Stack.Screen component={StylistStack} name="StylistStack" options={{ gestureEnabled: false }} />
                <Stack.Screen component={BrandStack} name="BrandStack" options={{ gestureEnabled: false }} />
                <Stack.Screen component={VideoPlayer} name="VideoPlayer" />
            </Stack.Navigator>
            <LoaderCommon />
        </NavigationContainer>
    )
}

export default MainNavigation