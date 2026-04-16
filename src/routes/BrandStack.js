import { StyleSheet, } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeBrand from '../screens/Brands/WelcomeBrand';
import LoginB from '../screens/Brands/LoginB';
import SignupB from '../screens/Brands/SignupB';
import AddProfileB from '../screens/Brands/AddProfileB';
import ForgotpassB from '../screens/Brands/ForgotpassB';
import VerificationB from '../screens/Brands/VerificationB';
import NewPasswordB from '../screens/Brands/NewPasswordB';
import NonAuthB from './NonAuthB';

const BrandStack = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={WelcomeBrand} name="WelcomeBrand" />
            <Stack.Screen component={LoginB} name="LoginB" initialParams={{ from: "Brand" }} />
            <Stack.Screen component={SignupB} name="SignupB" />
            <Stack.Screen component={AddProfileB} name="AddProfileB" />
            <Stack.Screen component={ForgotpassB} name="ForgotpassB" />
            <Stack.Screen component={VerificationB} name="VerificationB" />
            <Stack.Screen component={NewPasswordB} name="NewPasswordB" />
            <Stack.Screen component={NonAuthB} name="NonAuthB" />
        </Stack.Navigator>
    )
}

export default BrandStack

const styles = StyleSheet.create({})