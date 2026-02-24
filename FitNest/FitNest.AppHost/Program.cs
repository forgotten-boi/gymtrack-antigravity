var builder = DistributedApplication.CreateBuilder(args);

var dbProvider = builder.Configuration["DatabaseProvider"] ?? "PostgreSQL";

if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
{
    // SQL Server mode: uses a local SQL Server container via Aspire.
    // For Azure SQL, skip AddSqlServer and set fitnest-db-sqlserver in FitNest.Api/appsettings.json.
    var sqlServer = builder.AddSqlServer("sqlserver")
        .WithDataVolume();

    var db = sqlServer.AddDatabase("fitnest-db-sqlserver");

    var api = builder.AddProject<Projects.FitNest_Api>("api")
        .WithReference(db)
        .WithEnvironment("DatabaseProvider", "SqlServer")
        .WithExternalHttpEndpoints();

    builder.AddNpmApp("web", "../fitnest-web")
        .WithReference(api)
        .WithHttpEndpoint(env: "PORT")
        .WithExternalHttpEndpoints()
        .PublishAsDockerFile();

    builder.AddNpmApp("mobile", "../fitnest-mobile")
        .WithReference(api)
        .WithHttpEndpoint(env: "PORT")
        .WithExternalHttpEndpoints()
        .PublishAsDockerFile();
}
else
{
    // PostgreSQL mode (default): uses PostgreSQL + PgAdmin via Aspire.
    var postgres = builder.AddPostgres("postgres")
        .WithDataVolume()
        .WithPgAdmin();

    var db = postgres.AddDatabase("fitnest-db");

    var api = builder.AddProject<Projects.FitNest_Api>("api")
        .WithReference(db)
        .WithEnvironment("DatabaseProvider", "PostgreSQL")
        .WithExternalHttpEndpoints();

    builder.AddNpmApp("web", "../fitnest-web")
        .WithReference(api)
        .WithHttpEndpoint(env: "PORT")
        .WithExternalHttpEndpoints()
        .PublishAsDockerFile();

    builder.AddNpmApp("mobile", "../fitnest-mobile")
        .WithReference(api)
        .WithHttpEndpoint(env: "PORT")
        .WithExternalHttpEndpoints()
        .PublishAsDockerFile();
}

builder.Build().Run();
