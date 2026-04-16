import { FlatList, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import en from '../../translation'
import Commonstyles from '../../constants/Commonstyles'
import { RFValue } from 'react-native-responsive-fontsize'
import Appcolor from '../../constants/Appcolor'
import FastImage from 'react-native-fast-image'
import Btn from '../../components/Btn'
import CustomDrop from '../../components/CustomDrop'
import { useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Appfonts from '../../constants/Appfonts'
import Tinput from '../../components/Tinput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CountryPicker from 'react-native-country-picker-modal'
import { editProfileClient, getuserclientdetail } from '../../apimanager/httpServices'
import showToast from '../../CustomToast'
import { setUser } from '../../redux/auth'
import { setLoading } from '../../redux/load'
import { convertLen, handleInputChange } from '../../utils/utilities'
import AddMeasureMentModal from '../../components/AddMeasureMentModal'

const MeasurementC = ({ navigation }) => {
    const { Appcolor } = useTheme()
    const dispatch = useDispatch()
    const theme = useSelector(state => state.theme?.theme)
    // const user = useSelector(state => state?.auth?.user)

    const [showType, setShowType] = useState("Men")
    const [country, setCountry] = useState("")
    const [countryModal, setCountryModal] = useState(false)
    const [size, setSize] = useState("")
    const [addNewModal, setAddNewModal] = useState(false)
    const [measurment_detail, setMeasurement] = useState(null)
    const [maleM, setMaleM] = useState([{ name: "chest", size: 0, unit: "in", custom: 0 }, { name: "neck", size: 0, unit: "in", custom: 0 }, { name: "wrist", size: 0, unit: "in", custom: 0 }, { name: "bicep", size: 0, unit: "in", custom: 0 }, { name: "sleeve", size: 0, unit: "in", custom: 0 }, { name: "shoe", size: 0, unit: "in", custom: 0 }])
    const [femaleM, setFemaleM] = useState([{ name: "bust", size: 0, unit: "in", custom: 0 }, { name: "waist", size: 0, unit: "in", custom: 0 }, { name: "hips", size: 0, unit: "in", custom: 0 }, { name: "belt", size: 0, unit: "in", custom: 0 }, { name: "bra", size: 0, unit: "in", custom: 0 }, { name: "height", size: 0, unit: "ft", custom: 0 },])
    const [notes, setNotes] = useState("")
    const scrollRef = useRef(false)

    useEffect(() => {
        getUserProfile()
        // if (user?.country) {
        //     setCountry(user?.country)
        // }
        // if (user?.gender) {
        //     setShowType(user?.gender)
        // }
        // if (user?.size) {
        //     setSize(user?.size)
        // }
        // if (user?.measurment_detail) {
        //     setMeasurement(user?.measurment_detail)
        // } else {
        //     let temp = {
        //         hips: { size: 0, type: "cm" },
        //         bust: { size: 0, type: "cm" },
        //         waist: { size: 0, type: "cm" },
        //         shoe: { size: 0, type: "cm" },
        //         belt: { size: 0, type: "cm" },
        //         height: { size: 0, type: "ft" },
        //     }
        //     setMeasurement(temp)
        // }


        // if (user?.male_measurment_detail) {
        //     setMaleM(user?.male_measurment_detail)
        // }
        // if (user?.female_measurment_detail?.length > 0) {
        //     setFemaleM(user?.female_measurment_detail)
        // }
    }, [])

    const getUserProfile = async () => {
        try {
            dispatch(setLoading(true))
            let res = await getuserclientdetail()
            if (res?.data?.status) {
                let user = res?.data?.data
                if (user?.male_measurment_detail) {
                    setMaleM(user?.male_measurment_detail)
                }

                if (user?.female_measurment_detail?.length > 0) {
                    setFemaleM(user?.female_measurment_detail)
                }
                if (user?.notes) {
                    setNotes(user?.notes)
                }
            } else {
                showToast(res?.data?.message ?? "Something went wrong.")
            }
        } catch (e) {
            console.error(e);
        } finally {
            dispatch(setLoading(false))
        }
    }
    const submit = async () => {
        dispatch(setLoading(true))
        let formdata = new FormData()
        // let temp = {
        //     hips: { size: measurment_detail?.hips?.size ?? 0, type: measurment_detail?.hips?.type },
        //     bust: { size: measurment_detail?.bust?.size ?? 0, type: measurment_detail?.bust?.type },
        //     waist: { size: measurment_detail?.waist?.size ?? 0, type: measurment_detail?.waist?.type },
        //     shoe: { size: measurment_detail?.shoe?.size ?? 0, type: measurment_detail?.shoe?.type },
        //     belt: { size: measurment_detail?.belt?.size ?? 0, type: measurment_detail?.belt?.type },
        //     height: { size: measurment_detail?.height?.size ?? 0, type: "ft" },
        // }
        // formdata.append("measurment_detail", JSON.stringify(temp))
        // formdata.append("size", size)
        // formdata.append("country", country)
        // formdata.append("gender", showType)
        formdata.append("male_measurment_detail", JSON.stringify(maleM))
        formdata.append("female_measurment_detail", JSON.stringify(femaleM))
        formdata.append("notes", notes)
        try {
            let res = await editProfileClient(formdata)
            if (res?.data?.status) {
                navigation?.pop()
                showToast("Updated sucessfully")
                dispatch(setUser({ user: res?.data?.data }))
            } else {
                showToast(res?.data?.message ?? "Network error")
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }
    const toggleMeasurements = () => {
        let temp = ["bust", "waist", "hips", "shoe", "belt"];
        let newMeasurement = {};

        temp?.forEach((ele) => {
            let measureName = measurment_detail[ele];
            if (measureName) {
                let type = measureName.type === "cm" ? "in" : "cm";
                let size = convertLen(measureName.size, type, measureName.type);
                newMeasurement[ele] = { size, type };
            }
        });

        newMeasurement.height = measurment_detail?.height;
        setMeasurement(newMeasurement);
    }
    const updateSize = useCallback((newVal, name) => {
        if (showType == "Men") {
            let temp = [...maleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            obj = { ...obj, size: handleInputChange(newVal) }
            temp.splice(ind, 1, obj)
            setMaleM(temp)
        } else {
            let temp = [...femaleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            obj = { ...obj, size: handleInputChange(newVal) }
            temp.splice(ind, 1, obj)
            setFemaleM(temp)
        }
    }, [showType, maleM, femaleM])
    const updateUnit = useCallback((newVal, name) => {
        if (showType == "Men") {
            let temp = [...maleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            let size = convertLen(obj?.size, newVal, obj?.unit)
            obj = { ...obj, unit: newVal, size }
            temp.splice(ind, 1, obj)
            setMaleM(temp)
        } else {
            let temp = [...femaleM]
            let ind = temp.findIndex(x => x?.name == name)
            let obj = temp[ind]
            let size = convertLen(obj?.size, newVal, obj?.unit)
            obj = { ...obj, unit: newVal, size }
            temp.splice(ind, 1, obj)
            setFemaleM(temp)
        }
    }, [showType, maleM, femaleM])
    const addCustomM = (data) => {
        if (showType == "Men") {
            let temp = [...maleM]
            let ind = temp?.findIndex(x => x?.name == data?.name)
            if (ind == -1) {
                temp.push(data)
                setMaleM(temp)
            } else {
                showToast("Attribute already exists")
            }
        } else {
            let temp = [...femaleM]
            let ind = temp?.findIndex(x => x?.name == data?.name)
            if (ind == -1) {
                temp.push(data)
                setFemaleM(temp)
            } else {
                showToast("Attribute already exists")
            }
        }
    }

    return (
        <ImageBackground source={theme == "dark" ? Appimg?.darkbg : Appimg?.bg} resizeMode="cover" style={{ flex: 1 }}>
            <Header showBack={true} onBackPress={() => { navigation.goBack() }} title={en?.measurement}
                plusimage
                onAddPress={() => {
                    setAddNewModal(true)
                }}
            />
            <AddMeasureMentModal vis={addNewModal} onPressOut={() => setAddNewModal(false)} onSubmit={addCustomM} />
            {/* {countryModal && <CountryPicker visible={countryModal} withAlphaFilter={true} onSelect={(t) => { setCountry(t?.name) }} onClose={() => { setCountryModal(false) }} />} */}
            <KeyboardAwareScrollView>
                <Text style={[Commonstyles(Appcolor).bold20, { fontSize: RFValue(16), marginVertical: 12, marginHorizontal: 18 }]}>{en?.mymeasurement}</Text>
                <Text style={[Commonstyles(Appcolor).regular12, { marginHorizontal: 18, fontSize: RFValue(10), lineHeight: 20 }]}>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy.</Text>
                <View style={{ backgroundColor: "transparent", borderWidth: 0.6, borderColor: Appcolor.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 30, marginTop: 30, marginHorizontal: 16 }}>
                    <Pressable
                        style={{ ...styles.userType, backgroundColor: showType == "Men" ? Appcolor.yellowop : null, }}
                        onPress={() => {
                            setShowType("Men")
                        }}
                    >
                        <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Men" ? Appcolor.white : Appcolor.txt }]}>Men</Text>
                    </Pressable>
                    <Pressable
                        style={{ ...styles.userType, backgroundColor: showType == "Women" ? Appcolor.yellowop : null, }}
                        onPress={() => {
                            setShowType("Women")
                        }}
                    >
                        <Text style={[Commonstyles(Appcolor).semiBold8, { fontSize: 12, color: showType == "Women" ? Appcolor.white : Appcolor.txt }]}>Women</Text>
                    </Pressable>
                </View>
                {(showType == "Men" ? maleM : femaleM)?.map((item, index) => {
                    return <Measurements key={item?.name} item={item} index={index} updateSize={updateSize} updateUnit={updateUnit} />
                })}
                <Tinput
                    place={"Notes"}
                    value={notes}
                    onChangeText={(t) => setNotes(t)}
                    multiline={true}
                    styleMain={{ marginTop: 20 }}
                    styleInput={{ minHeight: 120 }}
                    textInputProps={{
                        scrollEnabled: scrollRef.current,
                        onFocus: () => { scrollRef.current = true }
                    }}
                />
                <Btn
                    transparent={Appcolor.blackop} twhite
                    title={en?.save} styleMain={{ alignSelf: "center", marginTop: 20, marginBottom: 100 }}
                    onPress={() => { submit() }}
                />
            </KeyboardAwareScrollView>
        </ImageBackground>
    )
}

export default MeasurementC

const SBtn = ({ val, updateVal, editable }) => {
    const [selected, setSelected] = useState()
    useEffect(() => {
        if (val) {
            setSelected(val)
        }
    }, [val])
    return (
        <View style={[Commonstyles(Appcolor).row]}>
            <Pressable
                onPress={() => {
                    if (editable) {
                        setSelected(en?.in); updateVal(en?.in)
                    }
                }}
                style={{ backgroundColor: selected != en?.in ? Appcolor.white : Appcolor.yellowop, borderWidth: 0.6, borderColor: Appcolor.primary, width: 66, height: 36, justifyContent: "center", alignItems: 'center', borderRadius: 18 }}>
                <Text style={[Commonstyles(Appcolor).mediumText16, { color: selected == en?.in ? Appcolor.white : Appcolor.txt }]}>{en?.in}</Text>
            </Pressable>
            <Pressable
                onPress={() => {
                    if (editable) {
                        setSelected(en?.cm); updateVal(en?.cm)
                    }
                }}
                style={{ backgroundColor: selected != en?.cm ? Appcolor.white : Appcolor.yellowop, borderWidth: 0.6, borderColor: Appcolor.primary, width: 66, marginLeft: 16, height: 36, justifyContent: "center", alignItems: 'center', borderRadius: 18 }}>
                <Text style={[Commonstyles(Appcolor).mediumText16, { color: selected == en?.cm ? Appcolor.white : Appcolor.txt }]}>{en?.cm}</Text>
            </Pressable>
        </View>
    )
}

export const Measurements = ({ item, index, updateSize, updateUnit, editable = true }) => {
    const { Appcolor } = useTheme()
    const [value, setValue] = useState(item?.size?.toString())

    useEffect(() => {
        if (item) {
            setValue(item?.size?.toString())
        }
    }, [item])
    if (editable == false && item?.size == 0) {
        return <></>
    }
    return (
        <View style={{ marginHorizontal: 18, marginTop: 26 }}>
            <View style={[Commonstyles(Appcolor).row, { justifyContent: "space-between" }]}>
                <Text style={[Commonstyles(Appcolor).mediumText16, { textTransform: "capitalize" }]}>{item?.name}</Text>
                {item?.name == "height" ?
                    <Pressable style={{ backgroundColor: Appcolor.yellowop, borderWidth: 0.6, borderColor: Appcolor.primary, width: 66, marginLeft: 16, height: 36, justifyContent: "center", alignItems: 'center', borderRadius: 18 }}>
                        <Text style={[Commonstyles(Appcolor).mediumText16, { color: Appcolor.txt }]}>ft</Text>
                    </Pressable>
                    :
                    <SBtn
                        editable={editable}
                        val={item?.unit}
                        updateVal={(val) => {
                            Boolean(updateUnit) && updateUnit(val, item?.name)
                        }}
                    />
                }
            </View>
            <Tinput
                styleMain={{ marginHorizontal: 0 }}
                keyboard={item?.name == "bra" ? "default" : "numeric"}
                value={value}
                onChangeText={(t) => {
                    Boolean(updateSize) && updateSize(t, item?.name)
                }}
                textInputProps={{
                    onFocus: () => {
                        setValue("")
                    },
                    editable: editable
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    userType: {
        height: 40, width: "50%",
        justifyContent: "center", alignItems: "center",
        borderRadius: 30
    },
    slider: { height: 94, width: "100%", marginTop: 16, resizeMode: "contain" },
    heightview: {
        width: wp(90),
        borderRadius: 15,
        backgroundColor: Appcolor.white,
        alignItems: 'center',
    },
    Scaleimage: {
        width: '100%',
        height: wp(15),
    },
})