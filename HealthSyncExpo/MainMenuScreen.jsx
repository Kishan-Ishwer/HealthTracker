// MainMenuScreen.js
import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, Text, ScrollView, Alert } from "react-native";
import {
    getGrantedPermissions,
    initialize,
    readRecords,
    requestPermission,
    openHCSettings,
    HealthConnect,
} from "react-native-health-connect";

// --- CONFIGURATION CONSTANTS ---
const BACKEND_IP = '192.168.1.113'; 
const INGESTION_URL = `http://${BACKEND_IP}:3000/api/v1/ingest/health-data`;
const USER_ID = 'user-abc-123';

// Time Range (Last 24 Hours)
const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const startTime = yesterday.toISOString();
const endTime = today.toISOString();


const mapAggregatedDataToRawRecords = (HealthConnectData) => {
    if (!HealthConnectData) {
        return [];
    }
    
    const rawRecords = [];
    const ingestionTime = new Date().toISOString();

   
    const aggregatedRecord = HealthConnectData.aggregated;
    if (aggregatedRecord) {
        
        const summaryRecord = {
            userId: USER_ID,
            timestamp: endTime, 
            data: {
                type: 'DailyAggregateSummary',
                data: aggregatedRecord
            },
            ingestionTime: ingestionTime
        };
        rawRecords.push(summaryRecord);
    }

    const sleepSessions = HealthConnectData.sleepSessions || [];
    const exerciseSessions = HealthConnectData.exerciseSessions || [];
    const allSessions = sleepSessions.concat(exerciseSessions);

    allSessions.forEach(session => {
        rawRecords.push({
            userId: USER_ID,
            timestamp: session.startTime,
            data: session,
            ingestionTime: ingestionTime
        });
    });

    if (HealthConnectData.latestBloodPressure) {
        rawRecords.push({
            userId: USER_ID,
            timestamp: HealthConnectData.latestBloodPressure.time,
            data: HealthConnectData.latestBloodPressure,
            ingestionTime: ingestionTime
        });
    }

    return rawRecords;
};


const getRawRecordsForIngestion = async (HC, ALL_AGGREGATION_METRICS ,startTime, endTime) => {
    
    const [
        aggregated, 
        sleepSessions, 
        exerciseSessions, 
        weightRecords, 
        bloodPressureRecords
    ] = await Promise.all([
        HC.aggregate({
            metrics: ALL_AGGREGATION_METRICS,
            timeRange: { startTime, endTime },
        }),

        HC.readRecords({
            recordType: HC.RecordType.SleepSession,
            timeRange: { startTime, endTime },
        }),

        HC.readRecords({
            recordType: HC.RecordType.ExerciseSession,
            timeRange: { startTime, endTime },
        }),
        
        HC.readRecords({
            recordType: HC.RecordType.Weight,
            timeRange: { startTime, endTime },
            ascending: false,
            limit: 1,
        }),
        
        HC.readRecords({
            recordType: HC.RecordType.BloodPressure,
            timeRange: { startTime, endTime },
            ascending: false,
            limit: 1,
        }),
        
    ]);

    const latestWeight = weightRecords.records?.[0];
    const latestBloodPressure = bloodPressureRecords.records?.[0];

    const structuredData = {
        aggregated: aggregated,  
        sleepSessions: sleepSessions?.records || [],
        exerciseSessions: exerciseSessions?.records || [],
        latestWeight: weightRecords?.records?.[0],
        latestBloodPressure: bloodPressureRecords?.records?.[0]
    };

    return mapAggregatedDataToRawRecords(structuredData);
};


// --- MAIN COMPONENT ---

const MainMenuScreen = ({ navigation }) => {
    


    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle');
    const [syncMessage, setSyncMessage] = useState('Ready to sync device health data.');
    const [postCount, setPostCount] = useState(0);

    const handleSync = async () => {
        if (syncStatus === 'syncing') return;

        setSyncStatus('syncing');
        setSyncMessage(`Checking permissions and fetching data...`);
        setPostCount(0);

        const HC = HealthConnect;
        
        try {
            if (!HC || !HC.Aggregations) {
                 throw new Error("Health Connect native module failed to load. Please verify your native dependencies.");
            }

            const ALL_AGGREGATION_METRICS = [
                HC.Aggregations.ActiveCaloriesBurned.activeCaloriesBurned,
                HC.Aggregations.TotalCaloriesBurned.totalCaloriesBurned,
                HC.Aggregations.BasalMetabolicRate.basalMetabolicRate,
                HC.Aggregations.Steps.steps,
                HC.Aggregations.Distance.distance,
                HC.Aggregations.FloorsClimbed.floorsClimbed, 
                HC.Aggregations.ElevationGained.elevationGained,
                HC.Aggregations.WheelchairPushes.wheelchairPushes,
                HC.Aggregations.Hydration.volume, 
                HC.Aggregations.Nutrition.energy, 
                HC.Aggregations.RestingHeartRate.restingHeartRateMin,
                HC.Aggregations.RestingHeartRate.restingHeartRateMax,
                HC.Aggregations.HeartRate.heartRateAvg,
                HC.Aggregations.OxygenSaturation.oxygenSaturationAvg,
                HC.Aggregations.RespiratoryRate.respiratoryRateAvg,
                HC.Aggregations.BodyTemperature.bodyTemperatureAvg,
                HC.Aggregations.BodyFat.bodyFatAvg
            ];

        const ALL_READ_PERMISSIONS = [
            // --- Activity & Movement (Covers ActiveCaloriesBurned, Distance, Steps, etc.) ---
            HC.Permissions.READ_ACTIVE_CALORIES_BURNED,
            HC.Permissions.READ_DISTANCE,
            HC.Permissions.READ_EXERCISE_SESSION, // Also covers Cycling, Power, Speed, Cadence
            HC.Permissions.READ_FLOORS_CLIMBED,
            HC.Permissions.READ_STEPS,
            HC.Permissions.READ_TOTAL_CALORIES_BURNED,
            HC.Permissions.READ_WHEELCHAIR_PUSHES,
            HC.Permissions.READ_ELEVATION_GAINED,

            // --- Vitals & Body Measurements (Covers HeartRate, Weight, BloodPressure, etc.) ---
            HC.Permissions.READ_HEART_RATE,
            HC.Permissions.READ_OXYGEN_SATURATION,
            HC.Permissions.READ_RESPIRATORY_RATE,
            HC.Permissions.READ_RESTING_HEART_RATE,
            HC.Permissions.READ_VO2_MAX,
            HC.Permissions.READ_BODY_TEMPERATURE, // Covers BodyTemperature and BasalBodyTemperature
            HC.Permissions.READ_BLOOD_GLUCOSE,
            HC.Permissions.READ_BLOOD_PRESSURE,
            HC.Permissions.READ_BASAL_METABOLIC_RATE,

            // --- Body Composition ---
            HC.Permissions.READ_WEIGHT,
            HC.Permissions.READ_HEIGHT,
            HC.Permissions.READ_BODY_FAT,
            HC.Permissions.READ_BONE_MASS,
            HC.Permissions.READ_LEAN_BODY_MASS,

            // --- Nutrition & Hydration ---
            HC.Permissions.READ_HYDRATION,
            HC.Permissions.READ_NUTRITION,

            // --- Sleep & Sessions ---
            HC.Permissions.READ_SLEEP_SESSION,

            // --- Reproductive Health ---
            HC.Permissions.READ_CERVICAL_MUCUS,
            HC.Permissions.READ_MENSTRUATION_FLOW,
            HC.Permissions.READ_OVULATION_TEST,
            HC.Permissions.READ_SEXUAL_ACTIVITY
            // Note: MenstruationPeriod is usually covered by READ_MENSTRUATION_FLOW in the API, 
            // but the library exposes a specific record type that should be covered by these scopes.
        ];
            // 1. Check and Request Permissions
            const grantedPermissions = await HC.requestPermissions(ALL_READ_PERMISSIONS);
            const allGranted = ALL_READ_PERMISSIONS.every(p => grantedPermissions.includes(p));

            if (!allGranted) {
                setSyncStatus('error');
                Alert.alert("Permissions Required", "Please grant all requested Health Connect permissions to sync data.");
                setSyncMessage('Permissions not fully granted. Cannot read data.');
                return;
            }

            // 2. Fetch and Consolidate Data
            const healthDataToSync = await getRawRecordsForIngestion(
                HC,
                ALL_AGGREGATION_METRICS,
                startTime,
                endTime
            );
            
            if (healthDataToSync.length === 0) {
                 setSyncStatus('complete');
                 setSyncMessage('No new health data found for the 24-hour period.');
                 return;
            }
            
            setSyncMessage(`Fetched ${healthDataToSync.length} consolidated daily record(s). Posting to backend...`);

            // 3. Prepare the Payload
            const payload = {
                userId: USER_ID,
                records: healthDataToSync 
            };

            // 4. Send to Ingestion Endpoint
            const response = await fetch(INGESTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setPostCount(healthDataToSync.length);
                setSyncStatus('complete');
                setSyncMessage(`Success! Synced ${healthDataToSync.length} record(s) to backend.`);
            } else {
                setSyncStatus('error');
                const errorText = await response.text();
                setSyncMessage(`Server Error: ${response.status} - ${errorText.substring(0, 50)}...`);
                console.error("Server Error Response:", errorText);
            }
        } catch (e) {
            setSyncStatus('error');
            setSyncMessage(`Health Connect Error or Network Failure: ${e.message}`);
            console.error("Sync Error:", e);
        }
    };


    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Health Data Sync</Text>
                <Text style={styles.infoText}>
                    Syncs data from {new Date(startTime).toLocaleDateString()} to {new Date(endTime).toLocaleDateString()}.
                </Text>
            </View>
            
            <View style={styles.section}>
                <Text style={styles.statusText}>Status: {syncStatus.toUpperCase()}</Text>
                <Text style={styles.statusMessage}>{syncMessage}</Text>
            </View>
            
            <View style={styles.section}>
                <Button
                    title={syncStatus === 'syncing' ? "Syncing..." : "1. Read and Sync All Data"}
                    onPress={handleSync}
                    disabled={syncStatus === 'syncing'}
                    color={syncStatus === 'error' ? 'red' : '#007AFF'}
                />
            </View>

            <View style={styles.section}>
                <Button
                    title="2. Open Health Connect Permissions"
                    onPress={openHCSettings}
                    color="#4CAF50"
                />
            </View>
        </ScrollView>
    ); 
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    statusMessage: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    }
});

export default MainMenuScreen;