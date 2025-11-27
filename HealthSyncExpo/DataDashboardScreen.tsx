// DataDashboardScreen.tsx
import React, { useState } from "react";
import { View, Button, StyleSheet, Text, Alert, ActivityIndicator } from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './src/types/navigation';

type DataDashboardScreenProps = StackScreenProps<RootStackParamList, 'DataView'>;

const DataDashboardScreen = (props: DataDashboardScreenProps) => {
    const { navigation } = props;

    const goBackToMenu = () => {
        navigation.navigate('MainMenu');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Health Data Dashboard</Text>
            <Text style={styles.placeholder}>
                This screen will display processed and aggregated data 
                fetched from the C# Backend Server (e.g., charts, daily summaries).
            </Text>
            
            <Button 
                title="Go Back to Menu" 
                onPress={goBackToMenu}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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


