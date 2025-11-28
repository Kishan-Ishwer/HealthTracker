using AnalyticsService.Models;
using Microsoft.EntityFrameworkCore;

namespace AnalyticsService.Data
{
    public class SummaryContext : DbContext
    {
        public SummaryContext(DbContextOptions<SummaryContext> options) : base(options)
        {
        }

        public DbSet<DailySummary> DailySummaries { get; set; } = default!;

        public DbSet<UserStatus> UserStatus { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserStatus>()
                .HasKey(s => s.UserId);

            modelBuilder.Entity<DailySummary>()
                .HasKey(s => new { s.UserId, s.SummaryDate });
        }
    }
}