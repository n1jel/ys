import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import Commonstyles from '../constants/Commonstyles';
import Appimg from '../constants/Appimg';
import SettingC from '../screens/Client/SettingC';
import LikeC from '../screens/Client/LikeC';
import MessageC from '../screens/Client/MessageC';
import SeasonStack from './SeasonStack';
import en from '../translation';
import FeedStack from './FeedStack';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const BottomTabC = (props) => {
    const Tab = createBottomTabNavigator();
    const { Appcolor } = useTheme()
    const unreadChat = useSelector(state => state?.ChatCount?.unreadsChat)

    const Custom = ({ route }) => {
        return ({
            headerShown: false,
            tabBarShowLabel: false,
            styles: { color: "red", backgroundColor: "red", },

            tabBarStyle: {
                height: Platform?.OS == "ios" ? 88 : 66,
                backgroundColor: Appcolor.white,
                alignItems: "center",
                borderTopWidth: 0, // Ensure there's no top border
                //   borderTopLeftRadius: 10, // Apply border radii to top corners
                // borderTopRightRadius: 10,
                // overflow: "hidden",
            },
            tabBarIcon: (({ focused, color, size }) => {
                switch (route.name) {
                    case "FeedStack": {
                        return (
                            <View style={{ ...styles.tab, marginTop: focused ? -26 : 0 }}>
                                <View style={[styles.img, focused && ({ backgroundColor: Appcolor.white, borderRadius: 100 }, Commonstyles(Appcolor).shadow)]}>
                                    <Image source={focused ? Appimg.feedf : Appimg.feed} style={{ height: focused ? 50 : 20, width: focused ? 50 : 20 }} />
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.feed}</Text>}
                            </View>
                        )
                    }
                    case "LikeC": {
                        return (
                            <View style={{ ...styles.tab, marginTop: focused ? -26 : 0 }}>
                                <View style={[styles.img, focused && ({ backgroundColor: Appcolor.white, borderRadius: 100 })]}>
                                    <Image source={focused ? Appimg.heartf : Appimg.heart} style={{ height: focused ? 50 : 20, width: focused ? 50 : 20, resizeMode: "contain" }} />
                                </View>
                                {<Text style={[Commonstyles(Appcolor).semiBold8, { opacity: focused ? 1 : 0.6, marginTop: 4, fontSize: 10 }]} maxFontSizeMultiplier={1.4}>{en?.likes}</Text>}
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
                    case "MessageC": {
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
                    case "SettingC": {
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
            <Tab.Screen name='FeedStack' component={FeedStack} options={{ unmountOnBlur: true }} />
            <Tab.Screen name='LikeC' component={LikeC} />
            <Tab.Screen name='SeasonStack' component={SeasonStack} options={{ unmountOnBlur: true }} />
            <Tab.Screen name='MessageC' component={MessageC} />
            <Tab.Screen name='SettingC' component={SettingC} />
        </Tab.Navigator>

    )
}

export default BottomTabC

const styles = StyleSheet.create({
    tab: {
        justifyContent: "center", alignItems: "center", height: "100%", maxWidth: widthPercentageToDP(20), minWidth: widthPercentageToDP(18)
    },
})