import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

if (__DEV__) {
  import('./ReactotronConfig');
}

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { UserProfileScreen } from './src/screens/UserProfileScreen';
import { FindProfessionalsScreen } from './src/screens/FindProfessionalsScreen';
import { FindAvailabilitiesScreen } from './src/screens/FindAvailabilitiesScreen';
import { ProfessionalAvailabilitiesScreen } from './src/screens/ProfessionalAvailabilitiesScreen';
import { MySchedulesScreen } from './src/screens/MySchedulesScreen';
import { ManageAvailabilitiesScreen } from './src/screens/ManageAvailabilitiesScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  UserProfile: undefined;
  FindProfessionals: undefined;
  FindAvailabilities: undefined;
  ProfessionalAvailabilities: { professionalId: string };
  MySchedules: undefined;
  ManageAvailabilities: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="FindProfessionals" component={FindProfessionalsScreen} />
        <Stack.Screen name="FindAvailabilities" component={FindAvailabilitiesScreen} />
        <Stack.Screen name="ProfessionalAvailabilities" component={ProfessionalAvailabilitiesScreen} />
        <Stack.Screen name="MySchedules" component={MySchedulesScreen} />
        <Stack.Screen name="ManageAvailabilities" component={ManageAvailabilitiesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
