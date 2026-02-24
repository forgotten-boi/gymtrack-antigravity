using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FitNest.Infrastructure.Data;

/// <summary>
/// Used by EF Core CLI tools to create and apply migrations.
///
/// To target a specific provider, set environment variables before running migrations:
///
///   PostgreSQL (default):
///     dotnet ef migrations add MyMigration -p FitNest.Infrastructure -s FitNest.Api
///
///   SQL Server:
///     $env:DatabaseProvider="SqlServer"
///     $env:ConnectionStrings__fitnest-db-sqlserver="Your connection string"
///     dotnet ef migrations add MyMigration -p FitNest.Infrastructure -s FitNest.Api --output-dir Migrations/SqlServer
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var provider = Environment.GetEnvironmentVariable("DatabaseProvider") ?? "PostgreSQL";
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__fitnest-db-sqlserver")
                ?? @"Server=(localdb)\mssqllocaldb;Database=fitnest-db;Trusted_Connection=True;TrustServerCertificate=True;";

            optionsBuilder.UseSqlServer(connStr, x =>
                x.MigrationsHistoryTable("__EFMigrationsHistory", "dbo")
                 .MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
        }
        else
        {
            var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__fitnest-db")
                ?? "Host=localhost;Database=fitnest-db;Username=postgres;Password=postgres";

            optionsBuilder.UseNpgsql(connStr, x =>
                x.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
        }

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
