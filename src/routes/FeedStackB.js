import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import StylishProfile from '../screens/Client/StylishProfile';
import FeedS from '../screens/Stylist/FeedS';
import SearchS from '../screens/Stylist/SearchS';
import FeedB from '../screens/Brands/FeedB';
import { StyleSheet } from 'react-native';

const FeedStackB = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen component={FeedB} name="FeedB" options={{ gestureEnabled: false }} />
            <Stack.Screen component={SearchS} name="SearchS" />
            <Stack.Screen component={StylishProfile} name="StylishProfile" />
        </Stack.Navigator>
    )
}

export default FeedStackB

const styles = StyleSheet.create({})