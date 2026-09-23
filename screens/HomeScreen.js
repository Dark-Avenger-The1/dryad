import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
 
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home / Dashboard</Text>
    </View>
  );
}

// Add new card soon here whether to scan a plant or to upload a png 
 
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '600' },
});