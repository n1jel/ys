import { Alert, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Appimg from '../constants/Appimg'
import Appcolor from '../constants/Appcolor'
import Commonstyles from '../constants/Commonstyles'
import en from '../translation'
import Tinput from '../components/Tinput'
import Btn from '../components/Btn'
import showToast from '../CustomToast'
import { forgotPasswordClient } from '../apimanager/httpServices'
import { useDispatch } from 'react-redux'
import { setLoading } from '../redux/load'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useTheme } from '@react-navigation/native'
import { CountryPicker } from 'react-native-country-codes-picker'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Appfonts from '../constants/Appfonts'
import { TouchableOpacity } from 'react-native'
import { TextInput } from 'react-native'

const Forgotpass = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch()
  const { Appcolor } = useTheme()

  const [countryCode, setCountryCode] = useState("+1")
  const [showCountryModal, setShowCountryModal] = useState(false)
  async function handle_forgotpass() {
    try {
      dispatch(setLoading(true))
      if (email) {
        let res = null;
        res = await forgotPasswordClient(email,countryCode);
        if (res?.data?.status) {
          showToast(res?.data?.message ?? "OTP sent succesfully");
          navigation.navigate("VerificationC", { email });
        } else {
          showToast(res.data.message ?? "Something went wrong");
        }
      }
    } catch (error) {

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
          {/* <Tinput onChangeText={(t) => setEmail(t)} place={en?.email} styleMain={{ marginTop: 26 }} img={Appimg?.mail} /> */}
          {/* <Tinput onChangeText={(t) => setEmail(t)}
            place={en?.phonenumber} styleMain={{ marginTop: 26 }} img={Appimg?.phone}
            keyboard={"numeric"}
            textInputProps={{
              maxLength: 10
            }}
          /> */}

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
                            onChangeText={t => setEmail(t)}
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
          <Btn title={en?.continue} transparent={Appcolor.blackop} twhite styleMain={{ marginTop: 350, alignSelf: "center" }}
            onPress={() => {
              if (email == "") {
                showToast("Please Enter Phonenumber");
                // showToast("Please Enter email");
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

export default Forgotpass

const styles = StyleSheet.create({})