import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FeedC from '../screens/Client/FeedC';
import SearchC from '../screens/Client/SearchC';
import StylishProfile from '../screens/Client/StylishProfile';
import FeedS from '../screens/Stylist/FeedS';
import ProfileS from '../screens/Stylist/ProfileS';
import SearchS from '../screens/Stylist/SearchS';

const FeedStackS = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen component={FeedS} name="FeedS" options={{ gestureEnabled: false }} />
            <Stack.Screen component={SearchS} name="SearchS" />
            <Stack.Screen component={StylishProfile} name="StylishProfile" />
        </Stack.Navigator>
    )
}

export default FeedStackS
