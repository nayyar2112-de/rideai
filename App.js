// App.js — Root navigation setup
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import LocationScreen from './screens/LocationScreen';
import VehicleScreen from './screens/VehicleScreen';
import MatchingScreen from './screens/MatchingScreen';
import TrackingScreen from './screens/TrackingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0f0f13" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0f0f13' },
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Location" component={LocationScreen} />
          <Stack.Screen name="Vehicle" component={VehicleScreen} />
          <Stack.Screen name="Matching" component={MatchingScreen} />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
