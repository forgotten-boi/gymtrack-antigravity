using Azure.Storage.Blobs;
using FitNest.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FitNest.Infrastructure.Services;

public class AzureBlobImageService : IImageService
{
    private readonly BlobServiceClient _blobServiceClient;

    public AzureBlobImageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"];
        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadImageAsync(string base64Image, string containerName, string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync();

        var blobClient = containerClient.GetBlobClient(fileName);

        // Strip prefix if present (e.g., "data:image/jpeg;base64,")
        var base64Data = base64Image.Contains(",") 
            ? base64Image.Substring(base64Image.IndexOf(",") + 1) 
            : base64Image;

        var bytes = Convert.FromBase64String(base64Data);
        using var stream = new MemoryStream(bytes);

        await blobClient.UploadAsync(stream, true);

        return blobClient.Uri.ToString();
    }
}
