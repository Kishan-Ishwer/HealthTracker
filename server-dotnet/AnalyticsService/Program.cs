using AnalyticsService.Data;
using AnalyticsService.Data.Models;
using AnalyticsService.Services;
using AnalyticsService.Workers;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var dbHost = "127.0.0.1";
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "postgres";
var dbPass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "mysecretpassword";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "health_tracker";

var connectionString = $"Host={dbHost};Port={dbPort};Username={dbUser};Password={dbPass};Database={dbName}";


builder.Services.AddDbContext<HealthContext>(options =>
    options.UseNpgsql(connectionString)
);

var sqliteConnectionString = builder.Configuration.GetConnectionString("ProcessingStatusConnection")
                             ?? "Data Source=processing_status.db";

builder.Services.AddDbContext<ProcessingStatusContext>(options =>
    options.UseSqlite(sqliteConnectionString)
);

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            // Allows all origins for local development (e.g., React on port 3000)
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddScoped<IHealthAnalyticsService, HealthAnalyticsService>();

builder.Services.AddHostedService<ProcessingQueueConsumer>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var statusContext = scope.ServiceProvider.GetRequiredService<ProcessingStatusContext>();
    statusContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.UseCors(MyAllowSpecificOrigins);

app.MapControllers();

app.Run();