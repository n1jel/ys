import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Appimg from '../../constants/Appimg'
import Appcolor from '../../constants/Appcolor'
import Header from '../../components/Header'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import Btn from '../../components/Btn'
import DeleteModal from '../../components/DeleteModal'
import { useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { deleteAccountStylist } from '../../apimanager/httpServices'
import { signout } from '../../redux/auth'
import { clearAll } from '../../utils/asyncstore'
import { setUnreadChats } from '../../redux/CommanReducer'
import showToast from '../../CustomToast'

const DeleteAccountS = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme
    const [reason, setReason] = useState("")
    const [deleteAccountModal, setDeleteAccountModal] = useState(false)

    const submit = async () => {
        if (reason?.trim() == "") {
            showToast("Please add a reason.")
            return
        }
        let body = {
            delete_reason: reason.trim()
        }
        try {
            dispatch(setLoading(true))
            let res = await deleteAccountStylist(body)
            if (res?.data?.status) {
                dispatch(signout())
                dispatch(setUnreadChats(0))
                clearAll()
                showToast(res?.data?.message ?? "Account deleted sucessfully")
                navigation.navigate("LoginS")
            } else {
                setDeleteAccountModal(false)
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1}>
            <Header showBack={true}
                onBackPress={() => {
                    navigation.goBack()
                }}
                title={"Delete Account"}
            />
            <DeleteModal
                vis={deleteAccountModal}
                onPressOut={() => setDeleteAccountModal(false)}
                onPressDlt={() => {
                    setDeleteAccountModal(false)
                    setTimeout(() => {
                        submit()
                    }, 300);
                }}
                onPresscancel={() => setDeleteAccountModal(false)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[Commonstyles(Appcolor).bold20, { marginHorizontal: 18, marginTop: 18 }]}>{en?.reasontodelete}</Text>
                <Text style={[Commonstyles(Appcolor).regular12, { lineHeight: 20, marginHorizontal: 18, marginTop: 8 }]}>{en?.accountdeletetxt}</Text>
                <TextInput
                    placeholder='I am deleting this account because…' placeholderTextColor={Appcolor.txt}
                    style={{ height: 200, color: Appcolor.txt, borderWidth: 0.8, padding: 6, borderColor: Appcolor.primary, marginHorizontal: 18, borderRadius: 6, marginTop: 18, backgroundColor: Appcolor.white }}
                    textAlignVertical={"top"}
                    multiline={true}
                    value={reason}
                    onChangeText={(t) => setReason(t)}
                />
                <Btn transparent={Appcolor.primary} title={en?.deleteaccount} twhite styleMain={{ marginTop: 100, alignSelf: "center" }}
                    onPress={() => {
                        setDeleteAccountModal(true)
                    }}
                />
            </ScrollView>
        </ImageBackground>
    )
}

export default DeleteAccountS

const styles = StyleSheet.create({})