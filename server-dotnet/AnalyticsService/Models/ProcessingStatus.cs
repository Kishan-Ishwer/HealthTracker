namespace AnalyticsService.Data.Models
{
    public class ProcessingStatus
    {
        public string UserId { get; set; } = string.Empty;

        public bool IsProcessing { get; set; }
    }
}