import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import en from '../../translation'
import Header from '../../components/Header'
import Commonstyles from '../../constants/Commonstyles'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import PasswordUpdated from '../../components/PasswordUpdated'
import { useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { contactusStylist } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { setLoading } from '../../redux/load'

const ContactusS = ({ navigation }) => {
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()
    let theme = useSelector(state => state.theme)?.theme
    const user = useSelector(state => state?.auth?.user)
    const [sentModal, setSentModal] = useState(false)
    const [email, setEmail] = useState("")
    const [fullname, setFullname] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (user?.email) {
            setEmail(user?.email)
        }
        if (user?.full_name) {
            setFullname(user?.full_name)
        }
    }, [user])

    const submit = async () => {
        if (email == "" || fullname == "") {
            showToast("Something went wrong.")
            return
        }
        if (message.trim() == "") {
            showToast("Please enter a message.")
            return
        }
        let body = {
            email: email, full_name: fullname, message: message
        }
        try {
            dispatch(setLoading(true))
            let res = await contactusStylist(body)
            if (res?.data?.status) {
                setTimeout(() => {
                    setSentModal(true)
                }, 400);
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    return (
        <ImageBackground style={{ flex: 1, backgroundColor: Appcolor.white }} source={Appimg.darkbg}>
            <Header title={en?.contactus} showBack={true} onBackPress={() => navigation.goBack()} />
            <PasswordUpdated vis={sentModal} title="Message sent Successfully" btnTitle="Done" desc={"Message sent successfully & We'll get back to you within 48 hours"}
                onPressDone={() => { setSentModal(false); navigation.goBack() }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <Text style={[Commonstyles(Appcolor).bold20, { marginHorizontal: 18, marginTop: 18, fontSize: 18 }]}>{en?.sendmessage}</Text>
                <Text style={[Commonstyles(Appcolor).regular12, { marginHorizontal: 18, width: "76%", marginTop: 8 }]}>{en?.contactustxt}</Text>
                <Tinput place={en?.fullname} styleMain={{ marginTop: 18 }} img={Appimg.user} value={fullname} editable={false} />
                <Tinput place={en?.email} styleMain={{ marginTop: 18 }} img={Appimg.mail} value={email} editable={false} />
                <Text style={[Commonstyles(Appcolor).regular12, { marginHorizontal: 18, width: "76%", marginTop: 8 }]}>{en?.message}</Text>
                <TextInput
                    placeholder={en?.yourmessage}
                    placeholderTextColor={Appcolor.txt}
                    style={{ borderWidth: 0.8, color: Appcolor.txt, padding: 8, borderRadius: 4, borderColor: Appcolor.primary, marginHorizontal: 18, height: 140, borderColor: Appcolor.primary, marginTop: 8, backgroundColor: Appcolor.white }}
                    multiline={true}
                    textAlignVertical="top"
                    value={message}
                    onChangeText={(t) => { setMessage(t) }}
                />
                <Btn transparent={Appcolor.blackop} title={en?.send} styleMain={{ alignSelf: "center", marginVertical: 80 }} twhite
                    onPress={() => {
                        submit()
                    }}
                />
            </ScrollView>
        </ImageBackground>
    )
}

export default ContactusS

const styles = StyleSheet.create({})