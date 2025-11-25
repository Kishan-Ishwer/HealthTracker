using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnalyticsService.Models
{
    [Table("daily_summaries")]
    public class DailySummary
    {
        [Column("id")]

        public int Id { get; set; }

        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Column("summary_date")]
        // Structured field for easy querying
        public DateOnly SummaryDate { get; set; }

        // Clean, Processed Metrics
        [Column("total_steps")]
        public int TotalSteps { get; set; }

        [Column("total_sleep_hours")]
        public double TotalSleepHours { get; set; }

        [Column("avg_heart_rate")]
        public double AvgHeartRate { get; set; }

        [Column("calculation_time")]
        public DateTime CalculationTime { get; set; }
    }
}
