import React from "react";
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/dryadga_logo.png")}
        style={styles.logo}
      />

      <ActivityIndicator
        size="large"
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },

  loader: {
    marginTop: 30,
  },
});