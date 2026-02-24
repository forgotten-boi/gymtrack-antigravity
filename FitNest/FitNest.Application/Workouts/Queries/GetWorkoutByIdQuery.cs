using FitNest.Application.Common.CQRS;
using FitNest.Application.Common.Models;

namespace FitNest.Application.Workouts.Queries;

public class GetWorkoutByIdQuery : IQuery<Result<WorkoutDto>>
{
    public Guid Id { get; set; }
}
