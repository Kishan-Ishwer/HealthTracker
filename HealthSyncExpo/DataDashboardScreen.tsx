// DataDashboardScreen.tsx
import React, { useState } from "react";
import { View, Button, StyleSheet, Text, Alert, ActivityIndicator } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './src/types/navigation';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type DataDashboardScreenProps = StackScreenProps<RootStackParamList, 'DataView'>;

const DataDashboardScreen = (props: DataDashboardScreenProps) => {
    const { navigation, route } = props;

    const goBackToMenu = () => {
        navigation.navigate('MainMenu');
    };

    return (
        <SafeAreaProvider>
                <View style={styles.container}>
                    <Text style={styles.header}>Health Data Dashboard</Text>
                    <Text style={styles.placeholder}>
                        This screen will display processed and aggregated data 
                        fetched from the C# Backend Server (e.g., charts, daily summaries).
                    </Text> 
                </View>
                <View>
                    <Button 
                        title="Go Back to Menu" 
                        onPress={goBackToMenu}
                    />
                </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        padding: 20,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
    },
    placeholder: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 40,
        paddingHorizontal: 15,
    }
});

export default DataDashboardScreen;


