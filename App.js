import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './screens/HomeScreen';
import MyGardenScreen from './screens/MyGardenScreen';
import DailyRoutineScreen from './screens/DailyRoutineScreen';
import MoreStack from './screens/MoreStack';

import { COLORS, FONTS } from './constant/constant';

import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabsWithInsets />
      </NavigationContainer>
    </SafeAreaProvider>
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
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'My Garden') iconName = focused ? 'leaf' : 'leaf-outline';
          else if (route.name === 'Daily Routine') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'More') iconName = focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline';
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