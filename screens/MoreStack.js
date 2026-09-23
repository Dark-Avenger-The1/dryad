import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from './MoreScreen';
import ArchiveScreen from './ArchiveScreen';
 
const Stack = createNativeStackNavigator();
 
export default function MoreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MoreMain" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Archive" component={ArchiveScreen} options={{ title: 'Archive' }} />
    </Stack.Navigator>
  );
}