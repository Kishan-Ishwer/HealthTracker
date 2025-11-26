import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './src/types/navigation';

import { 
  aggregateRecord, 
  readRecords, 
  requestPermission,
  Permission 
} from "react-native-health-connect";

import { 
  ALL_READ_PERMISSIONS, 
  ALL_AGGREGATION_METRICS 
} from './src/constants/health-connect';
import { TimeRangeFilter } from "react-native-health-connect/lib/typescript/types/base.types";

type MainMenuScreenProps = StackScreenProps<RootStackParamList, 'MainMenu'>;
type SyncStatus = 'idle' | 'syncing' | 'complete' | 'error';

interface RecordsResult {
    records?: any[];
}

const BACKEND_IP = '192.168.1.113'; 
const INGESTION_URL = `http://${BACKEND_IP}:3000/api/v1/ingest/health-data`;
const USER_ID = 'user-abc-123';

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const startTime = yesterday.toISOString();
const endTime = today.toISOString();

const mapRecordsToRawRecords = (HealthConnectData: any[]): any[] => {
    if (!HealthConnectData || HealthConnectData.length === 0) return [];
    
    const rawRecords: any[] = [];
    const ingestionTime = new Date().toISOString();

    HealthConnectData.forEach(record => {
        rawRecords.push({
            userId: USER_ID,
            timestamp: record.startTime || record.time || ingestionTime, 
            data: record,
            ingestionTime: ingestionTime
        });
    });

    return rawRecords;
};

const getRawRecordsForIngestion = async (startTime: string, endTime: string) => {
    
    const timeRangeFilter: TimeRangeFilter = { operator: 'between', startTime, endTime };
    const allFetchedRecords: any[] = [];
    
    const readPromises = ALL_READ_PERMISSIONS.map(recordType => {
        
        return readRecords(recordType as any, { 
            timeRangeFilter: timeRangeFilter,
            limit: recordType === 'Weight' ? 1 : undefined 
        } as any)
        .then((result: RecordsResult) => {
            // Check for valid records and return them
            return result.records || [];
        })
        .catch(err => { 
            console.warn(`Read Error for RecordType [${recordType}]:`, err.message); 
            return []; // Return empty array on failure
        });
    });

    const results = await Promise.all(readPromises);

    results.forEach(recordsArray => {
        allFetchedRecords.push(...recordsArray);
    });

    return mapRecordsToRawRecords(allFetchedRecords);
};

const MainMenuScreen = (props: MainMenuScreenProps) => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [syncMessage, setSyncMessage] = useState<string>('Ready to sync device health data.');
    const [postCount, setPostCount] = useState<number>(0);

    const permissions: Permission[] = ALL_READ_PERMISSIONS.map(recordType => ({
        accessType: 'read',
        recordType: recordType as any,
    }));

    const handleSync = async () => {
        if (syncStatus === 'syncing') return;

        setSyncStatus('syncing');
        setSyncMessage(`Requesting permissions...`);
        
        try {
            // 2. Request Permissions
            const granted = await requestPermission(permissions);
            
            setSyncMessage(`Fetching Health Connect data...`);
            
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            
            // 3. Get Data
            const recordsToSync = await getRawRecordsForIngestion(startTime, endTime);
            
            if (recordsToSync.length === 0) {
                setSyncStatus('complete');
                setSyncMessage('No new data found to sync.');
                return;
            }

            setSyncMessage(`Posting ${recordsToSync.length} records to backend...`);

            // 4. Send to Backend
            const payload = { userId: USER_ID, records: recordsToSync };
            const response = await fetch(INGESTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setPostCount(recordsToSync.length);
                setSyncStatus('complete');
                setSyncMessage(`Success! Synced ${recordsToSync.length} records.`);
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }

        } catch (e: any) {
            setSyncStatus('error');
            setSyncMessage(`Error: ${e.message}`);
            console.error("Sync Error:", e);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Dashboard</Text>
            
            <View style={styles.card}>
                <Text style={styles.status}>Status: {syncStatus.toUpperCase()}</Text>
                <Text style={styles.message}>{syncMessage}</Text>
            </View>

            <Button 
                title={syncStatus === 'syncing' ? "Syncing..." : "Sync Health Data"} 
                onPress={handleSync} 
                disabled={syncStatus === 'syncing'}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { 
        width: '100%', padding: 15, backgroundColor: '#eee', 
        borderRadius: 8, marginBottom: 20, alignItems: 'center' 
    },
    status: { fontWeight: 'bold', marginBottom: 5 },
    message: { textAlign: 'center', color: '#555' }
});

export default MainMenuScreen;