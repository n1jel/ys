import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Video from 'react-native-video';
import { fileUrl } from "../apimanager/httpmanager";
import { heightPercentageToDP } from "react-native-responsive-screen";
import Header from "../components/Header";
import Appcolor from "../constants/Appcolor";

const VideoPlayer = ({ route, navigation }) => {
    const { media } = route?.params
    return (
        <SafeAreaView style={{ backgroundColor: Appcolor.txt }}>
            <Header title={"Video"} onBackPress={() => { navigation?.goBack() }} showBack={true} />
            <View style={{ height: 10 }} />
            <Video
                source={{ uri: fileUrl + media }} style={{ height: heightPercentageToDP(90) }}
                controls={true}
                resizeMode={'contain'}
            />
        </SafeAreaView>
    )
}

const style = StyleSheet.create({})

export default VideoPlayer;