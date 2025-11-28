import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';

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

// --- CONFIGURATION ---

// ⚠️ IMPORTANT: If testing on a physical phone via Expo Go, 
// you MUST replace this with your computer's LAN IP address (e.g., '192.168.1.5').
// If using the Android Emulator on the same PC, '10.0.2.2' works.
const BACKEND_IP = '192.168.1.113'; 
const INGESTION_URL = `http://${BACKEND_IP}:3000/api/v1/ingest/health-data`;
const USER_ID = 'user-abc-123'; 

// --- DATA TYPES ---

interface HealthRecord {
  timestamp: string;
  data: {
      type: 'Steps' | 'HeartRate' | 'Sleep';
      count?: number;
      value?: number;
      durationMinutes?: number;
      bpm?: number;
  }
}

// Simulated data to sync
const healthDataToSync: HealthRecord[] = [
  { 
    timestamp: '2023-11-23T07:00:00Z', 
    data: { type: 'Sleep', durationMinutes: 450 } // 7.5 hours
  },
  { 
    timestamp: '2023-11-23T09:00:00Z', 
    data: { type: 'Steps', count: 5100 } 
  },
  { 
    timestamp: '2023-11-23T12:30:00Z', 
    data: { type: 'HeartRate', bpm: 72 } 
  },
  { 
    timestamp: '2023-11-23T18:00:00Z', 
    data: { type: 'Steps', count: 8500 } 
  },
];

// --- MAIN COMPONENT ---

export default function App() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('Ready to sync device health data.');
  const [postCount, setPostCount] = useState(0);

 
  const buttonDisabled = syncStatus === 'syncing';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Health Sync Connect</Text>
        <Text style={styles.subHeaderText}>Expo Client</Text>
      </View>

      <View style={styles.mainContent}>
        {/* Status Indicator */}
        <View style={styles.statusCircle}>
            {syncStatus === 'syncing' && <ActivityIndicator size="large" color="#4F46E5" />}
            {syncStatus === 'complete' && <Text style={{fontSize: 40}}>✅</Text>}
            {syncStatus === 'error' && <Text style={{fontSize: 40}}>❌</Text>}
            {syncStatus === 'idle' && <Text style={{fontSize: 40}}>☁️</Text>}
        </View>
        
        <Text style={styles.title}>Sync Dashboard</Text>
        
        <Text style={[styles.message, syncStatus === 'error' && styles.errorMessage]}>
            {syncMessage}
        </Text>

        {/* Stats Box */}
        <View style={styles.statsContainer}>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>User ID:</Text>
                <Text style={styles.statValue}>{USER_ID}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Records Queue:</Text>
                <Text style={styles.statValue}>{healthDataToSync.length}</Text>
            </View>
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          style={[styles.button, buttonDisabled && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={buttonDisabled}
        >
          <Text style={styles.buttonText}>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Start Data Sync'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subHeaderText: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    height: 60, 
  },
  errorMessage: {
    color: '#DC2626',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    color: '#1F2937',
    fontWeight: '700',
  },
  button: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});