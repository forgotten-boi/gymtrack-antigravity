using FitNest.Application.Common.CQRS;
using FitNest.Domain.Entities;

namespace FitNest.Application.Workouts.Queries;

public class GetWorkoutByIdQuery : IQuery<Workout>
{
    public Guid Id { get; set; }
}
