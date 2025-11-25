using AnalyticsService.Data;
using AnalyticsService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AnalyticsService.Controllers
{
    [Route("api/Summary")]
    [ApiController]
    public class SummaryController : ControllerBase
    {
        private readonly HealthContext _context;

        public SummaryController(HealthContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<DailySummary>>> GetSummaries(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required.");
            }

            var summaries = await _context.DailySummaries
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.SummaryDate)
                .ToListAsync();

            if (!summaries.Any())
            {
                return NotFound($"No daily summaries found for user ID: {userId}");
            }

            return Ok(summaries);
        }
    }
}