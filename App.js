import React, { useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDbIfNeeded } from './database/migrate';

import HomeScreen from './screens/HomeScreen';
import MyGardenScreen from './screens/MyGardenScreen';
import DailyRoutineScreen from './screens/DailyRoutineScreen';
import MoreStack from './screens/MoreStack';

import { COLORS, FONTS } from './constant/constant';

import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const Tab = createBottomTabNavigator();

// Keep the splash visible while fonts load. The .catch() avoids an
// unhandled rejection if the splash has already auto-hidden.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Fires after the first frame is painted, so there is no white flash
  // between the splash hiding and the UI appearing.
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // fontError is included so a failed font download degrades to the
  // system font instead of freezing on the splash screen forever.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SQLiteProvider databaseName="plants.db" onInit={migrateDbIfNeeded}>
        <SafeAreaProvider>
          <NavigationContainer>
            <TabsWithInsets />
            <StatusBar style="dark" />
          </NavigationContainer>
        </SafeAreaProvider>
      </SQLiteProvider>
    </View>
  );
}

function TabsWithInsets() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.cta,
        tabBarInactiveTintColor: '#A89A8C',
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: 'rgba(45, 90, 61, 0.15)',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.body,
          fontSize: 11,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My Garden') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Daily Routine') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'More') {
            iconName = focused
              ? 'ellipsis-horizontal-circle'
              : 'ellipsis-horizontal-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Garden" component={MyGardenScreen} />
      <Tab.Screen name="Daily Routine" component={DailyRoutineScreen} />
      <Tab.Screen name="More" component={MoreStack} />
    </Tab.Navigator>
  );
}