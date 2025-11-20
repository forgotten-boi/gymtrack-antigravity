var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var db = postgres.AddDatabase("fitnest-db");

// Backend API
var api = builder.AddProject<Projects.FitNest_Api>("api")
    .WithReference(db)
    .WithExternalHttpEndpoints();

// Angular Web App
var web = builder.AddNpmApp("web", "../fitnest-web")
    .WithReference(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

// Ionic Mobile App
var mobile = builder.AddNpmApp("mobile", "../fitnest-mobile")
    .WithReference(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();
