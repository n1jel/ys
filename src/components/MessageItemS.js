import { useTheme } from "@react-navigation/native"
import moment from "moment"
import { Platform, TouchableOpacity, View, Text, Image, StyleSheet } from "react-native"
import { RFValue } from "react-native-responsive-fontsize"
import { fileUrl } from "../apimanager/httpmanager"
import Appfonts from "../constants/Appfonts"
import Appimg from "../constants/Appimg"

export default function MessageItemS({ item, onPress }) {
    const { Appcolor } = useTheme()
    return (
        <TouchableOpacity
            key={"id"}
            style={{
                flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: Appcolor.white, marginHorizontal: 16, justifyContent: 'space-between', padding: 10, borderRadius: 4,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.20,
                shadowRadius: 1.41,

                elevation: 2,

            }}
            onPress={onPress}
        >
            <View style={{ height: 56, width: 56, borderRadius: 50 }}>
                <Image source={item?.user?.profile_pic == '' ? Appimg.avatar : { uri: fileUrl + item?.user?.profile_pic }} style={{ height: 56, width: 56, borderRadius: 50 }} />
                {/* <View style={{ height: 14, width: 14, borderRadius: 10, backgroundColor: true ? '#76C00D' : "#D3D3D3", position: 'absolute', bottom: 0, right: 0 }} /> */}

            </View>
            <View style={{ width: "57%", maxWidth: "57%" }}>
                <Text style={styles(Appcolor).txtBig}>{item?.user?.full_name}</Text>
                <Text style={[styles(Appcolor).txtSmall, { marginTop: 4 }]} numberOfLines={1}>{item?.lastMessage.text}</Text>
            </View>
            <View style={{ alignItems: 'center', width: "20%", height: "100%" }}>
                <Text style={[styles(Appcolor).txtSmall, { fontSize: 8, color: Appcolor.txt, fontFamily: Appfonts.semiBold, marginBottom: 4 }]}>{moment(item.lastMessage._id * 1000).fromNow()}</Text>
                {item?.unreadCount > 0 ? <View
                    style={{
                        height: 20,
                        width: 20,
                        borderRadius: 20,
                        backgroundColor: Appcolor.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: Platform.OS == 'ios' ? 6 : 10,
                    }}>
                    <Text
                        style={{
                            textAlign: 'center',
                            fontSize: 10,
                            fontFamily: Appfonts.MontMed,
                            color: Appcolor.white,
                        }} allowFontScaling={false}>
                        {item?.unreadCount}
                    </Text>
                </View> : <View style={{
                    height: 20,
                    width: 20,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: Platform.OS == 'ios' ? 6 : 10,
                }} />}
            </View>
        </TouchableOpacity>
    )
}


const styles = (Appcolor) => StyleSheet.create({
    txtBig: {
        fontFamily: Appfonts.semiBold, fontSize: RFValue(14), color: Appcolor.txt
    },
    txtSmall: {
        fontFamily: Appfonts.regular, fontSize: RFValue(12), color: Appcolor.txt
    }
})