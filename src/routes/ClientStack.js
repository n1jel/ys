import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import WelcomeC from '../screens/Client/WelcomeC';
import SignupC from '../screens/Client/SignupC';
import AddProfile from '../screens/Client/AddProfile';
import LoginC from '../screens/Client/LoginC';
import Forgotpass from '../screens/Forgotpass';
import VerificationC from '../screens/Client/VerificationC';
import NewPasswordC from '../screens/Client/NewPasswordC';
import NonAuthC from './NonAuthC';

const ClientStack = () => {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={WelcomeC} name="WelcomeC" />
            <Stack.Screen component={LoginC} name="LoginC" />
            <Stack.Screen component={SignupC} name="SignupC" />
            <Stack.Screen component={AddProfile} name="AddProfile" />
            <Stack.Screen component={Forgotpass} name="Forgotpass" />
            <Stack.Screen component={VerificationC} name="VerificationC" />
            <Stack.Screen component={NewPasswordC} name="NewPasswordC" />
            <Stack.Screen component={NonAuthC} name="NonAuthC" options={{ gestureEnabled: false }} />
        </Stack.Navigator>
    )
}

export default ClientStack

const styles = StyleSheet.create({})