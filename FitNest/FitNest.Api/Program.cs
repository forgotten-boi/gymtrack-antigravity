using FitNest.Application;
using FitNest.Infrastructure;
using FitNest.Infrastructure.Data;
using FitNest.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddServiceDefaults();
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Image Service Registration
if (builder.Configuration.GetValue<bool>("UseAzureStorage"))
{
    builder.Services.AddScoped<FitNest.Application.Common.Interfaces.IImageService, FitNest.Infrastructure.Services.AzureBlobImageService>();
}
else
{
    builder.Services.AddScoped<FitNest.Application.Common.Interfaces.IImageService, FitNest.Infrastructure.Services.Base64ImageService>();
}

// Add Aspire Npgsql client
builder.AddNpgsqlDbContext<ApplicationDbContext>("fitnest-db");

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
