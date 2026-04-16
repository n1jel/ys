import React, { useEffect, useRef } from 'react';
import { Alert, AppState, PermissionsAndroid, Platform, StatusBar, Text, TextInput, TextInputProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { Provider, useSelector } from 'react-redux';
import { Store, persistor } from './src/redux/Store';
import MainNavigation from './src/routes/MainNavigation';
import { useNetInfo } from "@react-native-community/netinfo";
import { PersistGate } from 'redux-persist/integration/react';
import { setConnected, setfcmtoken } from './src/redux/CommanReducer';
import messaging from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus, EventType, AndroidImportance } from '@notifee/react-native';
import { SetCallState, SetCurrentNotificationData } from './src/redux/Call';
import { toastConfig } from './src/CustomToast';
import { withIAPContext } from 'react-native-iap';
import { updateAppstate } from './src/redux/appstate';
import Appcolor from './src/constants/Appcolor';
import LogRocket from '@logrocket/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App(): JSX.Element {

  const netInfo = useNetInfo();
  // useEffect(() => {
  //   // Example of logging an event on app startup
  //   analytics().logEvent('app_open');
  // }, []);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (netInfo.isConnected == null || netInfo.isConnected == false) {
      Store.dispatch(setConnected(false))
    }
    else {
      Store.dispatch(setConnected(true))
    }
  }, [netInfo.isConnected]);
  useEffect(() => {
    LogRocket.init('oevdr3/your-season')
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        Store.dispatch(updateAppstate(true))
      } else {
        Store.dispatch(updateAppstate(false))
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [])
  useEffect(() => {
    getNf()
    get_fcm_token()
    if (TextInput.defaultProps == null) {
      TextInput.defaultProps = {};
      TextInput.defaultProps.allowFontScaling = false;
    }
    if (Text.defaultProps == null) {
      Text.defaultProps = {};
      Text.defaultProps.allowFontScaling = false;
    }
  }, [])
  const getNf = async () => {
    let remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      let a = JSON.parse(remoteMessage?.data?.data)
      console.log('AAAAAAAAA', a)
      if (a?.type == 'video' || a?.type == 'audio') {
        Store.dispatch(SetCurrentNotificationData(a))
        Store.dispatch(SetCallState(true))
      }
      else if (a?.type == 'call-declined') {
        Store.dispatch(SetCurrentNotificationData(a))
        Store.dispatch(SetCallState(false))
      }
    }
  }
  async function get_fcm_token() {
    if (Platform.OS === 'ios') {
      // await messaging().registerDeviceForRemoteMessages();
      const settings = await notifee.requestPermission({
        sound: true,
        announcement: true,
      });
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('Permission settings:', settings);
      } else {
        console.log('User declined permissions');
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        // Get the token
        try {
          const token = await messaging().getToken();

          Store.dispatch(setfcmtoken(token))
          createAndroidChannels()
        }
        catch (e: any) {
          Alert.alert(e.toString())
        }

      }
    }
    else {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('permission granted');
          const token = await messaging().getToken();
          Store.dispatch(setfcmtoken(token))
        } else {
          console.log('permission denied');
        }
      } catch (e) {
        console.log(e);
      }
      createAndroidChannels()
    }
  }
  const createAndroidChannels = async () => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default',
      sound: "default",
      importance: AndroidImportance.HIGH,
    });

    const channelId2 = await notifee.createChannel({
      id: 'call',
      name: 'Call',
      sound: "calling",
      importance: AndroidImportance.HIGH,
    });

    notifee.getChannels().then(x => {
      console.log("Channels", x)
    })
    messaging().onMessage(async remoteMessage => {
      console.log('remoteMessage', remoteMessage)

      if (remoteMessage?.data?.data == undefined) {
        notifee.displayNotification({
          title: remoteMessage?.notification?.title,
          body: remoteMessage?.notification?.body,
          android: {
            channelId,
          },
          data: remoteMessage?.data,
          ios: {
            sound: 'default',
          },
        });
      }
      else {
        let a = JSON.parse(remoteMessage?.data?.data)
        console.log(a.type, 'typeeeeee')
        console.log(remoteMessage, 'remoteMessage')
        if (a.type == 'video' || a.type == 'audio') {
          Store.dispatch(SetCurrentNotificationData(a))
          Store.dispatch(SetCallState(true))
        }
        else if (a.type == 'call-declined') {
          console.log('Dattaaaaaaa App', a)
          Store.dispatch(SetCurrentNotificationData(a))
          Store.dispatch(SetCallState(false))
        }
        // else if(a.type == 'chat'){
        //   notifee.displayNotification({
        //     title: remoteMessage?.notification?.title,
        //     body: remoteMessage?.notification?.body,
        //     android: {
        //       channelId,
        //     },
        //     data: remoteMessage?.data,
        //     ios: {
        //       sound: 'default',
        //     },
        //   });
        // }
        // else if(a.type == 'follow_request'|| a.type == 'follow'|| a.type == 'like'|| a.type == 'collection'){

        //     notifee.displayNotification({
        //       title: remoteMessage?.notification?.title,
        //       body: remoteMessage?.notification?.body,
        //       android: {
        //         channelId,
        //       },
        //       data: remoteMessage?.data,
        //       ios: {
        //         sound: 'default',
        //       },
        //     });


        // }

      }


    });
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={Store}>
        <StatusBar barStyle={"dark-content"} backgroundColor={Appcolor.txt} />
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <MainNavigation />
            <Toast config={toastConfig} />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default withIAPContext(App);
