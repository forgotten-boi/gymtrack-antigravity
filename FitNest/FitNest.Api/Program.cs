using FitNest.Application;
using FitNest.Infrastructure;
using FitNest.Infrastructure.Data;
using FitNest.Api.Hubs;
using FitNest.Domain.Entities;
using FitNest.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

// Enrich the existing DbContext with Aspire-managed connection string based on provider.
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "PostgreSQL";
if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
{
    builder.EnrichSqlServerDbContext<ApplicationDbContext>();
}
else
{
    builder.EnrichNpgsqlDbContext<ApplicationDbContext>();
}

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:4200", "http://localhost:8100" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer {token}'"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

// Database initialization and seeding (development only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    await context.Database.EnsureCreatedAsync();

    // Seed roles
    if (!await roleManager.RoleExistsAsync("Coach"))
        await roleManager.CreateAsync(new IdentityRole("Coach"));
    if (!await roleManager.RoleExistsAsync("Member"))
        await roleManager.CreateAsync(new IdentityRole("Member"));

    // Seed tenant + users if empty
    if (!context.Tenants.Any())
    {
        var tenantId = Guid.NewGuid();
        var coachId = Guid.NewGuid();
        var member1Id = Guid.NewGuid();
        var member2Id = Guid.NewGuid();
        var member3Id = Guid.NewGuid();

        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "AntiGravity Fitness",
            Description = "Premier coaching studio",
            IsActive = true,
            MaxMembers = 50,
            SubscriptionStartDate = DateTime.UtcNow.AddMonths(-6),
            SubscriptionEndDate = DateTime.UtcNow.AddMonths(6),
            CreatedAt = DateTime.UtcNow
        };
        context.Tenants.Add(tenant);

        // Create Identity users
        var coachIdentity = new IdentityUser { Id = coachId.ToString(), UserName = "coach@fitnest.com", Email = "coach@fitnest.com", EmailConfirmed = true };
        await userManager.CreateAsync(coachIdentity, "Coach123!");
        await userManager.AddToRoleAsync(coachIdentity, "Coach");

        var member1Identity = new IdentityUser { Id = member1Id.ToString(), UserName = "john@fitnest.com", Email = "john@fitnest.com", EmailConfirmed = true };
        await userManager.CreateAsync(member1Identity, "Member123!");
        await userManager.AddToRoleAsync(member1Identity, "Member");

        var member2Identity = new IdentityUser { Id = member2Id.ToString(), UserName = "sarah@fitnest.com", Email = "sarah@fitnest.com", EmailConfirmed = true };
        await userManager.CreateAsync(member2Identity, "Member123!");
        await userManager.AddToRoleAsync(member2Identity, "Member");

        var member3Identity = new IdentityUser { Id = member3Id.ToString(), UserName = "mike@fitnest.com", Email = "mike@fitnest.com", EmailConfirmed = true };
        await userManager.CreateAsync(member3Identity, "Member123!");
        await userManager.AddToRoleAsync(member3Identity, "Member");

        // App users
        var coach = new User { Id = coachId, Email = "coach@fitnest.com", FirstName = "Alex", LastName = "Rivera", Role = UserRole.Coach, TenantId = tenantId, CreatedAt = DateTime.UtcNow };
        var member1 = new User { Id = member1Id, Email = "john@fitnest.com", FirstName = "John", LastName = "Smith", Role = UserRole.Member, TenantId = tenantId, AssignedCoachId = coachId, CreatedAt = DateTime.UtcNow };
        var member2 = new User { Id = member2Id, Email = "sarah@fitnest.com", FirstName = "Sarah", LastName = "Johnson", Role = UserRole.Member, TenantId = tenantId, AssignedCoachId = coachId, CreatedAt = DateTime.UtcNow };
        var member3 = new User { Id = member3Id, Email = "mike@fitnest.com", FirstName = "Mike", LastName = "Williams", Role = UserRole.Member, TenantId = tenantId, AssignedCoachId = coachId, CreatedAt = DateTime.UtcNow };
        context.AppUsers.AddRange(coach, member1, member2, member3);

        // Workouts for member1
        var workout1Id = Guid.NewGuid();
        var workout2Id = Guid.NewGuid();
        var workout3Id = Guid.NewGuid();

        context.Workouts.AddRange(
            new Workout
            {
                Id = workout1Id, UserId = member1Id, TenantId = tenantId,
                WorkoutDate = DateTime.UtcNow.AddDays(-1), Status = WorkoutStatus.Completed,
                VerificationStatus = VerificationStatus.Pending, Notes = "Push day",
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Workout
            {
                Id = workout2Id, UserId = member1Id, TenantId = tenantId,
                WorkoutDate = DateTime.UtcNow.AddDays(-3), Status = WorkoutStatus.Completed,
                VerificationStatus = VerificationStatus.Verified, VerifiedByCoachId = coachId,
                VerifiedAt = DateTime.UtcNow.AddDays(-2), Notes = "Leg day",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Workout
            {
                Id = workout3Id, UserId = member2Id, TenantId = tenantId,
                WorkoutDate = DateTime.UtcNow.AddDays(-2), Status = WorkoutStatus.Completed,
                VerificationStatus = VerificationStatus.Pending, Notes = "Full body",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        );

        // Exercises
        context.Exercises.AddRange(
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout1Id, Name = "Bench Press", Sets = 4, Reps = 8, Weight = 185, WeightUnit = "lbs", Order = 1, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout1Id, Name = "Incline Dumbbell Press", Sets = 3, Reps = 10, Weight = 70, WeightUnit = "lbs", Order = 2, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout1Id, Name = "Tricep Pushdowns", Sets = 3, Reps = 12, Weight = 50, WeightUnit = "lbs", Order = 3, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout2Id, Name = "Squat", Sets = 5, Reps = 5, Weight = 275, WeightUnit = "lbs", Order = 1, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout2Id, Name = "Romanian Deadlift", Sets = 3, Reps = 10, Weight = 185, WeightUnit = "lbs", Order = 2, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout2Id, Name = "Leg Press", Sets = 3, Reps = 12, Weight = 360, WeightUnit = "lbs", Order = 3, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout3Id, Name = "Deadlift", Sets = 3, Reps = 5, Weight = 315, WeightUnit = "lbs", Order = 1, CreatedAt = DateTime.UtcNow },
            new Exercise { Id = Guid.NewGuid(), WorkoutId = workout3Id, Name = "Pull-ups", Sets = 3, Reps = 8, Weight = 0, WeightUnit = "lbs", Order = 2, CreatedAt = DateTime.UtcNow }
        );

        // Feedback
        context.Feedbacks.Add(new Feedback
        {
            Id = Guid.NewGuid(), WorkoutId = workout2Id, FromCoachId = coachId, ToMemberId = member1Id,
            Content = "Great leg session! Your squat depth has improved significantly. Keep pushing the progressive overload.",
            Rating = 5, IsRead = false, CreatedAt = DateTime.UtcNow.AddDays(-2)
        });

        await context.SaveChangesAsync();
    }
}

app.Run();
