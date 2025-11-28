using AnalyticsService.Models;
using AnalyticsService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnalyticsService.Data; // Required for HealthContext

namespace AnalyticsService.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // this sets tje base URL to /api/Data
    public class DataController : ControllerBase
    {
        private readonly IHealthAnalyticsService _analyticsService;
        private readonly SummaryContext _summaryContext;

        // DI: The Services are auto provided
        public DataController(IHealthAnalyticsService analyticsService, SummaryContext summaryContext)
        {
            _analyticsService = analyticsService;
            _summaryContext = summaryContext;
        }

        // 1. EndPoint to Trigger Data Processing
        // POST /api/data/process/user-abc-123
        [HttpPost("process/{userId}")]
        public async Task<IActionResult> ProcessData(string userId)
        {
            await _analyticsService.ProcessRawDataAsync(userId);

            return Ok(new { message = $"Processing complete for user: {userId}" });
        }

        // 2. Endpoint to Retrive Summary Data
        // GET /api/data/summary/user-abc-123
        [HttpGet("summary/{userId}")]
        public async Task<ActionResult<IEnumerable<DailySummary>>> GetDailySummary(string userId)
        {

            var userStatus = await _summaryContext.UserStatus.FindAsync(userId);

            if (userStatus != null && userStatus.IsProcessing)
            {
                // Status code 425 Too Early indicates the data is being prepared/updated.
                // This forces the client to retry later, guaranteeing data consistency.
                return StatusCode(425, new
                {
                    message = "Data processing is currently running. Please wait and retry the request.",
                    status = "processing_pending"
                });
            }

            var summaries = await _summaryContext.DailySummaries
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SummaryDate)
                .ToListAsync();

            if (!summaries.Any())
            {
                return NotFound($"No summary data found for user ID: {userId}");
            }

            //Return the list of summaries as a 200 OK response
            return summaries;
        }
    }
}