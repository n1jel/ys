import Toast from "react-native-toast-message";
import Appcolor from "./constants/Appcolor";
import Appfonts from "./constants/Appfonts";
import { Text, View } from "react-native";
const toastConfig = {
  tomatoToast: ({ text1, props, }) => (
    <View style={{
      minHeight: 56, paddingHorizontal: 8,
      width: '86%',
      backgroundColor: Appcolor.txt,
      justifyContent: "center",
      borderLeftWidth: 4,
      borderColor: Appcolor.primary,
      borderRadius: 4,
    }}>
      <Text style={{ fontSize: 14, marginLeft: 20, color: Appcolor.white, textTransform: "none", fontFamily: Appfonts.medium }} maxFontSizeMultiplier={1.4}>{text1}</Text>
    </View>
  ),
  success: props => null,
};
export { toastConfig }
const showToast = (msg) => {
  Toast.show({
    text1: msg,
    visibilityTime: 1500,
    position: "bottom",
    type: "tomatoToast"
  });
};
export default showToast;