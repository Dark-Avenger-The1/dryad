import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
 
export default function MyGardenScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '600' },
});