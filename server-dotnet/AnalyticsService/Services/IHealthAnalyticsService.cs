using System.Threading.Tasks;

namespace AnalyticsService.Services
{
    public interface IHealthAnalyticsService
    {
        Task ProcessRawDataAsync(string UserId);

        Task SetUserProcessingStatus(string userId, bool isProcessing);
    }
}