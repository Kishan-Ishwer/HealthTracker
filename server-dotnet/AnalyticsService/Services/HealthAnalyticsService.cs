using AnalyticsService.Data;
using AnalyticsService.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Collections.Generic;
using AnalyticsService.Data.Models;

namespace AnalyticsService.Services
{
    public class HealthAnalyticsService : IHealthAnalyticsService
    {
        private readonly HealthContext _healthContext;

        private readonly ProcessingStatusContext _statusContext;

        public HealthAnalyticsService(HealthContext healthContext, ProcessingStatusContext statusContext)
        {
            _healthContext = healthContext;
            _statusContext = statusContext;
        }


        public async Task SetUserProcessingStatus(string userId, bool isProcessing)
        {

            var existingStatus = await _statusContext.ProcessingStatuses.FindAsync(userId);

            if (existingStatus == null)
            {
                existingStatus = new ProcessingStatus { UserId = userId };
                _statusContext.ProcessingStatuses.Add(existingStatus);
            }

            existingStatus.IsProcessing = isProcessing;
            await _statusContext.SaveChangesAsync();
            Console.WriteLine($"[Status] User {userId} processing lock set to: {isProcessing}");
        }

        public async Task ProcessRawDataAsync(string userId)
        {
            var rawData = await _healthContext.RawData
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
                var summaryDate = DateOnly.FromDateTime(group.Key.ToDateTime(TimeOnly.MinValue));
                var recordsInGroup = group.ToList();

                int totalSteps = recordsInGroup
                    .Where(r => r.Data != null)
                    .Where(r =>
                        r.Data!.RootElement.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("type", out var typeProp) &&
                        typeProp.GetString() == "Steps")
                    .Sum(r => r.Data!.RootElement.GetProperty("data").GetProperty("count").GetInt32());

                var heartRateData = recordsInGroup
                    .Where(r => r.Data != null)
                    .Where(r =>
                        r.Data!.RootElement.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("type", out var typeProp) &&
                        typeProp.GetString() == "HeartRate")
                    .Select(r => r.Data!.RootElement.GetProperty("data").GetProperty("bpm").GetInt32())
                    .ToList();

                double avgHeartRate = heartRateData.Any() ? heartRateData.Average() : 0.0;


                int totalSleepMinutes = recordsInGroup
                    .Where(r => r.Data != null)
                    .Where(r =>
                        r.Data!.RootElement.TryGetProperty("data", out var dataProp) &&
                        dataProp.TryGetProperty("type", out var typeProp) &&
                        typeProp.GetString() == "Sleep")
                    .Sum(r => r.Data!.RootElement.GetProperty("data").GetProperty("durationMinutes").GetInt32());

                double totalSleepHours = totalSleepMinutes / 60.0; // Convert minutes to hours


                var summary = await _healthContext.DailySummaries
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.SummaryDate == summaryDate);

                if (summary == null)
                {
                    summary = new DailySummary { UserId = userId, SummaryDate = summaryDate };
                    _healthContext.DailySummaries.Add(summary);
                }

                summary.TotalSteps = totalSteps;
                summary.AvgHeartRate = avgHeartRate;
                summary.TotalSleepHours = totalSleepHours;
                summary.CalculationTime = DateTime.UtcNow;

                processedRecords.AddRange(recordsInGroup);
            }

            if (processedRecords.Any())
            {
                _healthContext.RawData.RemoveRange(processedRecords);
            }
            await _healthContext.SaveChangesAsync();

        }

    }
}