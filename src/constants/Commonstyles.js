import { StyleSheet } from "react-native";
// import Appcolor from "./Appcolor";
import Appfonts from "./Appfonts";
const Commonstyles =(Appcolor)=> StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
        elevation: 6,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    mediumText: { fontSize: 14, color: Appcolor.txt, fontFamily: Appfonts.medium },
    mediumText10: { fontSize: 10, color: Appcolor.txt, fontFamily: Appfonts.medium },
    mediumText12: { fontSize: 12, color: Appcolor.txt, fontFamily: Appfonts.medium },
    mediumText14: { fontSize: 14, color: Appcolor.txt, fontFamily: Appfonts.medium },
    mediumText16: { fontSize: 16, color: Appcolor.txt, fontFamily: Appfonts.medium },
    mediumText18: { fontSize: 18, color: Appcolor.txt, fontFamily: Appfonts.medium },
    semiBold8: { fontSize: 8, color: Appcolor.txt, fontFamily: Appfonts.semiBold },
    semiBoldIta10: { fontSize: 10, color: Appcolor.txt, fontFamily: Appfonts.semiBoldItalic },
    semiBold26: { fontSize: 26, color: Appcolor.txt, fontFamily: Appfonts.semiBold },
    bold20: { fontSize: 20, color: Appcolor.txt, fontFamily: Appfonts.bold },
    regular12: { fontSize: 12, color: Appcolor.txt, fontFamily: Appfonts.regular },
})
export default Commonstyles