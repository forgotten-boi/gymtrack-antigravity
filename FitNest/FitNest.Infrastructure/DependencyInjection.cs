using System.Text;
using FitNest.Application.Common.Interfaces;
using FitNest.Domain.Interfaces;
using FitNest.Infrastructure.Data;
using FitNest.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace FitNest.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var dbProvider = configuration["DatabaseProvider"] ?? "PostgreSQL";

        var connectionString = dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase)
            ? configuration.GetConnectionString("fitnest-db-sqlserver")
              ?? configuration.GetConnectionString("DefaultConnection")
              ?? throw new InvalidOperationException("SQL Server connection string 'fitnest-db-sqlserver' is not configured.")
            : configuration.GetConnectionString("fitnest-db")
              ?? configuration.GetConnectionString("DefaultConnection")
              ?? throw new InvalidOperationException("PostgreSQL connection string 'fitnest-db' is not configured.");

        services.AddScoped<Persistence.Interceptors.OutboxInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<Persistence.Interceptors.OutboxInterceptor>();

            if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                    sqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "dbo")
                             .MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
                       .AddInterceptors(interceptor);
            }
            else
            {
                options.UseNpgsql(connectionString, npgOptions =>
                    npgOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
                       .AddInterceptors(interceptor);
            }
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        services.AddHostedService<BackgroundJobs.ProcessOutboxMessagesJob>();

        services.AddIdentityCore<IdentityUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddApiEndpoints();

        // JWT authentication
        var jwtKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured.");
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddBearerToken(IdentityConstants.BearerScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };
        });

        services.AddAuthorizationBuilder();

        // Register JwtService
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}
