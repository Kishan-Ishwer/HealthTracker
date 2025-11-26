// =================================================================
// 1. ALL READ PERMISSIONS (Record Type Strings)
// =================================================================
export const ALL_READ_PERMISSIONS = [
  // Activity
  'Steps',
  'Distance',
  'TotalCaloriesBurned',
  'ExerciseSession',
  'FloorsClimbed',
  
  // Vitals
  'HeartRate',
  'SleepSession',
  'BloodPressure',
  'BloodGlucose',
  'OxygenSaturation',
  'RespiratoryRate',
  'BodyTemperature',
  
  // Body Measurement
  'Weight',
  'Height',
  'BodyFat',
  'BasalMetabolicRate',
  
  // Consumption
  'Hydration',
  'Nutrition',
];

// =================================================================
// 2. ALL AGGREGATION METRICS (String Keys)
//    The format is 'RecordType.MetricName'.
// =================================================================
export const ALL_AGGREGATION_METRICS = [
  'Steps.stepsCountTotal',
  'Distance.distanceTotal',
  'TotalCaloriesBurned.caloriesTotal',
  'FloorsClimbed.floorsClimbedTotal',
  
  'HeartRate.heartRateBpmMax',
  'HeartRate.heartRateBpmMin',
  'HeartRate.heartRateBpmAvg',

  'Weight.weightAvg',
  'Weight.weightMin',
  'Weight.weightMax',
  'BodyFat.percentageAvg',
  
  'BasalMetabolicRate.basalMetabolicRateTotal', 
  
  'BloodGlucose.levelAvg',
  'BloodPressure.systolicAvg',
  'BloodPressure.diastolicAvg',
  'OxygenSaturation.percentageAvg',
  
  'Hydration.volumeTotal',
  'Nutrition.energyTotal',
] as const;