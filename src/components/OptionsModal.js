import { Image, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Appcolor from '../constants/Appcolor'
import { RFValue } from 'react-native-responsive-fontsize'
import Appfonts from '../constants/Appfonts'
import en from '../translation'
import Appimg from '../constants/Appimg'
import AppUtils from '../utils/apputils'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'

// const OptionsModal = ({ visible, onPressOpt, onPressCancel }) => {
//     return (
//         <Modal visible={visible} transparent={true} animationType='fade'>
//             <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)" }}>
//                 <Pressable style={{ minHeight: 40, width: "92%", backgroundColor: Appcolor.lessDark, padding: 12, borderRadius: 6 }}>
//                     <Text style={{ fontFamily: Appfonts.bold, fontSize: RFValue(16), color: Appcolor.white, textAlign: "center" }}>
//                         {en?.AddMedia}
//                     </Text>
//                     <TouchableOpacity style={{ position: "absolute", right: 12, top: 12 }} onPress={onPressCancel}>
//                         <Image source={Appimg.cancel} style={{ height: 26, width: 26 }} />
//                     </TouchableOpacity>
//                     <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", alignSelf: "center", width: "86%", marginVertical: 18 }}>
//                         <OptBlock title={en?.camera} img={Appimg.camera} onPress={async () => {
//                             let cameraPerm = await AppUtils.cameraPermisssion()
//                             if (!cameraPerm) {
//                                 Linking.openSettings()
//                                 return
//                             }
//                             onPressOpt("camera"); onPressCancel()
//                         }}
//                         />
//                         <OptBlock title={en?.photos} img={Appimg.gallery}
//                             onPress={async () => {
//                                 let galleryPerm = await AppUtils.galleryPermisssion()
//                                 if (!galleryPerm) {
//                                     Linking.openSettings()
//                                     return
//                                 }
//                                 onPressCancel();
//                                 onPressOpt("gallery"); 
//                             }}
//                         />
//                         <OptBlock title={en?.Gallery} img={Appimg.library} onPress={() => { onPressOpt("library"); onPressCancel() }} />

//                         {/* <OptBlock title={en?.Video} img={Appimg.library} onPress={() => { onPressOpt("video"); onPressCancel() }} /> */}
//                     </View>
//                 </Pressable>
//             </Pressable>
//         </Modal>
//     )
// }

// export default OptionsModal

// const styles = StyleSheet.create({
//     iconTxts: {
//         fontSize: RFValue(10),
//         fontFamily: Appfonts.medium,
//         color: Appcolor.white,
//         marginTop: 8,
//     },
//     icons: { height: 56, width: 56, resizeMode: "contain" },
// })

// const OptBlock = ({ img, title, onPress }) => {
//     return (
//         <TouchableOpacity style={{ alignItems: "center" }} onPress={onPress}>
//             <Image source={img} style={styles.icons} />
//             <Text style={styles.iconTxts}>
//                 {title}
//             </Text>
//         </TouchableOpacity>
//     )
// }

// position:"absolute",
//   height:heightPercentageToDP(100),
//   width:widthPercentageToDP(100),
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',



const OptionsModal = ({ visible, onPressOpt, onPressCancel }) => {
    return (
       visible && <View  style={{
position:"absolute",
  height:heightPercentageToDP(100),
  width:"100%",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1

       }}>
            <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center", }}>
                <Pressable style={{ minHeight: 40, width: widthPercentageToDP(90), backgroundColor: Appcolor.lessDark, alignItems:"center",justifyContent:"center",alignContent:"center", padding: 12, borderRadius: 6 ,marginTop:heightPercentageToDP(-10)}}>
                    <Text style={{ fontFamily: Appfonts.bold, fontSize: RFValue(16), color: Appcolor.white, textAlign: "center" }}>
                        {en?.AddMedia}
                    </Text>
                    <TouchableOpacity style={{ position: "absolute", right: 12, top: 12 }} onPress={onPressCancel}>
                        <Image source={Appimg.cancel} style={{ height: 26, width: 26 }} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", alignSelf: "center",width:"86%", marginVertical: 18 }}>
                        <OptBlock title={en?.camera} img={Appimg.camera} onPress={async () => {
                            let cameraPerm = await AppUtils.cameraPermisssion()
                            if (!cameraPerm) {
                                Linking.openSettings()
                                return
                            }
                            onPressOpt("camera"); onPressCancel()
                        }}
                        />
                        <OptBlock title={en?.photos} img={Appimg.gallery}
                            onPress={async () => {
                                let galleryPerm = await AppUtils.galleryPermisssion()
                                if (!galleryPerm) {
                                    Linking.openSettings()
                                    return
                                }
                                onPressCancel();
                                onPressOpt("gallery"); 
                            }}
                        />
                        <OptBlock title={en?.Gallery} img={Appimg.library} onPress={() => { onPressOpt("library"); onPressCancel() }} />

                        <OptBlock title={en?.Video} img={Appimg.library} onPress={() => { onPressOpt("video"); onPressCancel() }} />
                    </View>
                </Pressable>
            </Pressable>
        </View>
    )
}

export default OptionsModal

const styles = StyleSheet.create({
    iconTxts: {
        fontSize: RFValue(10),
        fontFamily: Appfonts.medium,
        color: Appcolor.white,
        marginTop: 8,
    },
    icons: { height: 56, width: 56, resizeMode: "contain" },
})

const OptBlock = ({ img, title, onPress }) => {
    return (
        <TouchableOpacity style={{ alignItems: "center" }} onPress={onPress}>
            <Image source={img} style={styles.icons} />
            <Text style={styles.iconTxts}>
                {title}
            </Text>
        </TouchableOpacity>
    )
}