import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
 
export default function MoreScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Button
        title="Go to Archive"
        onPress={() => navigation.navigate('Archive')}
      />
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
});
 