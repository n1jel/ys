import { Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Appimg from '../../constants/Appimg'
import Commonstyles from '../../constants/Commonstyles'
import { forgotPasswordStylist } from '../../apimanager/httpServices'
import { useDispatch } from 'react-redux'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useTheme } from '@react-navigation/native'
import { CountryPicker } from 'react-native-country-codes-picker'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Appfonts from '../../constants/Appfonts'
import { TouchableOpacity } from 'react-native'
import en from '../../translation'
import Btn from '../../components/Btn'
import showToast from '../../CustomToast'
import { setLoading } from '../../redux/load'
import { forgotPassBrand } from '../../apimanager/brandServices'
import AppUtils from '../../utils/apputils'

const ForgotpassB = ({ navigation }) => {
    const dispatch = useDispatch()
    const [email, setEmail] = useState("");
    const { Appcolor } = useTheme()
    const [countryCode, setCountryCode] = useState("+1")
    const [showCountryModal, setShowCountryModal] = useState(false)

    async function handle_forgotpass() {
        try {
            dispatch(setLoading(true))
            let res = await forgotPassBrand({ phone_number: email, country_code: countryCode });
            if (res?.data?.status) {
                showToast(res?.data?.message ?? "otp sent succesfully");
                navigation.navigate("VerificationB", { email });
            } else {
                showToast(res.data.message ?? "Something went wrong");
            }
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground source={Appimg?.darkbg} style={{ flex: 1 }}>
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>

                    <CountryPicker
                        show={showCountryModal}
                        pickerButtonOnPress={(item) => {
                            setCountryCode(item.dial_code);
                            setShowCountryModal(false);
                        }}
                        onBackdropPress={() => { setShowCountryModal(false) }}
                        style={{
                            textInput: {
                                height: 40,
                                borderRadius: 0,
                            },
                            modal: {
                                height: Platform?.OS == "android" ? heightPercentageToDP(40) : heightPercentageToDP(80),
                            },
                            dialCode: {
                                color: Appcolor.blackcolor
                            },
                            countryName: {
                                color: Appcolor.blackcolor
                            }
                        }}
                    />
                    <Pressable style={{ margin: 18 }} onPress={() => navigation.goBack()}>
                        <Image source={Appimg?.back} style={{ height: 26, width: 26 }} />
                    </Pressable>
                    <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20 }]}>{en?.forgotpassword}</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginTop: 8, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.forgotpasstxt}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, marginTop: 10, marginHorizontal: 18 }} >
                        <TouchableOpacity
                            onPress={() => { setShowCountryModal(true) }}
                            style={{ width: '16%', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.newgrad1, backgroundColor: Appcolor.white, }}
                        >
                            <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                                {countryCode}
                            </Text>
                        </TouchableOpacity>
                        <View style={{
                            height: 48, width: "80%", borderColor: Appcolor.newgrad1, borderRadius: 4, borderWidth: 0.8,
                            color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium, flexDirection: "row",
                            paddingLeft: 8, justifyContent: "center", alignItems: "center", backgroundColor: Appcolor.white,
                        }}>
                            <TextInput
                                place={en?.phonenumber}
                                placeholderTextColor={Appcolor.txt}
                                value={email}
                                onChangeText={t => setEmail(AppUtils.onlyNumbers(t))}
                                keyboardType={"numeric"}
                                maxLength={10}
                                style={{
                                    height: 48, width: "90%", color: Appcolor.txt, fontSize: 14, paddingLeft: 8, fontFamily: Appfonts.medium
                                }}
                                autoCapitalize={"none"}
                            >
                            </TextInput>
                            <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                        </View>
                    </View>
                    <Btn transparent={Appcolor.blackop} title={en?.continue} twhite styleMain={{ marginTop: 350, alignSelf: "center" }}
                        onPress={() => {
                            if (email == "" || email?.length < 10) {
                                showToast("Please Enter Phone number");
                                return
                            }
                            handle_forgotpass()
                        }}
                    />
                </KeyboardAwareScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default ForgotpassB

const styles = StyleSheet.create({})