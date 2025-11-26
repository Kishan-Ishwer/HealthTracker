// ConnectScreen.js
import React, { useState } from "react";
import { View, Button, StyleSheet, Text, Alert, ActivityIndicator } from "react-native";

// Import useNavigation from React Navigation
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigation } from './src/types/navigation';

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

const ConnectScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<RootStackNavigation>();
  const [isConnected, setIsConnected] = useState(false);

  

  const handleConnect = async () => {
    setIsLoading(true);

    try {
    
      console.log("Starting async connection...");

        const isInitialized = await initialize();

      if (!isInitialized) {
        setIsConnected(false);
        Alert.alert("Could not initialize Health Connect");
        return;
      }

      setIsConnected(true);
      console.log("Connection successful!");

      navigation.replace("MainMenu");

      return;

    } catch (e: any) {
      setIsConnected(false);
      console.error("Connection failed:", Error);
      Alert.alert("Error", "Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
      
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>Connecting...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome!</Text>
      <Button
        title="Connect"
        onPress={() => handleConnect()}
        disabled={isLoading} // Prevents multiple presses
      />
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    color: "#333",
    fontWeight: "600",
  },
  text: {
    marginBottom: 10,
    fontSize: 18,
    color: "#333",
  },
});

export default ConnectScreen;
