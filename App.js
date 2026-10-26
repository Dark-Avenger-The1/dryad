import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScannerScreen from './screens/ScannerScreen';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets, } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import {getCurrentLocation} from './services/GeoLocation.js';

import { migrateDbIfNeeded } from './database/migrate';

import HomeScreen from './screens/HomeScreen';
import HomeStack from './screens/HomeStack';
import MyGardenScreen from './screens/MyGardenScreen';
import DailyRoutineScreen from './screens/DailyRoutineScreen';
import MoreStack from './screens/MoreStack';
import LoadingScreen from './screens/LoadingScreen';

//Context
import LocationProvider from './context/LocationContext.js';
import WeatherProvider from './context/WeatherContext.js';
import { COLORS, FONTS } from './constant/constant';


import {
  useFonts, Poppins_400Regular, Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import {PLANTNET_KEY,TREFFLE_KEY} from '@env';
import SuccessToastHost from './components/SuccessToast';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Keeps the native splash screen visible while the app is loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {

  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Hide the native Expo splash once fonts are ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Wait until fonts finish loading
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (loading) {
    return (
      <View
        style={{ flex: 1 }}
        onLayout={onLayoutRootView}
      >
        <LoadingScreen />
      </View>
    );
  }


  return (
    <LocationProvider>
      <WeatherProvider>
        <View
          style={{ flex: 1 }}
          onLayout={onLayoutRootView}
        >
          <SQLiteProvider
            databaseName="dryad-data.db"
            onInit={migrateDbIfNeeded}
          >
            <SafeAreaProvider>

                <NavigationContainer>
                  <Stack.Navigator>
                    <Stack.Screen
                      name="MainTabs"
                      component={TabsWithInsets}
                      options={{ headerShown: false }}
                    />

                    <Stack.Screen
                      name="Scanner"
                      component={ScannerScreen}
                      options={{
                        title: 'Scan Plant',
                      }}
                    />
                  </Stack.Navigator>
                  <StatusBar style="dark" />
                </NavigationContainer>
                <SuccessToastHost />
            </SafeAreaProvider>
          </SQLiteProvider>
        </View>
      </WeatherProvider>
    </LocationProvider>
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
          height: 70 + insets.bottom,
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

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
      />

      <Tab.Screen
        name="My Garden"
        component={MyGardenScreen}
      />

      <Tab.Screen
        name="ScannerButton"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarLabel: '',
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.getParent()?.navigate('Scanner')
              }
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: COLORS.cta,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                  <Image
                    source={require('./assets/plant_sprout.jpg')}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                    }}
                    resizeMode="contain"
                  />
              </View>
            </TouchableOpacity>
          ),
        })}
      />

      <Tab.Screen
        name="Daily Routine"
        component={DailyRoutineScreen}
      />

      <Tab.Screen
        name="More"
        component={MoreStack}
      />
    </Tab.Navigator>
  );
}