import { Alert, Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import { SafeAreaView } from 'react-native-safe-area-context'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import Appcolor from '../../constants/Appcolor'
import Btn from '../../components/Btn'
import Appfonts from '../../constants/Appfonts'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import { CountryPicker } from 'react-native-country-codes-picker'
import { checkEmailStylist, checkPhoneStylist } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import FastImage from 'react-native-fast-image'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { Country, State, City } from 'country-state-city';
import CustomDrop from '../../components/CustomDrop'
import CscDrop from '../../components/CscDrop'
import AppUtils from '../../utils/apputils'

const SignupS = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme

    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState('+1');
    const [phone_number, setphone_number] = useState('');
    const [store, setStore] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [profile, setProfile] = useState('freelancer')
    const [allCountry, setAllCountry] = useState([])
    const [allState, setAllState] = useState([])
    const [allCities, setAllCities] = useState([])
    const [country, setCountry] = useState(null)
    const [state, setState] = useState(null)
    const [cities, setCities] = useState(null)

    useFocusEffect(useCallback(() => {
        resetData()
    }, []))
    useEffect(() => {
        // const countries = Country.getAllCountries().map(country => ({
        //     // value: country.name,
        //     // label: country.name,
        //     ...country,
        // }));
        setAllCountry(Country.getAllCountries());
    }, [])
    useEffect(() => {
        if (country?.isoCode) {
            State.getStatesOfCountry(country?.isoCode)
            setAllState(State.getStatesOfCountry(country?.isoCode))
        }
    }, [country])
    useEffect(() => {
        if (state?.isoCode) {
            setAllCities(City.getCitiesOfState(country?.isoCode, state?.isoCode))
        }
    }, [state, country])

    const PressFreelancer = () => {
        setProfile('freelancer')
    }
    const PressCompany = () => {
        setProfile('company')
    }
    const submit = async () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let passreg = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (fullname.trim() == "") {
            showToast("Please Enter Full name");
            return
        }
        if (store == "") {
            showToast("Please Enter Store");
            return
        }
        if (email == "") {
            showToast("Please Enter Email");
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
            showToast("Please Enter Mobile number");
            return
        }
        if (phone_number?.length < 10) {
            showToast("Enter valid Mobile number");
            return
        }
        if (country == null) {
            showToast("Country is required.")
            return
        }
        if (allState?.length != 0 && state == null) {
            showToast("State is required.")
            return
        }
        if (allCities?.length != 0 && cities == null) {
            showToast("City is required.")
            return
        }
        if (password.trim() == "") {
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
            let res = null;
            res = await checkEmailStylist(email);
            if (res?.data?.status) {
                try {
                    let res = null;
                    res = await checkPhoneStylist(phone_number);
                    if (res?.data?.status) {
                        // navigation.navigate("AddProfileS", { profile, fullname: fullname, store: store, email: email, phone_number: phone_number, password: password, countryCode: countryCode, confirmpassword: confirmpassword, country: country?.name, state: state?.name, city: cities?.name })
                        navigation.navigate("AddProfileS", { fullname: fullname, store: store, email: email, phone_number: phone_number, password: password, countryCode: countryCode, confirmpassword: confirmpassword, country: country?.name, state: state?.name, city: cities?.name })
                    } else {
                        showToast(res?.data?.message ?? "Something went wrong.");
                    }
                } catch (err) {
                } finally {
                }
            } else {
                showToast(res?.data?.message ?? "NETWORK ERROR.");
            }
        } catch (err) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const resetData = () => {
        setphone_number('')
        setFullname('')
        setStore('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setCountry(null)
        setState(null)
        setCities(null)
    }
    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg} style={{ flex: 1 }}>
                <CountryPicker show={show}
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
                <KeyboardAvoidingView behavior={Platform?.OS == "ios" ? "padding" : null} keyboardVerticalOffset={60} >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Pressable onPress={() => navigation?.goBack()} style={{ marginHorizontal: 16, marginVertical: 20 }}>
                            <Image source={Appimg?.back} style={{ height: 26, width: 26, resizeMode: "contain" }} />
                        </Pressable>
                        <Image source={Appimg?.logo} style={{ height: 100, width: 90, marginHorizontal: 18, marginTop: 12 }} resizeMode='contain' />
                        <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20 }]}>{en?.signup}</Text>
                        <Text style={[Commonstyles(Appcolor)?.regular12, { marginTop: 8, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.signuptxt}</Text>
                        {/* <Text style={[Commonstyles(Appcolor)?.mediumText12, { marginTop: 10, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.areyou}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginHorizontal: 16 }}>
                            <Pressable style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={() => {
                                    PressFreelancer()
                                }}
                            >
                                <FastImage source={profile == 'freelancer' ? Appimg.radio2 : Appimg.radio1} style={styles.radio} />
                                <Text style={[styles.txtradio, { color: Appcolor.txt, }]}>freelancer</Text>
                            </Pressable>
                            <Pressable style={{ flexDirection: "row", alignItems: "center", marginLeft: 16 }}
                                onPress={() => {
                                    PressCompany()
                                }}
                            >
                                <FastImage source={profile == 'company' ? Appimg.radio2 : Appimg.radio1} style={styles.radio} />
                                <Text style={[styles.txtradio, { color: Appcolor.txt, }]}>company</Text>
                            </Pressable>
                        </View> */}
                        <Tinput value={fullname} onChangeText={(t) => setFullname(t)} place={en?.fullname} styleMain={{ marginTop: 16 }} img={Appimg.user} />
                        <Tinput value={store} onChangeText={(t) => setStore(t)} place={en?.store} styleMain={{ marginTop: 20 }} />
                        <Tinput value={email} onChangeText={(t) => setEmail(t)} place={en?.email} styleMain={{ marginTop: 20 }} img={Appimg.mail} />
                        <Text style={{ marginLeft: 16, marginTop: 10, color: Appcolor.txt, fontSize: RFValue(8), fontFamily: Appfonts.medium }}>Phone Number</Text>
                        <View style={{ flexDirection: 'row', alignSelf: "center", alignItems: 'center', borderRadius: 6, marginTop: 10 }} >
                            <TouchableOpacity
                                style={{ width: '16%', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.grad1, marginRight: 10, backgroundColor: Appcolor.white, }}
                                onPress={() => setShow(true)}
                            >
                                <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                                    {countryCode}
                                </Text>
                            </TouchableOpacity>
                            <View style={{ height: 48, width: widthPercentageToDP(74), borderColor: Appcolor.grad1, borderRadius: 4, borderWidth: 0.8, color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium, flexDirection: "row", paddingLeft: 8, justifyContent: "center", alignItems: "center", backgroundColor: Appcolor.white, }}>
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
                                >
                                </TextInput>
                                <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                            </View>
                        </View>
                        <CscDrop styleMain={{ marginTop: 10 }}
                            label={"Country"} data={allCountry} place={"Country"}
                            val={country}
                            setVal={(val) => setCountry(val)}
                        />
                        {allState?.length != 0 && <CscDrop styleMain={{ marginTop: 10 }}
                            val={state}
                            label={"State"} data={allState} place={"State"} setVal={(val) => setState(val)}
                        />}
                        {allCities?.length != 0 && <CscDrop styleMain={{ marginTop: 10 }}
                            val={cities}
                            label={"City"} data={allCities} place={"City"} setVal={(val) => setCities(val)}
                        />}
                        <Tinput value={password} onChangeText={(t) => setPassword(t)} place={en?.password} styleMain={{ marginTop: 20 }} secure />
                        <Tinput value={confirmpassword} onChangeText={(t) => setConfirmPassword(t)} place={en?.confirmpassword} styleMain={{ marginTop: 20 }} secure />
                        <Btn transparent={Appcolor.blackop} title={en?.next} twhite styleMain={{ marginTop: 60, alignSelf: "center" }}
                            onPress={() => {
                                submit()
                            }}
                        />
                        <Text style={[Commonstyles(Appcolor)?.regular12, { marginHorizontal: 18, marginTop: 8, textAlign: "center", marginBottom: 30 }]} onPress={() => navigation.navigate("LoginS")}>{en?.alreadyanaccount}?<Text style={{ color: Appcolor.primary, fontFamily: Appfonts.bold, fontSize: 14 }}> {en?.login}</Text></Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView >
    )
}

export default SignupS

const styles = StyleSheet.create({
    radio: {
        height: 24, width: 24
    },
    txtradio: {

        fontSize: 15.4,
        fontFamily: Appfonts.medium,
        marginLeft: 5,
        textTransform: "capitalize"
    }
})