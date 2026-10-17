import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import PendingPlantsScreen from './PendingPlantsScreen';
import TodayTasksScreen from './TodayTasksScreen';
import { COLORS, FONTS } from '../constant/constant';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: { fontFamily: FONTS.heading, color: COLORS.primary },
        headerTintColor: COLORS.cta,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TodayTasks" component={TodayTasksScreen} options={{ title: 'Needs Attention Today' }} />
      <Stack.Screen name="PendingPlants" component={PendingPlantsScreen} options={{ title: 'Pending Plants' }} />
    </Stack.Navigator>
  );
}
