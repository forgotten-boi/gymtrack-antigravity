var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.GymTracker_ApiService>("apiservice");

builder.AddProject<Projects.GymTracker_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
