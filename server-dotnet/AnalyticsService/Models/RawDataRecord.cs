using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace AnalyticsService.Models
{
    [Table("raw_health_data")]
    public class RawDataRecord
    {
        [Column("id")]
        public int Id { get; set; }

        // [column] maps c# property name (PascalCase) to the SQL column name (snake_case)
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Column("timestamp")]
        public DateTime Timestamp { get; set; }

        // JsonDoc handles the unstructured PostgreSQL JSONB data
        [Column("data", TypeName = "jsonb")]
        public JsonDocument? Data { get; set; } = null;

        [Column("created_at")]
        public DateTime IngestionTime { get; set; }
    }
}