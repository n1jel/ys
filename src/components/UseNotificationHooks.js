import React, { useEffect, useState } from "react";
import messaging from "@react-native-firebase/messaging";
import { useSelector, useDispatch } from "react-redux";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import moment from "moment";
import * as RootNavigation from '../components/RootNavigation';
import ContactusC from "../screens/Client/ContactusC";
import { Store } from "../redux/Store";
import { ClientDetails, StylistDetails } from "../redux/CommanReducer";
import { SetCallState, SetCurrentNotificationData } from "../redux/Call";


export default function useNotification() {

    const token = useSelector(state => state.authenticate)?.token

    let dispatch = useDispatch()

    useEffect(() => {
        messaging().onMessage(async (remoteMessage) => {

            if (remoteMessage && remoteMessage != null) {
                // _Handleroutes(remoteMessage);
                Store.dispatch(StylistDetails())
                Store.dispatch(ClientDetails())
            }
            const channelId = await notifee.createChannel({
                id: 'default',
                name: 'Default',
                sound: "default",
                importance: AndroidImportance.HIGH,
            });
            let id = new Date().getTime().toString();
            // Display Notification in foreground state
            await notifee.displayNotification({
                title: remoteMessage?.notification?.title,
                body: remoteMessage?.notification?.body,
                id: id,
                data: remoteMessage.data,
                //    subtitle: moment(new Date()).fromNow(),
                android: {
                    channelId,
                    importance: AndroidImportance.HIGH,
                    // largeIcon:require('../Assets/notlogo.png'),

                },
            });

        });
    }, [])

    // handle the notification when user interaction is in Foreground state
    useEffect(() => {
        return notifee.onForegroundEvent(async ({ type, detail }) => {
            console.log("detail", detail)
            switch (type) {
                case EventType.DISMISSED:
                    // notifee.deleteChannel('default').then((d) => { })
                    break;
                case EventType.PRESS:
                    _Handleroutes(detail.notification);
                    break;
            }
        });
    }, []);

    // handle the notification when app open from kill state
    // messaging().getInitialNotification().then((remoteMessage) => {
    //     if (remoteMessage && remoteMessage != null) {
    //         _Handleroutes(remoteMessage);
    //     }
    // });

    // handle the notification when app is in background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage && remoteMessage != null) {
            _Handleroutes(remoteMessage);
        }
    });

    // Manage your Route Here
    const _Handleroutes = (notification) => {
        console.log(notification?.data, 'notofication')

        if (notification?.data?.data) {
            let a = JSON.parse(notification?.data?.data)

            if (a?.type == 'video' || a?.type == 'audio') {
                Store.dispatch(SetCurrentNotificationData(a))
                Store.dispatch(SetCallState(true))
                return
            }
            if (a?.type == 'chat' && a?.user_type == 'client') {
                let _data = {
                    _id: a.user_id,
                    full_name: a.name,
                    profile_pic: a.profile
                }
                RootNavigation.navigate('StylistChat', { item: _data })

            }
            else if (a?.type == 'chat' && a?.user_type == 'stylist') {
                let _data = {
                    _id: a.user_id,
                    full_name: a.name,
                    profile_pic: a.profile
                }
                RootNavigation.navigate('ClientChat', { item: _data })
                // RootNavigation.replace('ClientStack', { screen: "NonAuthC", params: { screen: "ClientChat", params: { item: _data } } })
            }
            if (a?.receiver == "brand") {
                if (a?.type == 'follow') {
                    RootNavigation.navigate('BrandStack', { screen: "NonAuthB", params: { screen: "NotificationB" } })
                    return
                }
                RootNavigation.navigate('BrandStack', { screen: "NonAuthB", params: { screen: "NotificationB" } })
            } else if (a?.receiver == "client") {
                if (a?.type == 'follow') {
                    RootNavigation.navigate('ClientStack', { screen: "NonAuthC", params: { screen: "NotificationC" } })
                    return
                }
                RootNavigation.navigate('ClientStack', { screen: "NonAuthC", params: { screen: "NotificationC" } })
            } else if (a?.receiver == "stylist") {
                if (a?.type == 'follow') {
                    RootNavigation.navigate('StylistStack', { screen: "NonAuthS", params: { screen: "NotificationS" } })
                    return
                }
                RootNavigation.navigate('StylistStack', { screen: "NonAuthS", params: { screen: "NotificationS" } })
            }
        }
    }
}