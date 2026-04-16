import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appcolor from '../../constants/Appcolor';
import Appimg from '../../constants/Appimg';
import Header from '../../components/Header';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../../redux/load';
import { termsStylist } from '../../apimanager/httpServices';
import RenderHtml from 'react-native-render-html';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import Commonstyles from '../../constants/Commonstyles';

const TermsS = ({ navigation, route }) => {
    const { from } = route?.params
    const dispatch = useDispatch()
    const { Appcolor } = useTheme()
    const theme = useSelector(state => state.theme)?.theme
    const [allData, setAllData] = useState("")

    useEffect(() => {
        getAllData()
    }, [])

    const source = {
        html: allData
    };
    const tagsStyles = {
        body: {
            whiteSpace: 'normal',
            color: 'white'
        },
    };

    const getAllData = async () => {
        try {
            dispatch(setLoading(true))
            let res = await termsStylist()
            if (res?.data?.status) {
                let data = res?.data?.data
                if (data) {
                    if (from == "terms") {
                        setAllData(data?.client_terms)
                    }
                    if (from == "privacy") {
                        setAllData(data?.client_privacy)
                    }
                }
            } else {
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
                title={from == "terms" ? "Terms & Conditions" : "Privacy Policy"}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                {allData == "" && <Text style={[Commonstyles(Appcolor).bold20, { textAlign: 'center', marginTop: 16, }]}>No data found.</Text>}
                <RenderHtml
                    contentWidth={widthPercentageToDP(100)}
                    source={source}
                    defaultTextProps={{ maxFontSizeMultiplier: 2 }}
                    tagsStyles={tagsStyles}
                />
            </ScrollView>
        </ImageBackground>
    )
}

export default TermsS

const styles = StyleSheet.create({})