import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import en from '../../translation'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import PasswordUpdated from '../../components/PasswordUpdated'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import showToast from '../../CustomToast'
import { changePasswordClient } from '../../apimanager/httpServices'
import { signout } from '../../redux/auth'
import { clearAll } from '../../utils/asyncstore'
import { useTheme } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppUtils from '../../utils/apputils'

const ChangePasswordC = ({ navigation }) => {
    const dispatch = useDispatch()
    const [showModal, setShowModal] = useState(false)
    const [oldP, setOldP] = useState("")
    const [newP, setNewP] = useState("")
    const [conP, setConP] = useState("")
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme

    const submit = async () => {
        if (oldP.trim() == "" || newP.trim() == "" || conP == "") {
            showToast("All fields are required.")
            return
        }
        let regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
        if (!AppUtils.validatePassword(newP)) {
            showToast("Password must contain at least 8 characters, including one letter and one digit.")
            return
        }
        if (newP?.length < 6) {
            showToast("Password must be at least 6 characters long.")
            return
        }
        if (newP.trim() != conP) {
            showToast("Passwords doesnot match.")
            return
        }
        try {
            dispatch(setLoading(true))
            let res = await changePasswordClient({ old_password: oldP, new_password: newP })
            if (res?.data?.status) {
                setShowModal(true)
            } else {
                showToast(res?.data?.message)
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor?.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header title={en?.changepassword} showBack={true} onBackPress={() => navigation.goBack()} />
            <PasswordUpdated vis={showModal}
                onPressDone={() => {
                    setShowModal(false);
                    setTimeout(() => {
                        navigation?.goBack()
                        // navigation.replace("LoginC")
                        // dispatch(signout())
                        // clearAll()
                        // AsyncStorage.removeItem("@tokens")
                    }, 200);
                }}
            />
            <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <Text style={[Commonstyles(Appcolor).bold20, { fontSize: 18, margin: 18 }]}>{en?.changepassword}</Text>
                <Text style={[Commonstyles(Appcolor).regular12, { marginHorizontal: 18 }]}>{en?.enternewpassword}</Text>
                <Tinput
                    place={en?.oldpassword}
                    secure styleMain={{ marginTop: 20 }}
                    value={oldP}
                    onChangeText={t => setOldP(t)}
                />
                <Tinput
                    place={en?.newpassword}
                    secure styleMain={{ marginTop: 16 }}
                    value={newP}
                    onChangeText={t => setNewP(t)}
                />
                <Tinput
                    place={en?.confirmpassword}
                    secure styleMain={{ marginTop: 16 }}
                    value={conP}
                    onChangeText={t => setConP(t)}
                />
                <Btn title={en?.continue} styleMain={{ alignSelf: "center", marginTop: heightPercentageToDP(25), marginBottom: 50 }} transparent={Appcolor.blackop} twhite
                    onPress={() => {
                        submit()
                    }}
                />
            </KeyboardAwareScrollView>
        </ImageBackground>
    )
}

export default ChangePasswordC

const styles = StyleSheet.create({})