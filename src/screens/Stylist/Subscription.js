import { Alert, FlatList, Image, ImageBackground, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Appimg from '../../constants/Appimg'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import LikedItemModal from '../../components/LikedItemModal'
import Header from '../../components/Header'
import Appcolor from '../../constants/Appcolor'
import Appfonts from '../../constants/Appfonts'
import Btn from '../../components/Btn'
import en from '../../translation'
import { RFValue } from 'react-native-responsive-fontsize'
import Commonstyles from '../../constants/Commonstyles'
import { useTheme } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import * as RNIap from 'react-native-iap';
import { setLoading } from '../../redux/load'
import { buySubscription } from '../../apimanager/httpServices'
import moment from 'moment'
import { setUser } from '../../redux/auth'

const Subscripton = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const from = route?.params?.from || "signup"
  const user = useSelector((state) => state?.auth?.user);
  const [selected, setselected] = useState("For Personal Use");
  const {
    connected,
    subscriptions,
    getSubscriptions,
    currentPurchase,
    finishTransaction,
  } = RNIap.useIAP();

  const [tab, setTab] = useState([
    { tabs: "For Personal Use", },
    { tabs: "For Company", },
  ]);
  const { Appcolor } = useTheme()
  let theme = useSelector(state => state.theme?.theme)
  const [plan, setplan] = useState("");

  useEffect(() => {
    initIAP();
  }, []);

  const initIAP = async () => {
    // for three months plan add this="threemonth_sub"
    const itemSubs = Platform.select({
      ios: ["yearly_sub", "monthly_sub"],
      android: ["yearly_sub", "monthly_sub"],
    });
    try {
      InitiateSubscription(itemSubs);
    } catch (err) {
      console.log(err, 'err');
    }
  };
  const [allsub, setallsub] = useState([])
  const InitiateSubscription = async itemSubs => {
    RNIap.initConnection().then(async () => {
      try {
        const response = await RNIap.getSubscriptions({ skus: itemSubs });
        // console.log(response, 'ressss');
        if (Platform.OS == 'android') {
          await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        } else {
          await RNIap.clearTransactionIOS();
        }
        setallsub(response);
      } catch (error) {
        console.log('Failed to get products: ', error);
      }
    });
  };

  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.productId) {
          console.log('i m before finish transaction');
          purchase_Sub(currentPurchase)
          let a = await finishTransaction({
            purchase: currentPurchase,
          });
          console.log('i m after finish transaction', a);
          //setOwnedSubscriptions(prev => [...prev, currentPurchase?.productId]);
        }
      } catch (error) {
        if (error instanceof RNIap.PurchaseError) {
          console.log(error);
          //errorLog({ message: `[${error.code}]: ${error.message}`, error });
        } else {
          //errorLog({ message: 'handleBuyProduct', error });
          console.log(error);
        }
      }
    };

    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  async function purchase_Sub(body) {
    let res = null

    let data = {
      platform: Platform.OS,
      next_payment_date: moment(body?.transactionDate).add(1, "month").unix() * 1000,
      productId: body?.productId,
      iosOriginalTransactionId: body?.originalTransactionIdentifierIOS ?? "",
      androidPurchaseToken: body?.purchaseToken ?? ""
    }

    if (user?.subscription?.purchased_history != "1" || user?.subscription?.purchased_history != 1) {
      data = { ...data, trial_start_date: body?.transactionDate, trial_end_date: moment(body?.transactionDate).add(1, "month").unix() * 1000 }
    } else {
      data = {
        ...data,
        latest_payment_date: body?.transactionDate

      }
    }

    res = await buySubscription(data)
    if (res?.data?.status) {
      dispatch(setUser({ user: res?.data?.data }))
      navigation.navigate("BottomTabS")

    } else {

    }
    console.log(res);
  }
  useEffect(() => {
    //For android to get pricing details
    // isAndroid && console.log(subscriptions[0].subscriptionOfferDetails[0].pricingPhases)
    // setPlans(subscriptions);
  }, [subscriptions]);

  const requestSubscription = async iosPkgID => {
    navigation.navigate("BottomTabS")
    return
    try {
      dispatch(setLoading(true))
      const product = await RNIap.requestSubscription(
        Platform.OS == 'ios'
          ? { sku: plan?.productId }
          : {
            sku: plan?.productId,
            subscriptionOffers: [{ sku: plan?.productId, offerToken: plan?.subscriptionOfferDetails?.[1]?.offerToken }],
          },
      )
        .then(i => {
          dispatch(setLoading(false))
          console.log(i, "LLLLLLLLLL");
          console.log(product, "KKKKKKK");
          let id = product?.productId;
          let date = product?.transactionDate;
          let array = [id, date];
          let id_date = array.join('_');
          navigation.navigate("BottomTabS")
          console.log(id_date, 'id id id id id');
        })
        .catch(i => {
          console.log(i);
          dispatch(setLoading(false));
        })
        .finally(() => {
          dispatch(setLoading(false))
        });
    } catch (err) {
      Alert.alert(JSON.stringify(err))
      dispatch(setLoading(false));
    }
  };
  const planSelected = (type) => {
    setplan(allsub?.filter(x => x?.productId == type)[0])
  }

  return (
    <ImageBackground source={theme == 'light' ? Appimg?.bg : Appimg.darkbg1} resizeMode="cover" style={{ flex: 1 }}>
      <Header title={"Subscription"} showBack={from == "profile" ? true : false} onBackPress={() => { navigation.navigate("BottomTabS") }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <Image source={Appimg.logo} style={styles(Appcolor).logo} /> */}
        {/* <View style={styles(Appcolor).viewButton}>
          <View>
            <FlatList
              data={tab}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              renderItem={({ item, index }) => {
                let isSelected = selected == item?.tabs;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setselected(item?.tabs);
                    }}
                    style={[
                      styles(Appcolor).viewButtonText,
                      { backgroundColor: isSelected ? Appcolor.yellowop : Appcolor.white },
                    ]}
                  >
                    <Text
                      style={[
                        styles(Appcolor).textButton,
                        { color: isSelected ? Appcolor.white : Appcolor.txt },
                      ]}
                    >
                      {item.tabs}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View> */}
        <Text style={[styles(Appcolor).txtSub, { marginTop: 15 }]}>Subscriptions</Text>
        <Text style={[styles(Appcolor).txtSub, { fontFamily: Appfonts.regular, fontSize: RFValue(10) }]}>Unlock unlimited Storage access</Text>
        <Image source={Appimg.sublogo} style={styles(Appcolor).subVideo} />

        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 10 }}>
          {/* <Text style={styles(Appcolor).txtToday}>Today only</Text>
          <Text style={styles(Appcolor).txtMonth}>One month of waiver</Text> */}
          <View style={styles(Appcolor).SubBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable onPress={() => { planSelected("monthly_sub") }} style={styles(Appcolor).subContainer}>
                <Text style={styles(Appcolor).subText1}>Monthly</Text>
                <Text style={styles(Appcolor).subText2}>$124.99</Text>
                <Text style={styles(Appcolor).subText3}>Per Month</Text>
                <Text style={styles(Appcolor).subText4}>Billed each month starts after trial ends</Text>
                <View style={styles(Appcolor).SelectOuter}>
                  <View style={[styles(Appcolor).selectInner, { backgroundColor: plan?.productId == "monthly_sub" ? "rgba(191,150,60,1)" : "transparent" }]}></View>
                </View>
              </Pressable>
              {/* <Pressable onPress={() => { planSelected("threemonth_sub") }} style={styles(Appcolor).subContainer}>
                <Text style={styles(Appcolor).subText1}>3 months</Text>
                <Text style={styles(Appcolor).subText2}>$299.99</Text>
                <Text style={styles(Appcolor).subText3}>After 3 Year</Text>
                <Text style={styles(Appcolor).subText4}>Billed after 3 Month $299.99 after trial ends</Text>
                <View style={styles(Appcolor).SelectOuter}>
                  <View style={[styles(Appcolor).selectInner, { backgroundColor: plan?.productId == "threemonth_sub" ? "rgba(191,150,60,1)" : "transparent" }]}></View>
                </View>
              </Pressable> */}
              <Pressable onPress={() => {
                planSelected("yearly_sub")
              }} style={styles(Appcolor).subContainer}>
                <Text style={styles(Appcolor).subText1}>Annual</Text>
                <Text style={styles(Appcolor).subText2}>$1000.00</Text>
                <Text style={styles(Appcolor).subText3}>Per Year</Text>
                <Text style={styles(Appcolor).subText4}>Billed annually at $1,000.00 after trial ends</Text>
                <View style={styles(Appcolor).SelectOuter}>
                  <View style={[styles(Appcolor).selectInner, { backgroundColor: plan?.productId == "yearly_sub" ? "rgba(191,150,60,1)" : "transparent" }]}></View>
                </View>
              </Pressable>
            </ScrollView>
          </View>

        </View>


        <Text style={[styles(Appcolor).txtWeek, { fontSize: RFValue(9) }]}>INCLUDES 1 MONTH FREE TRIAL</Text>

        <Btn transparent={Appcolor.blackop} title={en?.subscribe} twhite styleMain={{ alignSelf: "center", marginTop: 5 }}
          onPress={() => {
            requestSubscription()
          }}
        />
        <Text style={{ textAlign: "center", marginBottom: 40, fontSize: RFValue(7.4), color: Appcolor.txt, lineHeight: 14.8, fontFamily: Appfonts.light, paddingHorizontal: 18, marginTop: 8 }}>The subscription automatically renews for US$19,99/month at the end of the month. Payment will be charged to your Apple ID account at the confirmation of purchase Subscriptions automatically renews unless it is cancelled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.</Text>
      </ScrollView>
    </ImageBackground>
  )
}

export default Subscripton

const styles = (Appcolor) => StyleSheet.create({
  selectInner: {
    height: "100%",
    width: "100%",
    borderRadius: 100
    ,
  },
  SelectOuter: {
    height: 30,
    width: 30,
    borderRadius: 100,
    borderWidth: 3,
    position: "absolute",
    right: 5,
    top: 5,
    borderColor: "rgba(191,150,60,1)",
    padding: 3
    ,
  },
  SubBox: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingHorizontal: 3
  },
  subContainer: {
    // height: heightPercentageToDP(15),
    width: widthPercentageToDP(42),
    backgroundColor: "rgba(34,34,34,1)",
    borderRadius: 10,
    padding: 10,
    marginRight: 20
  },
  subText4: {
    color: Appcolor.txt,
    fontSize: RFValue(8),
    fontFamily: Appfonts.regular,
    marginTop: 3
    ,
  },
  subText3: {
    color: Appcolor.txt,
    fontSize: RFValue(12),
    fontFamily: Appfonts.bold,
    marginTop: 3
  },
  subText2: {
    color: "rgba(191,150,60,1)",
    fontSize: RFValue(18),
    fontFamily: Appfonts.bold,
    marginTop: 3
    ,
  },
  subText1: {
    color: Appcolor.txt,
    fontSize: RFValue(13),
    fontFamily: Appfonts.semiBold,
    marginTop: 6
    ,
  },
  logo: {
    height: heightPercentageToDP(15),
    width: widthPercentageToDP(30),
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: heightPercentageToDP(3)
  },
  viewButton: {
    height: heightPercentageToDP(5.6),
    width: widthPercentageToDP(90),
    alignSelf: "center",
    backgroundColor: Appcolor.white,
    borderRadius: heightPercentageToDP(3),
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    borderWidth: heightPercentageToDP(0.1),
    borderColor: "rgba(191,150,60,1)",
  },
  viewButtonText: {
    height: heightPercentageToDP(5.6),
    width: widthPercentageToDP(44.7),
    flex: 1,
    alignSelf: "center",
    backgroundColor: "rgba(191,150,60,1)",
    borderRadius: heightPercentageToDP(3),
    justifyContent: "center",
    alignItems: "center"
  },
  textButton: {
    color: Appcolor.txt,
    fontFamily: Appfonts.semiBold,
    fontSize: RFValue(10)
  },
  txtSub: {
    color: Appcolor.txt,
    textAlign: "center",
    marginTop: 1,
    fontFamily: Appfonts.bold,
    fontSize: RFValue(18)
  },
  subVideo: {
    minHeight: heightPercentageToDP(20),
    maxHeight: heightPercentageToDP(24),
    width: widthPercentageToDP(90),
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: heightPercentageToDP(2)
  },
  subVideo1: {
    height: heightPercentageToDP(20),
    width: widthPercentageToDP(90),
    alignSelf: "center",
    borderRadius: heightPercentageToDP(2),
    justifyContent: "center",
    alignItems: "center",
  },
  unlimitedStorage: {
    height: 20,
    width: 20,
    resizeMode: "contain",
    marginRight: 8
  },
  txtToday: {
    color: "rgba(191,150,60,1)",
    fontSize: RFValue(19),
    fontFamily: Appfonts.boldItalic
  },
  txtMonth: {
    color: Appcolor.txt,
    fontSize: RFValue(15),
    fontFamily: Appfonts.bold,
    marginTop: 6
  },
  txtWeek: {
    marginTop: 42,
    alignSelf: "center",
    color: Appcolor.txt,
    fontSize: RFValue(12)
  },
  play: {
    height: heightPercentageToDP(8),
    width: widthPercentageToDP(16),
    resizeMode: "contain"
  }
})