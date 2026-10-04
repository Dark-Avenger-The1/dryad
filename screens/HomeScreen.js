import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import PendingPlantCard from '../components/PendingPlantCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';

import { useLiveQuery } from '../database/useLiveQuery';
import { getPendingPlants } from '../database/queries/Read';
import { completePlanting } from '../database/queries/Update';

export default function HomeScreen() {
  const db = useSQLiteContext();

  // Pending plants from the database. Refreshes by itself when a plant is
  // scanned, planted or archived.
  const { data, loading, error } = useLiveQuery(getPendingPlants);

  // Shape PendingPlantCard expects
  const pending = useMemo(
    () =>
      (data ?? []).map((plant) => ({
        id: plant.gardenPlantId,
        gardenPlantId: plant.gardenPlantId,
        commonName: plant.commonName,
        scientificName: plant.scientificName,
        status: 'pending',
        image: plant.imageUri ? { uri: plant.imageUri } : undefined,
        care: plant.care,
      })),
    [data]
  );

  // Pending -> planted. The plant leaves this list and appears in My Garden.
  const handleComplete = async (plant) => {
    try {
      await completePlanting(db, plant.gardenPlantId);
    } catch (e) {
      Alert.alert('Could not finish planting', e.message);
    }
  };

  let subtitle;
  if (loading) {
    subtitle = 'Loading…';
  } else if (error) {
    subtitle = `Could not load plants: ${error.message}`;
  } else if (pending.length > 0) {
    subtitle = `${pending.length} plant${pending.length === 1 ? '' : 's'} waiting to be planted`;
  } else {
    subtitle = 'Nothing pending';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading || error ? null : pending.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No plants waiting. Scan a plant to get started.
            </Text>
          </View>
        ) : (
          pending.map((plant) => (
            <PendingPlantCard
              key={plant.id}
              plant={plant}
              onComplete={handleComplete}
            />
          ))
        )}
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
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Image, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';

// import Card from '../components/Card';
// import AppButton from '../components/AppButton';
// import { COLORS, FONTS } from '../constant/constant';

// //Module 
// import { handleScan,handlePickImage } from '../hooks/ModalPlantCreation.js';

// export default function HomeScreen() {
//   const [selectedImage, setSelectedImage] = useState(null);


//   const handleScanPlant= async ()=>{
//     const result = await handleScan();
//     Alert.alert(JSON.stringify(result));
//   }

//   const handleUploadPlant = async ()=>{
//     const result = await handlePickImage();
//     console.log(JSON.stringify(result));
//     Alert.alert(JSON.stringify(result));
//   }

//   return (
//     <View style={styles.container}>
//       <Card title="Show off your plant!" subtitle="Scan or Upload the plant of your interest!">
//         <View style={styles.buttonGroup}>
//           <AppButton title="Scan a Plant" onPress={handleScanPlant} style={styles.fullWidthButton} />

//           <View style={styles.dividerRow}>
//             <View style={styles.line} />
//             <Text style={styles.orText}>OR</Text>
//             <View style={styles.line} />
//           </View>

//           <AppButton title="Upload a Plant" onPress={handleUploadPlant} style={styles.fullWidthButton} />
//         </View>
//         {selectedImage && (
//           <Image source={{ uri: selectedImage }} style={styles.preview} />
//         )}
//       </Card>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: COLORS.background,
//     paddingHorizontal: 20,
//   },
//   header: {
//     fontSize: 20,
//     fontFamily: FONTS.heading,
//     color: COLORS.primary,
//     marginBottom: 20,
//   },
//   buttonGroup: {
//     width: '100%',
//     alignItems: 'center',
//     gap: 12,
//     marginTop: 16,
//   },
//   fullWidthButton: {
//     width: '100%',
//   },
//   dividerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginVertical: 4,
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: COLORS.softdivider,
//   },
//   orText: {
//     marginHorizontal: 10,
//     fontFamily: FONTS.body,
//     color: COLORS.text,
//     fontSize: 12,
//   },
//   preview: {
//     width: '100%',
//     height: 180,
//     borderRadius: 10,
//     marginTop: 16,
//   },
// });