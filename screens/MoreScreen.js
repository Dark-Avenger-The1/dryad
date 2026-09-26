import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../components/AppButton';
import { COLORS, FONTS } from '../constant/constant';

export default function MoreScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <AppButton
        title="Go to Archive"
        onPress={() => navigation.navigate('Archive')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.primary,
    marginBottom: 12,
  },
});