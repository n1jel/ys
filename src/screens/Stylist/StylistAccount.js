import { Alert, FlatList, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Searchbar from '../../components/Searchbar'
import Appimg from '../../constants/Appimg'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import LikedItemModal from '../../components/LikedItemModal'
import Header from '../../components/Header'
import Appcolor from '../../constants/Appcolor'
import Appfonts from '../../constants/Appfonts'
import { RFValue } from 'react-native-responsive-fontsize'
import Btn from '../../components/Btn'
import en from '../../translation'
import AddStylistModel from '../../components/AddStylist'
import Commonstyles from '../../constants/Commonstyles'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/load'
import { AddCompanyStylist, DeleteCompanyStylist, GetCollection, GetCompanyStylist } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'

const StylistAccount = ({ navigation }) => {
    const dispatch = useDispatch()
    const [showAddStylistModel, setShowAddStylistModel] = useState(false)
    const [collection, setCollection] = useState([])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const { Appcolor } = useTheme()
    let theme = useSelector(state => state.theme)?.theme

    useFocusEffect(useCallback(() => {
        get_collection()
    }, []))

    async function get_collection() {
        dispatch(setLoading(true))
        let res = await GetCompanyStylist()
        console.log(res, 'GetCompanyStylist')
        try {
            if (res?.data?.status) {
                setCollection([...res.data.data])
                // showToast(res?.data?.message);
            } else {
                setCollection([])
                // showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }

    }

    async function on_add(full_name, email) {
        if (full_name.trim() == "") {
            showToast("Name is required.")
            return
        }
        if (email == "") {
            showToast("Email is required.")
            return
        }
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!reg.test(email)) {
            showToast("Email not valid")
            return
        }
        let data = {
            full_name,
            email
        }
        try {
            dispatch(setLoading(true))
            let res = await AddCompanyStylist(data)
            console.log(res, 'ress')
            if (res?.data?.status) {
                get_collection()
                setShowAddStylistModel(false)
                // showToast(res?.data?.message);
            } else {
                setShowAddStylistModel(false)
                showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
            setEmail("")
            setName("")
        }
    }

    async function on_delete(item) {
        dispatch(setLoading(true))
        let res = await DeleteCompanyStylist(item._id)
        console.log(res, 'DeleteCompanyStylist')
        try {
            if (res?.data?.status) {
                get_collection()
                showToast(res?.data?.message);
            } else {
                // showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }

    }
    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Stylist Accounts"} showBack={true} onBackPress={() => { navigation.goBack() }} />
            <AddStylistModel vis={showAddStylistModel}
                value={name} onChangeText={(t) => { setName(t) }}
                email={email} onChangeEmail={(t) => { setEmail(t) }}
                onPressOut={() => { setShowAddStylistModel(false) }}
                onPress={() => { on_add(name, email) }}
            />
            <View>
                <Text style={styles(Appcolor).txtStyle2}>Add Stylist</Text>
                <Text style={styles(Appcolor).txtStyle1}>Add stylist email to give access for your Season.</Text>
            </View>
            <FlatList
                data={collection}
                contentContainerStyle={{ marginTop: 18 }}
                renderItem={({ item, index }) => {
                    return (
                        <View style={[styles(Appcolor).flatcontainer, Commonstyles(Appcolor).shadow]}>
                            <View>
                                <Text style={styles(Appcolor).texttitle}>{item.full_name}</Text>
                                <Text style={styles(Appcolor).textemail}>{item.email}</Text>
                            </View>
                            <Pressable onPress={() => {
                                Alert.alert(
                                    en.areyousure,
                                    en.deletestylist,
                                    [
                                        // The "Yes" button
                                        {
                                            text: en.yes,
                                            onPress: () => {
                                                on_delete(item)
                                            },
                                        },
                                        // The "No" button
                                        // Does nothing but dismiss the dialog when tapped
                                        {
                                            text: en.No,
                                        },
                                    ]
                                );
                            }} style={styles(Appcolor).btndelete}>
                                <Text style={styles(Appcolor).txtStyle}>Delete</Text>
                            </Pressable>
                        </View>
                    );
                }}
                ListFooterComponent={() => {
                    return (
                        <Btn transparent={Appcolor.blackop} title={en?.addnew} twhite
                            styleMain={{ alignSelf: "center", marginTop: heightPercentageToDP(5) }}
                            onPress={() => {
                                setShowAddStylistModel(true)
                            }}
                        />
                    )
                }}
            />
        </ImageBackground>
    )
}

export default StylistAccount

const styles = (Appcolor) => StyleSheet.create({
    txtStyle2: {
        color: Appcolor.txt,
        fontFamily: Appfonts.bold,
        fontSize: RFValue(14),
        marginTop: 20,
        marginLeft: 18
    },
    txtStyle1: {
        color: Appcolor.txt,
        fontFamily: Appfonts.regular,
        fontSize: RFValue(10),
        marginLeft: 18
    },
    flatcontainer: {
        paddingVertical: 14,
        paddingHorizontal: 8,
        width: widthPercentageToDP(90),
        alignSelf: "center",
        backgroundColor: Appcolor.white,
        marginBottom: 18,
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 4,
        flexDirection: "row"
    },
    texttitle: {
        color: Appcolor.txt,
        fontFamily: Appfonts.semiBold,
        fontSize: RFValue(12),
    },
    textemail: {
        color: Appcolor.txt,
        fontFamily: Appfonts.regular,
        fontSize: RFValue(9),
        marginTop: 4
    },
    btndelete: {
        padding: 8,
        width: widthPercentageToDP(25),
        borderWidth: heightPercentageToDP(0.2),
        borderRadius: heightPercentageToDP(3),
        borderColor: "red",
        alignItems: "center",
        justifyContent: "center",
    },
    txtStyle: {
        color: "red",
        fontFamily: Appfonts.regular,
        fontSize: RFValue(9),
    }
})