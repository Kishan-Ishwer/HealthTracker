/**
 * ====================================================
 * REACT NAVIGATION TYPE DEFINITIONS (HealthSyncExpo)
 *
 * This file defines all screen names and the parameters they accept.
 * This resolves the 'Cannot find name RootStackParamList' error.
 * ====================================================
 */
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// 1. Define the stack parameters.
// Keys are screen names, values are parameter types (or 'undefined' if no params).
export type RootStackParamList = {
  Connect: undefined; // No parameters needed
  MainMenu: undefined; // We don't need parameters for the main dashboard
  // You might add a detail screen later, for example:
  // RecordDetail: { recordId: string; type: 'Sleep' | 'Steps' };
};

// 2. Export the types used by React Navigation hooks for type safety

/**
 * Type for the navigation object (useNavigation)
 * Used for calling navigation.navigate('ScreenName', params)
 */
export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Type for the route object (useRoute)
 * Used for accessing route.params
 */
export type RootStackRoute = RouteProp<RootStackParamList>;

// Declare global types for React Navigation (necessary for nested navigators, optional here but good practice)
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}