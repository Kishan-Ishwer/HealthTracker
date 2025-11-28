using System.ComponentModel.DataAnnotations;

namespace AnalyticsService.Models
{
    public class UserStatus
    {
        public string UserId { get; set; } = string.Empty;

        public bool IsProcessing { get; set; }

        public DateTime LastProcessedDate { get; set; } = DateTime.UtcNow;
    }
}