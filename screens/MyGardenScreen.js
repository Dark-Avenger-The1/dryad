import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import PlantCard from '../components/PlantCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';

export default function MyGardenScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PlantCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h1,
    color: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
});