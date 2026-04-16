import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import en from '../../translation'
import FastImage from 'react-native-fast-image'
import Appcolor from '../../constants/Appcolor'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import { useSelector } from 'react-redux'
import { fileUrl } from '../../apimanager/httpmanager'
import Appfonts from '../../constants/Appfonts'
import { useTheme } from '@react-navigation/native'

const ProfileC = ({ navigation }) => {
    const user = useSelector((state) => state?.auth?.user);
    let theme = useSelector(state => state.theme?.theme)

    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [profilepic, setProfilepic] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const { Appcolor } = useTheme()

    useEffect(() => {
        if (user?.full_name) {
            setFullname(user?.full_name)
        }
        if (user?.email) {
            setEmail(user?.email)
        }
        if (user?.phone_number) {
            setPhone(user?.phone_number)
        }
        if (user?.profile_pic) {
            setProfilepic(user?.profile_pic)
        }
        if (user?.country_code) {
            setCountryCode(user?.country_code)
        }
    }, [user])

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
            <Header showBack={true} onBackPress={() => navigation.goBack()} title={en?.profile} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ height: 100, width: 100, alignSelf: 'center', borderWidth: 0.6, borderColor: Appcolor.primary, marginVertical: 16, borderRadius: 100 }}>
                    {/* <FastImage source={{ uri: fileUrl + profilepic }} style={{ height: "100%", borderRadius: 100, width: "100%" }} /> */}
                    <FastImage source={profilepic ? { uri: fileUrl + profilepic } : Appimg.avatar} style={{ height: "100%", borderRadius: 100, width: "100%" }} />
                </View>
                <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(14), margin: 18 }]}>{en?.accountinformation}</Text>
                <Tinput
                    place={en?.fullname}
                    img={Appimg.user}
                    value={fullname}
                    editable={false}
                />
                <Tinput
                    place={en?.email}
                    img={Appimg.mail}
                    styleMain={{ marginTop: 16 }}
                    value={email}
                    editable={false}
                />
                <Text style={{ color: Appcolor.txt, fontSize: 10, fontFamily: Appfonts.medium, marginTop: 16, marginLeft: 18 }}>{en?.phonenumber}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 6, marginHorizontal: 18, marginTop: 10, }} >
                    <TouchableOpacity style={{ width: '16%', height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 0.8, borderColor: Appcolor.grad1, backgroundColor: Appcolor.white }}>
                        <Text style={{ color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium }}>
                            {countryCode}
                        </Text>
                    </TouchableOpacity>
                    <View style={{
                        height: 48, width: "80%", borderColor: Appcolor.grad1, borderRadius: 4, borderWidth: 0.8,
                        color: Appcolor.txt, fontSize: 14, fontFamily: Appfonts.medium, flexDirection: "row",
                        paddingLeft: 8, justifyContent: "center", alignItems: "center",
                        backgroundColor: Appcolor.white
                    }}>
                        <TextInput
                            place={en?.phonenumber}
                            placeholderTextColor={Appcolor.txt}
                            value={phone}
                            onChangeText={t => setPhone(t)}
                            keyboardType={"numeric"}
                            maxLength={10}
                            style={{
                                height: 48, width: "90%", color: Appcolor.txt, fontSize: 14, paddingLeft: 8, fontFamily: Appfonts.medium
                            }}
                            autoCapitalize={"none"}
                            editable={false}
                        >
                        </TextInput>
                        <Image source={Appimg.phone} style={{ height: 14, width: 14, marginRight: 8 }} />
                    </View>
                </View>
                <Btn title={en?.edit} transparent={Appcolor.blackop} twhite styleMain={{ alignSelf: "center", marginVertical: 60 }}
                    onPress={() => navigation.navigate("EditProfileC")}
                />
            </ScrollView>
        </ImageBackground>
    )
}

export default ProfileC

const styles = StyleSheet.create({})