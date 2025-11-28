using Microsoft.EntityFrameworkCore;
using AnalyticsService.Models;

namespace AnalyticsService.Data
{
    public class HealthContext : DbContext
    {
        public HealthContext(DbContextOptions<HealthContext> options) : base(options)
        {
        }

        public DbSet<RawDataRecord> RawData { get; set; } = default!;
        public DbSet<DailySummary> DailySummaries { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RawDataRecord>().ToTable("raw_health_data");
        }
    }
}