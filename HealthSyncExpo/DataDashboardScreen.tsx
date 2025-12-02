// DataDashboardScreen.tsx
import React, { useState } from "react";
import { View, Button, StyleSheet, Text, Alert, ActivityIndicator, ScrollView } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './src/types/navigation';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type DataDashboardScreenProps = StackScreenProps<RootStackParamList, 'DataView'>;

interface DailySummary {
    summaryDate: string;
    userId: string;
    totalSteps: number;
    activeHours: number;
    caloriesBurned: number;
    sleepDurationHours: number;
    // Add other fields
}

const DataDashboardScreen = (props: DataDashboardScreenProps) => {
    const { navigation, route } = props;
    const initialSummaries = route.params.userData as unknown as DailySummary[]; 

    const userId = initialSummaries.length > 0 ? initialSummaries[0].userId : 'N/A';

     const [summaries, setSummaries] = useState<DailySummary[]>(initialSummaries);
    const [isLoading, setIsLoading] = useState(false);

    const goBackToMenu = () => {
        navigation.navigate('MainMenu');
    };

    const latestSummary = summaries.length > 0 ? summaries.slice().sort((a, b) => 
        new Date(b.summaryDate).getTime() - new Date(a.summaryDate).getTime()
    )[0] : null;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.header}>Health Data Dashboard</Text>
                    <Text style={styles.subheader}>
                        User ID: {userId}
                    </Text>

                    {latestSummary && (
                        <View style={styles.dataSection}>
                            <Text style={styles.sectionHeader}>Latest Daily Summary ({new Date(latestSummary.summaryDate).toLocaleDateString()})</Text>

                            <View style={styles.metricRow}>
                                <MetricCard icon="🏃‍♂️" label="Steps" value={latestSummary?.totalSteps.toLocaleString()} unit="steps" />
                                <MetricCard icon="⚡️" label="Calories" value={latestSummary?.caloriesBurned?.toLocaleString()} unit="kcal" />
                            </View>
                            <View style={styles.metricRow}>
                                <MetricCard icon="🛌" label="Sleep" value={latestSummary?.sleepDurationHours?.toFixed(1)} unit="hours" />
                                <MetricCard icon="⏱️" label="Active Time" value={latestSummary?.activeHours?.toFixed(1)} unit="hours" />
                            </View>

                            <View style={styles.chartPlaceholder}>
                                <Text style={styles.placeholderText}>Weekly Trend Chart Placeholder</Text>
                            </View>
                        </View>
                    )}

                </ScrollView>
                <View style={styles.footer}>
                    <Button 
                        title="Go Back to Menu" 
                        onPress={goBackToMenu}
                        color="#4682B4"
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const MetricCard = ({ icon, label, value, unit }: { icon: string, label: string, value: string, unit: string }) => (
    <View style={styles.metricCard}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E90FF',
        marginBottom: 5,
        textAlign: 'center',
    },
    subheader: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    loading: {
        marginVertical: 40,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginVertical: 20,
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        padding: 10,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#E0FFFF', // Light Cyan for border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 25,
    },
    actionButton: {
        flex: 0.8,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#4682B4',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dataSection: {
        width: '100%',
        alignItems: 'center',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginVertical: 15,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    metricIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E90FF',
    },
    metricUnit: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    metricLabel: {
        fontSize: 14,
        color: '#555',
    },
    chartPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#E6E6FA',
        borderRadius: 12,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D8BFD8',
    },
    placeholderText: {
        color: '#808080',
        fontStyle: 'italic',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
    }
});

export default DataDashboardScreen;


