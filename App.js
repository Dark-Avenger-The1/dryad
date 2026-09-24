import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 
import HomeScreen from './screens/HomeScreen';
import MyGardenScreen from './screens/MyGardenScreen';
import DailyRoutineScreen from './screens/DailyRoutineScreen';
import MoreStack from './screens/MoreStack';
 
const Tab = createBottomTabNavigator();
 
export default function App() {
  //Provide a SafeArea so the bottom will not overlap.
  return (
    
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="My Garden" component={MyGardenScreen} />
        <Tab.Screen name="Daily Routine" component={DailyRoutineScreen} />
        <Tab.Screen
          name="More"
          component={MoreStack}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/