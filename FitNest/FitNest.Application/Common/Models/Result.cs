namespace FitNest.Application.Common.Models;

/// <summary>
/// Generic result wrapper for operations
/// </summary>
public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result<T> Success(T data) => new()
    {
        IsSuccess = true,
        Data = data
    };

    public static Result<T> Failure(string errorMessage) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage
    };

    public static Result<T> Failure(List<string> errors) => new()
    {
        IsSuccess = false,
        Errors = errors
    };
}

public class Result
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result Success() => new() { IsSuccess = true };

    public static Result Failure(string errorMessage) => new()
    {
        IsSuccess = false,
        ErrorMessage = errorMessage
    };

    public static Result Failure(List<string> errors) => new()
    {
        IsSuccess = false,
        Errors = errors
    };
}
