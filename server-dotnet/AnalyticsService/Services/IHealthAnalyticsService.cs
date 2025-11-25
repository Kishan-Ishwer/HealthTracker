using System.Threading.Tasks;

namespace AnalyticsService.Services
{
    public interface IHealthAnalyticsService
    {
        // Defines the contract for the core task: processing raw data for the given user.
        Task ProcessRawDataAsync(string UserId);
    }
}