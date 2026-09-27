import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import Card from '../components/Card';
import AppButton from '../components/AppButton';
import { COLORS, FONTS } from '../constant/constant';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState(null);

const handleScanPlant = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Camera access is required to scan a plant.');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
  }
};

const handleUploadPlant = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Media library access is required to upload a photo.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
  }
};

  return (
    <View style={styles.container}>
      <Card title="Show off your plant!" subtitle="Scan or Upload the plant of your interest!">
        <View style={styles.buttonGroup}>
          <AppButton title="Scan a Plant" onPress={handleScanPlant} style={styles.fullWidthButton} />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <AppButton title="Upload a Plant" onPress={handleUploadPlant} style={styles.fullWidthButton} />
        </View>
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.preview} />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.primary,
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  fullWidthButton: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.softdivider,
  },
  orText: {
    marginHorizontal: 10,
    fontFamily: FONTS.body,
    color: COLORS.text,
    fontSize: 12,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginTop: 16,
  },
});