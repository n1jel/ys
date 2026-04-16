import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FeedC from '../screens/Client/FeedC';
import SearchC from '../screens/Client/SearchC';
import StylishProfile from '../screens/Client/StylishProfile';
import ProfileC from '../screens/Client/ProfileC';
import CollectionsC from '../screens/Client/CollectionsC';
import BrandProfile from '../screens/Client/BrandProfile';

const FeedStack = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={FeedC} name="FeedC" />
            <Stack.Screen component={SearchC} name="SearchC" />
            <Stack.Screen component={StylishProfile} name="StylishProfile" />
            <Stack.Screen component={BrandProfile} name="BrandProfile" />
            <Stack.Screen component={CollectionsC} name="CollectionsC" />
        </Stack.Navigator>
    )
}

export default FeedStack
