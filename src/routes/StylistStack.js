import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import WelcomeS from '../screens/Stylist/WelcomeS';
import LoginS from '../screens/Stylist/LoginS';
import SignupS from '../screens/Stylist/SignUpS';
import VerificationS from '../screens/Stylist/VerificationS';
import ForgotpassS from '../screens/ForgotpassS';
import NewPasswordS from '../screens/Stylist/NewPasswordS';
import AddProfileS from '../screens/Stylist/AddProfileS';
import NonAuthS from './NonAuthS';
import LoginB from '../screens/Brands/LoginB';

const StylistStack = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={WelcomeS} name="WelcomeS" />
            {/* <Stack.Screen component={LoginS} name="LoginS" /> */}
            <Stack.Screen component={LoginB} name="LoginS" initialParams={{ from: "Stylist" }} />
            <Stack.Screen component={SignupS} name="SignupS" />
            <Stack.Screen component={ForgotpassS} name="ForgotpassS" />
            <Stack.Screen component={VerificationS} name="VerificationS" />
            <Stack.Screen component={NewPasswordS} name="NewPasswordS" />
            <Stack.Screen component={AddProfileS} name="AddProfileS" />
            <Stack.Screen component={NonAuthS} name="NonAuthS" options={{ gestureEnabled: false }} />
        </Stack.Navigator>
    )
}

export default StylistStack

const styles = StyleSheet.create({})