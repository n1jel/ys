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
import { addStylistB, deleteBrandStylist, getBrandStylist } from '../../apimanager/brandServices'

const AddStylistsB = ({ navigation }) => {
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()

    const theme = useSelector(state => state.theme)?.theme

    const [showAddStylistModel, setShowAddStylistModel] = useState(false)
    const [collection, setCollection] = useState([])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    useFocusEffect(useCallback(() => {
        get_collection()
    }, []))

    async function get_collection() {
        try {
            dispatch(setLoading(true))
            let res = await getBrandStylist()
            if (res?.data?.status) {
                setCollection(res.data.data)
            } else {
                showToast(res?.data?.message);
                setCollection([])
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function on_add(full_name, email) {
        setShowAddStylistModel(false)
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
        let data = { full_name, email: email?.trim() }
        addData(data)
    }
    const addData = async (data) => {
        try {
            dispatch(setLoading(true))
            let res = await addStylistB(data)
            if (res?.data?.status) {
                get_collection()
                setShowAddStylistModel(false)
            } else {
                setShowAddStylistModel(false)
                showToast(res?.data?.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setEmail("")
            setName("")
            dispatch(setLoading(false))
        }
    }
    async function on_delete(item) {
        try {
            dispatch(setLoading(true))
            let res = await deleteBrandStylist(item._id)
            if (res?.data?.status) {
                get_collection()
                showToast(res?.data?.message);
            } else {
                showToast(res?.data?.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
            <Header title={"Add Employee"} showBack={false} onBackPress={() => { navigation.goBack() }}
                plusimage={true}
                onAddPress={() => {
                    setShowAddStylistModel(true)
                }}
            />
            <AddStylistModel vis={showAddStylistModel}
                value={name} onChangeText={(t) => { setName(t) }}
                email={email} onChangeEmail={(t) => { setEmail(t) }}
                onPressOut={() => { setShowAddStylistModel(false) }}
                onPress={() => { on_add(name, email) }}
            />
            <View>
                <Text style={styles(Appcolor).txtStyle2}>Add Employee</Text>
                <Text style={styles(Appcolor).txtStyle1}>Add employee email to give access for your Season.</Text>
            </View>
            <FlatList
                data={collection}
                contentContainerStyle={{ marginTop: 18 }}
                ListEmptyComponent={() => (<Text style={[styles(Appcolor).txtStyle2, { textAlign: "center" }]}>No Employee Found.</Text>)}
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
                                        {
                                            text: en.yes,
                                            onPress: () => {
                                                on_delete(item)
                                            },
                                        },
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
            />
            <Btn transparent={Appcolor.blackop} title={en?.continue} twhite
                styleMain={{ alignSelf: "center", bottom: heightPercentageToDP(10), position: "absolute" }}
                onPress={() => {
                    navigation.navigate("BottomTabB")
                }}
            />
        </ImageBackground>
    )
}

export default AddStylistsB

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
        paddingHorizontal: 16,
        width: widthPercentageToDP(90),
        alignSelf: "center",
        backgroundColor: Appcolor.lessDark,
        marginBottom: 18,
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
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