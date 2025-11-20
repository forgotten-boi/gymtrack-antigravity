using FitNest.Application.Common.CQRS;
using FitNest.Application.Common.Models;

namespace FitNest.Application.Workouts.Queries;

public class GetWorkoutsByUserQuery : IQuery<Result<List<WorkoutDto>>>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class WorkoutDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime WorkoutDate { get; set; }
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public string VerificationStatus { get; set; } = string.Empty;
    public decimal? AiConfidenceScore { get; set; }
    public List<ExerciseDto> Exercises { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ExerciseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; }
    public string? Notes { get; set; }
}
