using FitNest.Application.Common.CQRS;
using FitNest.Application.Common.Models;
using FitNest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Application.Workouts.Queries;

public class GetWorkoutByIdQueryHandler : IQueryHandler<GetWorkoutByIdQuery, Result<WorkoutDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWorkoutByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<WorkoutDto>> Handle(GetWorkoutByIdQuery request, CancellationToken cancellationToken = default)
    {
        var workout = await _context.Workouts
            .Include(w => w.Exercises)
            .Include(w => w.User)
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (workout == null)
            return Result<WorkoutDto>.Failure("Workout not found");

        var dto = new WorkoutDto
        {
            Id = workout.Id,
            UserId = workout.UserId,
            UserName = workout.User?.FullName ?? string.Empty,
            WorkoutDate = workout.WorkoutDate,
            ImageUrl = workout.ImageUrl,
            Status = workout.Status.ToString(),
            VerificationStatus = workout.VerificationStatus.ToString(),
            AiConfidenceScore = workout.AiConfidenceScore,
            CreatedAt = workout.CreatedAt,
            Exercises = workout.Exercises.Select(e => new ExerciseDto
            {
                Id = e.Id,
                Name = e.Name,
                Sets = e.Sets,
                Reps = e.Reps,
                Weight = e.Weight,
                WeightUnit = e.WeightUnit,
                Notes = e.Notes
            }).ToList()
        };

        return Result<WorkoutDto>.Success(dto);
    }
}
