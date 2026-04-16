import { PermissionsAndroid, Platform } from "react-native";
import showToast from "../CustomToast";
import { PERMISSIONS, check, request } from "react-native-permissions";

const AppUtils = {
    validatePassword: (password) => {
        const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regexp.test(password);
    },
    cameraPermisssion: async () => {
        if (Platform?.OS == "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'This app needs access to your camera to take pictures.',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('permission granted');
            } else {
                showToast('No permission to access camera');
            }
            return granted === PermissionsAndroid.RESULTS.GRANTED
        } else {
            let result = await check(PERMISSIONS.IOS.CAMERA)
            if (result != "granted") {
                let stat = await request(PERMISSIONS.IOS.CAMERA)
                return stat == "granted"
            }
            return true
        }
    },
    galleryPermisssion: async () => {
        if (Platform?.OS == "android") {
            const granted = await PermissionsAndroid.request(
                Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Gallery Permission',
                    message: 'This app needs access to your gallery to take pictures.',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('permission granted');
            } else {
                showToast('No permission to access camera');
            }
            return granted === PermissionsAndroid.RESULTS.GRANTED
        } else {
            let result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
            if (result == "limited") {
                return true
            }
            if (result != "granted") {
                let stat = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
                if (stat == "limited") {
                    return true
                }
                return stat == "granted"
            }
            return true
        }
    },
    onlyNumbers: (text) => {
        let numbersOnly = text.replace(/\D/g, '');
        return numbersOnly;
    }
}
export default AppUtils;