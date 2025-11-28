using AnalyticsService.Data;
using AnalyticsService.Data.Models; // Ensure this points to your DailySummary and ProcessingStatus models
using AnalyticsService.Models;
using AnalyticsService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AnalyticsService.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // this sets the base URL to /api/Data
    public class DataController : ControllerBase
    {
        private readonly HealthContext _healthContext;
        private readonly ProcessingStatusContext _statusContext;

        private readonly IHealthAnalyticsService _analyticsService;

        public DataController(
            HealthContext healthContext,
            ProcessingStatusContext statusContext,
            IHealthAnalyticsService analyticsService)
        {
            _healthContext = healthContext;
            _statusContext = statusContext;
            _analyticsService = analyticsService;
        }

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

            var userStatus = await _statusContext.ProcessingStatuses.FindAsync(userId);

            if (userStatus != null && userStatus.IsProcessing)
            {

                return StatusCode(425, new
                {
                    message = "Data processing is currently running. Please wait and retry the request.",
                    status = "processing_pending"
                });
            }

            var summaries = await _healthContext.DailySummaries
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SummaryDate)
                .ToListAsync();

            if (!summaries.Any())
            {
                return NotFound($"No summary data found for user ID: {userId}");
            }

            return summaries;
        }
    }
}