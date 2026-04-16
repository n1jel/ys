import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import Appcolor from '../../constants/Appcolor'
import Appimg from '../../constants/Appimg'
import { SafeAreaView } from 'react-native-safe-area-context'
import Commonstyles from '../../constants/Commonstyles'
import en from '../../translation'
import Tinput from '../../components/Tinput'
import Btn from '../../components/Btn'
import PasswordresetModal from '../../components/PasswordresetModal'
import { new_passwordclient } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { setLoading } from '../../redux/load'
import { useDispatch } from 'react-redux'
import { useTheme } from '@react-navigation/native'

const NewPasswordC = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const [sucessModal, setSucessModal] = useState(false)
  const [password, setpassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const { Appcolor } = useTheme()

  async function ResetPass() {
    try {
      dispatch(setLoading(true))
      if (password.trim() === newpassword.trim()) {
        let res = null;
        res = await new_passwordclient(route?.params?.id, password);
        console.log(res, "res password");
        if (res?.data?.status) {
          setTimeout(() => {
            setSucessModal(true);
          }, 800);
        } else {
          showToast(res.data.message);
        }
      } else {
        showToast("Password does't Match!");
      }
    } catch (error) {
    } finally {
      dispatch(setLoading(false))
    }
  }
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Appcolor.white }}>
      <PasswordresetModal vis={sucessModal} onPress={() => {
        setSucessModal(false)
        setTimeout(() => {
          navigation.replace("LoginC")
        }, 400);
      }} />
      <ImageBackground source={Appimg?.darkbg} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Pressable style={{ margin: 18 }} onPress={() => navigation.navigate("Loginas")}>
            <Image source={Appimg?.back} style={{ height: 26, width: 26 }} />
          </Pressable>
          <Text style={[Commonstyles(Appcolor)?.bold20, { marginHorizontal: 18, marginTop: 20 }]}>{en?.newpassword}</Text>
          <Text style={[Commonstyles(Appcolor)?.regular12, { marginTop: 8, marginHorizontal: 18, width: '76%', lineHeight: 20 }]}>{en?.newpasswordtxt}</Text>
          <Tinput onChangeText={(t) => setpassword(t)} place={en?.password} styleMain={{ marginTop: 26 }} secure />
          <Tinput onChangeText={(t) => setnewpassword(t)} place={en?.confirmpassword} styleMain={{ marginTop: 18 }} secure />
          <Btn title={en?.confirm} transparent={Appcolor.blackop} twhite styleMain={{ marginTop: 200, alignSelf: "center" }}
            onPress={() => {
              if (password == "") {
                showToast("Please Enter password");
                return
              }
              let regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
              if (!regex.test(password)) {
                showToast("Password must contain at least 8 characters, including one letter and one digit.")
                return
              }
              if (password?.length < 6) {
                showToast("Password must be at least 6 characters long.")
                return
              }
              if (newpassword == "") {
                showToast("Please Enter confirm password");
                return
              }
              if (password != newpassword) {
                showToast("password not match");
                return
              }
              ResetPass()
            }
            }
          />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default NewPasswordC

const styles = StyleSheet.create({})