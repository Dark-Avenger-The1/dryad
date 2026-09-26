import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from './MoreScreen';
import ArchiveScreen from './ArchiveScreen';
import { COLORS, FONTS } from '../constant/constant';
 
const Stack = createNativeStackNavigator();
 
export default function MoreStack() {
  return (
        <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: { fontFamily: FONTS.heading, color: COLORS.primary },
        headerTintColor: COLORS.cta,
      }}
    >
      <Stack.Screen name="MoreMain" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Archive" component={ArchiveScreen} options={{ title: 'Archive' }} />
    </Stack.Navigator>
  );
}