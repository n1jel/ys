import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import Appcolor from "../../constants/Appcolor";
import { useSelector } from "react-redux";
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen";

const LoaderCommon = (navigation) => {
  const loading = useSelector((state) => state?.load?.isLoading);
  return loading && (

    <View style={styles.modalScreen}>
      <ActivityIndicator size={"large"} color={Appcolor.grad1} />
    </View>

  );
};

const styles = StyleSheet.create({
  modalScreen: {
    position: "absolute",
    height: heightPercentageToDP(100),
    width: widthPercentageToDP(100),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
});

export default LoaderCommon;
