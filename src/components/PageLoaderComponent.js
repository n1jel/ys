import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'

const PageLoaderComponent = ({ loadingMore }) => {
    const { Appcolor } = useTheme()

    return (
        <View style={{ marginVertical: 20, alignItems: "center" }}>
            {loadingMore && <ActivityIndicator size={"large"} color={Appcolor.primary} />}
        </View>
    )
}

export default PageLoaderComponent

const styles = StyleSheet.create({})