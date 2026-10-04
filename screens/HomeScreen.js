import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import PendingPlantCard from '../components/PendingPlantCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';

// Placeholder until the database member wires this up.
// Replace with a query for plants where status = 'pending'.
const SAMPLE_PENDING = [
  {
    id: '1',
    commonName: 'Dwarf Banana',
    scientificName: 'Musa acuminata',
    status: 'pending',
    image: {
      uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Musa_acuminata_-_Bananier.jpg/640px-Musa_acuminata_-_Bananier.jpg',
    },
    care: {
      wateringDays: 2,
      tips: [
        'This plant needs full sun. Give it an open spot with no overhead cover.',
        'This plant likes humid air. Group it with other plants or mist it on dry days.',
        'Water about every 2 days.',
      ],
      plantingSteps: [
        {
          title: 'Choose the spot',
          detail:
            'Place in the most open part of your garden or balcony. Aim for about 6-8 hours of sunlight.',
        },
        {
          title: 'Prepare the soil',
          detail:
            'Mix garden soil with plenty of compost or aged manure, about 2:1. Mix in coffee grounds or peat to lower the pH.',
        },
        {
          title: 'Dig and space',
          detail:
            'Dig a hole twice as wide as the root ball. Leave 300 cm between plants.',
        },
        {
          title: 'Water in',
          detail:
            'Water deeply right after planting so the soil settles around the roots.',
        },
      ],
    },
  },
];

export default function HomeScreen() {
  const [pending, setPending] = useState(SAMPLE_PENDING);

  const handleComplete = (plant) => {
    // TODO: database update goes here — set status to 'planted'
    // so the plant appears in My Garden.
    setPending((prev) => prev.filter((p) => p.id !== plant.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>
        {pending.length > 0
          ? `${pending.length} plant${pending.length === 1 ? '' : 's'} waiting to be planted`
          : 'Nothing pending'}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {pending.length === 0 ? (
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