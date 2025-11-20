namespace FitNest.Application.Common.Interfaces;

public interface IImageService
{
    Task<string> UploadImageAsync(string base64Image, string containerName, string fileName);
}
