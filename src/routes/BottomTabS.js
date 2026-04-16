import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import Commonstyles from '../constants/Commonstyles';
import Appimg from '../constants/Appimg';
import en from '../translation';
import MessageS from '../screens/Stylist/MessageS';
import SettingS from '../screens/Stylist/SettingS';
import ClosetS from '../screens/Stylist/ClosetS';
import FeedStackS from './FeedStackS';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import SeasonS from '../screens/Stylist/SeasonS';

const BottomTabS = () => {
    const Tab = createBottomTabNavigator();
    const { Appcolor } = useTheme()
    const unreadChat = useSelector(state => state?.ChatCount?.unreadsChat)

    const Custom = ({ route }) => {
        return ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                height: Platform?.OS == "ios" ? 88 : 66,
                backgroundColor: Appcolor.white,
                alignItems: "center",
                borderTopWidth: 0, // Ensure there's no top border
                // borderTopLeftRadius: 10, // Apply border radii to top corners
                // borderTopRightRadius: 10,
                // overflow: "hidden",
            },
            tabBarIcon: (({ focused, color, size }) => {
                switch (route.name) {
                    case "FeedStackS": {
                        return (
                            <View style={{ ...styles.tab, marginTop: focused ? -26 : 0 }}>
                                <View style={[styles.img, focused && ({ backgroundColor: Appcolor.white, borderRadius: 100 })]}>
                                    <Image source={focused ? Appimg.feedf : Appimg.feed} style={{ height: focused ? 50 : 20, width: focused ? 50 : 20 }} />
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.feed}</Text>}
                            </View>
                        )
                    }
                    case "ClosetS": {
                        return (
                            <View style={{ ...styles.tab, marginTop: focused ? -26 : 0 }}>
                                <View style={[styles.img, focused && ({ backgroundColor: Appcolor.white, borderRadius: 100 })]}>
                                    <Image source={focused ? Appimg.closet : Appimg.closet1} style={{ height: focused ? 50 : 20, width: focused ? 50 : 20, resizeMode: "contain" }} />
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.closet}</Text>}
                            </View>
                        )
                    }
                    case "SeasonStack": {
                        return (
                            <View style={[{ ...styles.tab, marginTop: -50 }]}>
                                <View style={[{ backgroundColor: focused ? Appcolor.white : Appcolor.txt, height: 50, width: 50, borderRadius: 50 }]}>
                                    <Image source={Appimg.season} style={{ height: 50, width: 50, borderRadius: 50 }} />
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.yourseason}</Text>}
                            </View>
                        )
                    }
                    case "MessageS": {
                        return (
                            <View style={{ ...styles.tab, marginTop: focused ? -26 : 0 }}>
                                <View style={[styles.img, focused && ({ backgroundColor: Appcolor.white, borderRadius: 100 })]}>
                                    <Image source={focused ? Appimg.messagef : Appimg.message} style={{ height: focused ? 50 : 20, width: focused ? 50 : 20, resizeMode: "contain" }} />
                                    {unreadChat != 0 && <View style={{ backgroundColor: Appcolor.red, height: 16, width: 16, borderRadius: 16, justifyContent: "center", alignItems: "center", position: 'absolute', right: !focused ? -14 : 0, top: !focused ? -8 : 0 }}>
                                        <Text style={Commonstyles(Appcolor).mediumText10}>{unreadChat?.toString()}</Text>
                                    </View>}
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.chat}</Text>}
                            </View>
                        )
                    }
                    case "SettingS": {
                        return (
                            <View style={{ ...styles.tab, marginTop: focused ? -26 : 0 }}>
                                <View style={[styles.img, focused && ({ backgroundColor: Appcolor.white, borderRadius: 100 })]}>
                                    <Image source={focused ? Appimg.settingf : Appimg.setting} style={{ height: focused ? 50 : 20, width: focused ? 50 : 20 }} />
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.settings}</Text>}
                            </View>
                        )
                    }
                }
            })
        })
    }

    return (
        <Tab.Navigator screenOptions={Custom} initialRouteName={"HomeStack"}>
            <Tab.Screen name='FeedStackS' component={FeedStackS} options={{ gestureEnabled: false }} />
            <Tab.Screen name='ClosetS' component={ClosetS} />
            <Tab.Screen name='SeasonStack' component={SeasonS} />
            <Tab.Screen name='MessageS' component={MessageS} />
            <Tab.Screen name='SettingS' component={SettingS} />
        </Tab.Navigator>
    )
}

export default BottomTabS

const styles = StyleSheet.create({
    tab: {
        justifyContent: "center", alignItems: "center", height: "100%", maxWidth: widthPercentageToDP(20), minWidth: widthPercentageToDP(18)
    },
    img: {
        borderRadius: 100
    }
})