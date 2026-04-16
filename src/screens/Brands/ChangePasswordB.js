import { ImageBackground, ScrollView, StyleSheet, Text } from 'react-native'
import React, { useState } from 'react'
import en from '../../translation'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import PasswordUpdated from '../../components/PasswordUpdated'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import showToast from '../../CustomToast'
import { setLoading } from '../../redux/load'
import { changePasswordStylist } from '../../apimanager/httpServices'
import { signout } from '../../redux/auth'
import { clearAll } from '../../utils/asyncstore'
import { useTheme } from '@react-navigation/native'
import AppUtils from '../../utils/apputils'
import { changePassBrand } from '../../apimanager/brandServices'

const ChangePasswordB = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const theme = useSelector(state => state.theme)?.theme

    const [showModal, setShowModal] = useState(false)
    const [oldP, setOldP] = useState("")
    const [newP, setNewP] = useState("")
    const [conP, setConP] = useState("")

    const validate = () => {
        if (oldP.trim() == "") {
            showToast("Old password is required.")
            return
        }
        if (newP.trim() == "") {
            showToast("New password is required.")
            return
        }
        if (!AppUtils.validatePassword(newP)) {
            showToast("Password must contain at least 8 characters, including one letter and one digit.")
            return
        }
        if (newP?.length < 6) {
            showToast("Password must be at least 6 characters long.")
            return
        }
        if (conP?.trim() == "") {
            showToast("Confirm password is required.")
            return
        }
        if (newP.trim() != conP) {
            showToast("Passwords doesnot match.")
            return
        }
        submit()
    }
    const submit = async () => {
        try {
            dispatch(setLoading(true))
            let res = await changePassBrand({ old_password: oldP, new_password: newP })
            console.log(res);
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
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header title={en?.passwordchange} showBack={true} onBackPress={() => navigation.goBack()} />
            <PasswordUpdated vis={showModal}
                onPressDone={() => {
                    setShowModal(false);
                    setTimeout(() => {
                        navigation?.goBack()

                        // navigation.replace("LoginB")
                        // dispatch(signout())
                        // clearAll()
                    }, 200);
                }}
            />
            <ScrollView
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
                <Btn transparent={Appcolor.blackop} title={en?.continue} styleMain={{ alignSelf: "center", marginTop: heightPercentageToDP(25), marginBottom: 50 }} twhite
                    onPress={() => validate()}
                />
            </ScrollView>
        </ImageBackground>
    )
}

export default ChangePasswordB

const styles = StyleSheet.create({})