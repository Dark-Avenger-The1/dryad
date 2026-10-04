import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { COLORS, FONTS } from '../constant/constant';
import Card from '../components/Card';
import AppButton from '../components/AppButton';
import ScanResultModal from '../components/ScanResultModal';

import { identifyPlantScanner } from '../hooks/ModalPlantCreation.js';
import { addScannedPlant } from '../database/queries/Create';

export default function ScannerScreen() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const runScan = async (choice) => {
    setLoading(true);
    try {
      const identified = await identifyPlantScanner(choice);
      if (!identified) return;            // user cancelled the picker
      setResult(identified);
      setModalVisible(true);
    } catch (e) {
      Alert.alert('Could not identify', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Saves the plant as 'pending', so it shows on the Home screen
  const handleConfirm = async () => {
    try {
      const top = result.candidates[0];
      await addScannedPlant(db, {
        scientificName: top.scientificName,
        commonName: top.commonName,
        imageUri: result.image?.uri,
        trefleDetails: result.info,
      });
      setModalVisible(false);
      setResult(null);
    } catch (e) {
      Alert.alert('Could not save plant', e.message);
    }
  };

  // User tapped a different candidate in the modal.
  const handlePickCandidate = (candidate) => {
    setResult((prev) => ({
      ...prev,
      candidates: [
        candidate,
        ...prev.candidates.filter(
          (c) => c.scientificName !== candidate.scientificName
        ),
      ],
    }));
    // NOTE: care data still reflects the original top match.
    // Re-running the Trefle lookup for the new name would go here.
  };

  return (
    <View style={styles.container}>
      <Card
        title="Show off your plant!"
        subtitle="Scan or Upload the plant of your interest!"
      >
        <View style={styles.buttonGroup}>
          <AppButton
            title="Scan a Plant"
            onPress={() => runScan('capture')}
            style={styles.fullWidthButton}
            disabled={loading}
          />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <AppButton
            title="Upload a Plant"
            onPress={() => runScan('pick-gallery')}
            style={styles.fullWidthButton}
            disabled={loading}
          />
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.cta} />
            <Text style={styles.loadingText}>Identifying your plant…</Text>
          </View>
        )}
      </Card>

      <ScanResultModal
        visible={modalVisible}
        result={result}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
        onPickCandidate={handlePickCandidate}
      />
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
  loadingBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});