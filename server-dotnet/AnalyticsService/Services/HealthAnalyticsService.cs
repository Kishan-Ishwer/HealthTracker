using AnalyticsService.Data;
using AnalyticsService.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Collections.Generic;

namespace AnalyticsService.Services
{
    public class HealthAnalyticsService : IHealthAnalyticsService
    {
        private readonly HealthContext _context;

        public HealthAnalyticsService(HealthContext context)
        {
            _context = context;
        }

        public async Task ProcessRawDataAsync(string userId)
        {
            var rawData = await _context.RawData
                .Where(r => r.UserId == userId)
                .ToListAsync();

            if (!rawData.Any())
            {
                return;
            }

            var processedRecords = new List<RawDataRecord>();

            var dailyGroups = rawData
                .GroupBy(r => DateOnly.FromDateTime(r.Timestamp.Date))
                .ToList();

            foreach (var group in dailyGroups)
            {
                var summaryDate = group.Key;
                var recordsInGroup = group.ToList();

                // --- 3. CALCULATE TOTAL STEPS ---
                int totalSteps = recordsInGroup
                    .Where(r => r.Data != null)
                    .Where(r =>
                        r.Data!.RootElement.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("type", out var typeProp) &&
                        typeProp.GetString() == "Steps")
                    .Sum(r => r.Data!.RootElement.GetProperty("data").GetProperty("count").GetInt32());

                // --- 4. CALCULATE AVERAGE HEART RATE ---
                var heartRateData = recordsInGroup
                    .Where(r => r.Data != null)
                    .Where(r =>
                        r.Data!.RootElement.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("type", out var typeProp) &&
                        typeProp.GetString() == "HeartRate")
                    .Select(r => r.Data!.RootElement.GetProperty("data").GetProperty("bpm").GetInt32())
                    .ToList();

                double avgHeartRate = heartRateData.Any() ? heartRateData.Average() : 0.0;


                // --- 5. CALCULATE TOTAL SLEEP HOURS ---
                int totalSleepMinutes = recordsInGroup
                    .Where(r => r.Data != null)
                    .Where(r =>
                        r.Data!.RootElement.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("type", out var typeProp) &&
                        typeProp.GetString() == "Sleep")
                    .Sum(r => r.Data!.RootElement.GetProperty("data").GetProperty("durationMinutes").GetInt32());

                double totalSleepHours = totalSleepMinutes / 60.0; // Convert minutes to hours


                // --- 6. Create or Update Summary Record ---
                var summary = await _context.DailySummaries
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.SummaryDate == summaryDate);

                if (summary == null)
                {
                    summary = new DailySummary { UserId = userId, SummaryDate = summaryDate };
                    _context.DailySummaries.Add(summary);
                }

                // --- 7. Update Calculated Fields ---
                summary.TotalSteps = totalSteps;
                summary.AvgHeartRate = avgHeartRate;
                summary.TotalSleepHours = totalSleepHours;
                summary.CalculationTime = DateTime.UtcNow;

                // --- 8. Add all records from this successful daily group to the deletion list ---
                processedRecords.AddRange(recordsInGroup);
            }

            // --- 9. DATA CLEANUP: Mark processed records for deletion ---
            if (processedRecords.Any())
            {
                _context.RawData.RemoveRange(processedRecords);
            }

            // 10. Save Changes: This performs two operations in one transaction:
            //    A) Inserts/Updates DailySummaries.
            //    B) Deletes the processed RawDataRecords.
            await _context.SaveChangesAsync();
        }
    }
}