import { StyleSheet } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SeasonC from '../screens/Client/SeasonC';
import StylishProfile from '../screens/Client/StylishProfile'
import CollectionsC from '../screens/Client/CollectionsC';
import BrandProfile from '../screens/Client/BrandProfile';

const SeasonStack = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={'AllStylist'}>
            <Stack.Screen component={SeasonC} name="AllStylist" />
            <Stack.Screen component={StylishProfile} name="StylishProfile" />
            <Stack.Screen component={BrandProfile} name="BrandProfile" />
            <Stack.Screen component={CollectionsC} name="CollectionsC" />
        </Stack.Navigator>
    )
}

export default SeasonStack

const styles = StyleSheet.create({})