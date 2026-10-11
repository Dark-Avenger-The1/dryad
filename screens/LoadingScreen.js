import React from "react";
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  Text,
} from "react-native";

import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
} from "../constant/constant";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../assets/dryadga_logo.png")}
          style={styles.logo}
        />

        <Text style={styles.appName}>
          Dryad
        </Text>

        <Text style={styles.subtitle}>
          Preparing your garden...
        </Text>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      </View>

      <Text style={styles.footer}>
        Plant care made simple
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 170,
    height: 170,
    resizeMode: "contain",
  },

  appName: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h1,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },

  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  loader: {
    marginTop: SPACING.xl,
  },

  footer: {
    position: "absolute",
    bottom: SPACING.xl,
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
});