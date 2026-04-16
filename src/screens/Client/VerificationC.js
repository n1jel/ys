import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Btn from '../../components/Btn'
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import Appfonts from '../../constants/Appfonts'
import showToast from '../../CustomToast'
import { VerifyClient } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'
import { useDispatch } from 'react-redux'
import { useTheme } from '@react-navigation/native'

const VerificationC = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const [otp, setOtp] = useState("")
    const { Appcolor } = useTheme()

    async function Otpverification() {
        try {
            dispatch(setLoading(true))
            if (otp?.length != 4) {
                showToast("Please Fill otp");
                return;
            }
            let res = null;
            let body = {
                phone_number: route?.params?.email,
                otp: otp,
            };
            res = await VerifyClient(body);
            if (res?.data?.status) {
                showToast(res?.data?.message ?? "Otp Verified Successfully");
                navigation.navigate("NewPasswordC", { id: res?.data?.data?._id });
            }
            else {
                showToast(res?.data?.message ?? "Something went wrong")
            }
        } catch (error) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground source={Appimg?.darkbg} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Pressable style={{ margin: 18 }} onPress={() => navigation.goBack()}>
                        <Image source={Appimg?.back} style={{ height: 26, width: 26 }} />
                    </Pressable>
                    <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20 }]}>{en?.verification}</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginTop: 8, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.verificationtxt}</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{route?.params?.email}</Text>
                    <Text style={[Commonstyles(Appcolor).mediumText10, { margin: 18 }]}>{en?.enterotp}</Text>
                    <OTPInputView pinCount={4} autoFocusOnLoad={false}
                        style={{ height: 80, marginHorizontal: 18 }}
                        codeInputFieldStyle={[Commonstyles(Appcolor)?.shadow, { height: 60, borderRadius: 4, width: 60, backgroundColor: Appcolor.white, color: Appcolor.primary, fontFamily: Appfonts.MontBold, fontSize: 24 }]}
                        onCodeFilled={(code => {
                            setOtp(code)
                        })}
                    />
                    <View style={[Commonstyles(Appcolor)?.row, { justifyContent: 'space-between', marginHorizontal: 18 }]}>
                        <Text style={[Commonstyles(Appcolor).mediumText10, {}]}>{en?.receivethecode}?</Text>
                        <Text style={[Commonstyles(Appcolor).semiBoldIta10, { color: Appcolor?.primary }]}>{en?.resend}</Text>
                    </View>
                    <Btn title={en?.verifyandcontinue} transparent={Appcolor.blackop} twhite styleMain={{ marginTop: 200, alignSelf: "center" }}
                        onPress={() =>
                            Otpverification()
                        }
                    />
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default VerificationC

const styles = StyleSheet.create({})