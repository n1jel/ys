import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import Btn from '../../components/Btn'
import Appimg from '../../constants/Appimg'
import Appfonts from '../../constants/Appfonts'
import { storeData } from '../../utils/asyncstore'
import { useSelector } from 'react-redux'

export default function BiometricB({ navigation }) {
    let isSub = useSelector(state => state?.auth?.isSubscribe)
    const user = useSelector(state => state?.auth?.user)

    return (
        <View style={{ backgroundColor: "black", flex: 1, flexDirection: "column", justifyContent: "space-between", }}>
            <View style={{ marginTop: 80 }}>
                <Image
                    source={Appimg?.faceid}
                    style={{
                        height: 80,
                        width: 80,
                        alignSelf: "center",
                        resizeMode: "contain",
                        tintColor: "rgba(191,150,60,1)"
                    }}
                />
                <Text style={{ color: "white", alignSelf: "center", marginTop: 20, fontSize: 20, fontFamily: Appfonts.medium }}>Enable Face ID</Text>
                <Text style={{ color: "white", alignSelf: "center", marginTop: 50, marginHorizontal: 20, textAlign: "center", fontSize: 18, fontFamily: Appfonts.medium }}>Would you like to turn on Face ID for Faster access to Your Season?</Text>
            </View>
            <View style={{ alignItems: "center", marginBottom: 80 }}>
                <Btn
                    title={"Enable"}
                    onPress={() => {
                        storeData("@faceId", true)
                        user?.is_added_by_brand == 1 ?
                            navigation.navigate("BottomTabB")
                            :
                            navigation.navigate("AddStylistsB")
                    }}
                />
                <Text
                    style={{ color: "white", alignSelf: "center", marginTop: 10, marginHorizontal: 20, textAlign: "center", fontSize: 18, fontFamily: Appfonts.medium }}
                    onPress={() => {
                        storeData("@faceId", JSON.stringify(false))
                        user?.is_added_by_brand == 1 ?
                            navigation.navigate("BottomTabB")
                            :
                            navigation.navigate("AddStylistsB")
                    }}
                >
                    Skip
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({})