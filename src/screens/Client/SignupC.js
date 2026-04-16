import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Appimg from '../../constants/Appimg'
import { SafeAreaView } from 'react-native-safe-area-context'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import Appcolor from '../../constants/Appcolor'
import Btn from '../../components/Btn'
import Appfonts from '../../constants/Appfonts'
import { CountryPicker } from 'react-native-country-codes-picker'
import { RFValue } from 'react-native-responsive-fontsize'
import { checkEmailClient, checkPhoneClient } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import moment from 'moment'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import AppUtils from '../../utils/apputils'

const SignupC = ({ navigation }) => {
    const dispatch = useDispatch()
    let theme = useSelector(state => state.theme)?.theme
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+1');
    const [phone_number, setphone_number] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const { Appcolor } = useTheme()

    useFocusEffect(useCallback(() => {
        resetData()
    }, []))

    const submit = async () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (fullname.trim() == "") {
            showToast("Please Enter Full name");
            return
        }
        if (email == "") {
            showToast("Plese Enter Email");
            return
        }
        if (!reg.test(email)) {
            showToast("Email not valid")
            return
        }
        if (countryCode == "") {
            showToast("Please select country code");
            return
        }
        if (phone_number == "") {
            showToast("Plese Enter Mobile number");
            return
        }
        if (phone_number?.length < 10) {
            showToast("Enter valid Mobile number");
            return
        }
        if (password == "") {
            showToast("Please Enter Password");
            return
        }
        let regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
        if (!AppUtils.validatePassword(password)) {
            showToast("Password must contain at least 8 characters, including one letter and one digit.")
            return
        }
        if (password?.length < 6) {
            showToast("Password must be at least 6 characters long.")
            return
        }
        if (confirmpassword == "") {
            showToast("Please Enter confim Password");
            return
        }
        if (password != confirmpassword) {
            showToast("Password not match");
            return
        }
        try {
            dispatch(setLoading(true))
            let res = await checkEmailClient(email.toLowerCase());
            if (res?.data?.status) {
                let response = await checkPhoneClient(phone_number);
                if (response?.data?.status) {
                    navigation.navigate("AddProfile", { fullname: fullname, email: email, phone_number: phone_number, password: password, countryCode: countryCode, confirmpassword: confirmpassword })
                } else {
                    if (res?.data?.message) {
                        showToast(response?.data?.message ?? "Something went wrong");
                    } else {
                        alert(JSON.stringify(res), moment().format("DD hh:mm"))
                    }
                }
            } else {
                if (res?.data?.message) {
                    showToast(res?.data?.message ?? "Network error");
                } else {
                    alert(JSON.stringify(res), moment().format("DD hh:mm"))
                }
            }
        } catch (err) {
            console.log(err)
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetData = () => {
        setphone_number('')
        setFullname('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }
    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg} style={{ flex: 1 }}>
                <CountryPicker
                    show={show}
                    pickerButtonOnPress={(item) => {
                        setCountryCode(item.dial_code);
                        setShow(false);
                    }}
                    onBackdropPress={() => { setShow(false) }}
                    style={{
                        textInput: {
                            height: 40,
                            borderRadius: 0,
                        },
                        modal: {
                            height: heightPercentageToDP(80),
                        },
                        dialCode: {
                            color: Appcolor.blackcolor
                        },
                        countryName: {
                            color: Appcolor.blackcolor
                        }
                    }}
                />
                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                    <Pressable onPress={() => navigation?.goBack()} style={{ marginHorizontal: 16, marginVertical: 20 }}>
                        <Image source={Appimg?.back} style={{ height: 26, width: 26, resizeMode: "contain" }} />
                    </Pressable>
                    <Image source={Appimg?.logo} style={{ height: 100, width: 90, marginHorizontal: 18, marginTop: 12 }} resizeMode='contain' />
                    <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20 }]}>{en?.signup}</Text>
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginTop: 8, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.signuptxt}</Text>
                    <Tinput value={fullname} onChangeText={(t) => setFullname(t)} place={en?.fullname} styleMain={{ marginTop: 16 }} img={Appimg.user} />
                    <Tinput value={email} onChangeText={(t) => setEmail(t)} place={en?.email} styleMain={{ marginTop: 20 }} img={Appimg.mail} />
                    <Text style={{ marginLeft: 16, marginTop: 10, color: Appcolor.txt, fontSize: RFValue(8), fontFamily: Appfonts.medium }}>Phone Number</Text>
                    <View style={{ flexDirection: 'row', alignSelf: "center", marginHorizontal: 5, alignItems: 'center', borderRadius: 6, marginTop: 10, }} >
                        <TouchableOpacity
                            onPress={() => setShow(true)}
                            style={{ width: '16%', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.grad1, marginRight: 10, backgroundColor: Appcolor.white }}
                        >
                            <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                                {countryCode}
                            </Text>
                        </TouchableOpacity>
                        <View style={{
                            height: 48, width: widthPercentageToDP(74), borderColor: Appcolor.grad1, borderRadius: 4, borderWidth: 0.8,
                            color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium, flexDirection: "row",
                            paddingLeft: 8, justifyContent: "center", alignItems: "center", backgroundColor: Appcolor.white
                        }}>
                            <TextInput
                                placeholder="Mobile Number"
                                placeholderTextColor={Appcolor.txt}
                                value={phone_number}
                                onChangeText={(t) => setphone_number(t)}
                                keyboardType={"numeric"}
                                maxLength={10}
                                style={{
                                    height: 48, width: "90%", color: Appcolor.txt, fontSize: 14, paddingLeft: 8, fontFamily: Appfonts.medium
                                }}
                                autoCapitalize={"none"}
                            />
                            <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                        </View>
                    </View>
                    <Tinput value={password} onChangeText={(t) => setPassword(t)} place={en?.password} styleMain={{ marginTop: 20 }} secure />
                    <Tinput value={confirmpassword} onChangeText={(t) => setConfirmPassword(t)} place={en?.confirmpassword} styleMain={{ marginTop: 20 }} secure />
                    <Btn title={en?.next} transparent={Appcolor.blackop} twhite styleMain={{ marginTop: 60, alignSelf: "center" }}
                        onPress={() => {
                            submit()
                        }}
                    />
                    <Text style={[Commonstyles(Appcolor)?.regular12, { marginHorizontal: 18, marginTop: 8, marginBottom: 30, textAlign: "center" }]} onPress={() => navigation.navigate("LoginC")}>{en?.alreadyanaccount}?<Text style={{ color: Appcolor.primary, fontFamily: Appfonts.bold, fontSize: 14 }}> {en?.login}</Text></Text>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </SafeAreaView >
    )
}

export default SignupC

const styles = StyleSheet.create({})