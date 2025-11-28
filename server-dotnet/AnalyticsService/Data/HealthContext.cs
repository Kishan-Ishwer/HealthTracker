using AnalyticsService.Data.Models;
using AnalyticsService.Models;
using Microsoft.EntityFrameworkCore;

namespace AnalyticsService.Data
{
    public class HealthContext : DbContext
    {
        public DbSet<RawDataRecord> RawData { get; set; } = null!;

        public DbSet<DailySummary> DailySummaries { get; set; } = null!;

        public HealthContext(DbContextOptions<HealthContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the RawDataRecord
            modelBuilder.Entity<RawDataRecord>()
                .HasKey(r => r.Id);

            // Configure the DailySummary (Composite Key: UserId + Date)
            modelBuilder.Entity<DailySummary>()
                .HasKey(s => new { s.UserId, s.SummaryDate });
        }
    }
}