import React, { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from './src/types/navigation';
import {
  aggregateRecord,
  getGrantedPermissions,
  initialize,
  insertRecords,
  getSdkStatus,
  readRecords,
  requestPermission,
  revokeAllPermissions,
  SdkAvailabilityStatus,
  openHealthConnectSettings,
  openHealthConnectDataManagement,
  readRecord,
} from "react-native-health-connect";

import ConnectScreen from "./ConnectScreen";
import MainMenuScreen from "./MainMenuScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();



export default function App() {
  
  const [healthConnectisInit, sethealthConnectisInit] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connect">
        <Stack.Screen
          name="Connect"
          component={ConnectScreen}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="Loading" 
          component={LoadingScreen} 
          options={{ headerShown: false }} 
        /> */}
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{ title: "Dashboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 16,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});