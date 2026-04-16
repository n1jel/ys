import { FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import Header from '../../components/Header'
import en from '../../translation'
import Appcolor from '../../constants/Appcolor'
import { useDispatch, useSelector } from 'react-redux'
import ClientBlock from '../../components/ClientBlock'
import Searchbar from '../../components/Searchbar'
import { useFocusEffect } from '@react-navigation/native'
import { GetMyClient } from '../../apimanager/httpServices'
import { setLoading } from '../../redux/load'

export default function AllClients({navigation}){
    let dispatch = useDispatch()
    const [client, setclient] = useState([])
    const user = useSelector((state) => state)?.auth?.user;
    const load = useSelector(state => state.load)?.isLoading

    useFocusEffect(useCallback(()=>{

        get_client()
       
    },[]))

    async function get_client(){
        dispatch(setLoading(true))
        let res = await GetMyClient()
      
        try {
            if (res?.data?.status) {
                setclient([...res.data.data])
                // showToast(res?.data?.message);
            } else {
                setclient([])
                // showToast(res?.data?.message);
            }
        } catch (e) {
        } finally {
            dispatch(setLoading(false))
        }
    }

    return(
        <ImageBackground source={Appimg?.bg} resizeMode="cover" style={{ flex: 1, backgroundColor: Appcolor.white }}>
        <Header showBack={true} onBackPress={() => navigation.goBack()} title={en?.Clients} />
        <View style={{marginTop:40}} />
            <Searchbar place={en.Searchclient} />
            <FlatList
                    data={client}
                    numColumns={3}
                    style={{marginTop:20}}
                    ListEmptyComponent={()=>{
                        return (load?null:<Text style={[Commonstyles.bold20, { fontSize: RFValue(14), margin: 18,textAlign:'center' }]}>No Client found</Text>)
                    }}
                    contentContainerStyle={{alignItems:"center"}}
                    renderItem={({item,index})=>{
                        return(
                            <ClientBlock item={item} index={index} />
                        )

                    }}
                    />
        </ImageBackground>
    )
    
}