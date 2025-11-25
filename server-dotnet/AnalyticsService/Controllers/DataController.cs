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
        private readonly HealthContext _context;

        // DI: The Services are auto provided
        public DataController(IHealthAnalyticsService analyticsService, HealthContext context)
        {
            _analyticsService = analyticsService;
            _context = context;
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
            var summaries = await _context.DailySummaries
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