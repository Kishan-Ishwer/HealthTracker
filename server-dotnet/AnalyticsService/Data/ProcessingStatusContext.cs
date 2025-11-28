using AnalyticsService.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace AnalyticsService.Data
{

    public class ProcessingStatusContext : DbContext
    {
        public DbSet<ProcessingStatus> ProcessingStatuses { get; set; }

        public ProcessingStatusContext(DbContextOptions<ProcessingStatusContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProcessingStatus>()
                .HasKey(ps => ps.UserId);

            modelBuilder.Entity<ProcessingStatus>().ToTable("ProcessingStatuses");
        }
    }
}