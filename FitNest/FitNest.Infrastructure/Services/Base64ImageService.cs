using FitNest.Application.Common.Interfaces;

namespace FitNest.Infrastructure.Services;

public class Base64ImageService : IImageService
{
    public Task<string> UploadImageAsync(string base64Image, string containerName, string fileName)
    {
        // For Base64, we just return the string as is, effectively storing it in the DB
        // In a real scenario, we might want to validate it's a valid image
        return Task.FromResult(base64Image);
    }
}
