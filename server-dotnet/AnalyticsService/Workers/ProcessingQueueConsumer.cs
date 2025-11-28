using AnalyticsService.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AnalyticsService.Workers
{
    public class ProcessingQueueConsumer : BackgroundService
    {
        private class ProcessingEvent
        {
            public string UserId { get; set; } = string.Empty;
            public int RecordCount { get; set; }
        }

        private readonly IServiceProvider _serviceProvider;
        private IConnection _connection = null!;

        private IChannel _channel = null!;

        private const string QUEUE_NAME = "health_data_ingested";
        private const string RABBITMQ_HOST = "localhost";

        public ProcessingQueueConsumer(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        private async Task InitializeRabbitMqAsync()
        {
            var factory = new ConnectionFactory() { HostName = RABBITMQ_HOST };

            _connection = await factory.CreateConnectionAsync();

            _channel = await _connection.CreateChannelAsync();

            await _channel.QueueDeclareAsync(queue: QUEUE_NAME, durable: true, exclusive: false, autoDelete: false, arguments: null);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await InitializeRabbitMqAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RabbitMQ Init Error] Could not connect to RabbitMQ at {RABBITMQ_HOST}: {ex.Message}");
                return;
            }

            var consumer = new AsyncEventingBasicConsumer(_channel);

            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var analyticsService = scope.ServiceProvider.GetRequiredService<IHealthAnalyticsService>();
                    ProcessingEvent? eventData = null;

                    try
                    {
                        eventData = JsonSerializer.Deserialize<ProcessingEvent>(message);

                        if (eventData?.UserId == null)
                        {
                            Console.WriteLine($"[MQ Error] Received invalid event data: {message}");
                            await _channel.BasicAckAsync(ea.DeliveryTag, false);
                            return;
                        }

                        Console.WriteLine($"[MQ Consumer] Starting processing for user: {eventData.UserId}");

                        // 1. START LOCK
                        await analyticsService.SetUserProcessingStatus(eventData.UserId, true);

                        // 2. RUN PROCESSING
                        await analyticsService.ProcessRawDataAsync(eventData.UserId);

                        // 3. END LOCK
                        await analyticsService.SetUserProcessingStatus(eventData.UserId, false);

                        await _channel.BasicAckAsync(ea.DeliveryTag, false);
                        Console.WriteLine($"[MQ Consumer] Processing and ACK successful for user: {eventData.UserId}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[MQ Error] Critical processing failure for user {eventData?.UserId}. Error: {ex.Message}");
                        if (eventData?.UserId != null)
                        {
                            await analyticsService.SetUserProcessingStatus(eventData.UserId, false);
                        }
                        await _channel.BasicAckAsync(ea.DeliveryTag, false);
                    }
                }
            };

            _ = await _channel.BasicConsumeAsync(queue: QUEUE_NAME, autoAck: false, consumer: consumer);
        }

        public override void Dispose()
        {
            _channel?.CloseAsync();
            _channel?.Dispose();
            _connection?.CloseAsync();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}