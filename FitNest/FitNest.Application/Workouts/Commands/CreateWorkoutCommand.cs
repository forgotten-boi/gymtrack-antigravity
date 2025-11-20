using FitNest.Application.Common.CQRS;
using FitNest.Application.Common.Models;
using FitNest.Domain.Entities;

namespace FitNest.Application.Workouts.Commands;

public class CreateWorkoutCommand : ICommand<Result<Guid>>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime WorkoutDate { get; set; }
    public string? ImageUrl { get; set; }
    public List<ExerciseDto> Exercises { get; set; } = new();
}

public class ExerciseDto
{
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; } = "kg";
    public string? Notes { get; set; }
    public int Order { get; set; }
}
