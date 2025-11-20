using FitNest.Application.Common.CQRS;
using FitNest.Application.Common.Models;
using FitNest.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Application.Workouts.Queries;

public class GetWorkoutsByUserQueryHandler : IQueryHandler<GetWorkoutsByUserQuery, Result<List<WorkoutDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetWorkoutsByUserQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<WorkoutDto>>> Handle(GetWorkoutsByUserQuery query, CancellationToken cancellationToken = default)
    {
        var queryable = _context.Workouts
            .Include(w => w.Exercises)
            .Include(w => w.User)
            .Where(w => w.UserId == query.UserId && w.TenantId == query.TenantId);

        if (query.StartDate.HasValue)
            queryable = queryable.Where(w => w.WorkoutDate >= query.StartDate.Value);

        if (query.EndDate.HasValue)
            queryable = queryable.Where(w => w.WorkoutDate <= query.EndDate.Value);

        var workouts = await queryable
            .OrderByDescending(w => w.WorkoutDate)
            .Select(w => new WorkoutDto
            {
                Id = w.Id,
                UserId = w.UserId,
                UserName = w.User.FullName,
                WorkoutDate = w.WorkoutDate,
                ImageUrl = w.ImageUrl,
                Status = w.Status.ToString(),
                VerificationStatus = w.VerificationStatus.ToString(),
                AiConfidenceScore = w.AiConfidenceScore,
                CreatedAt = w.CreatedAt,
                Exercises = w.Exercises.Select(e => new ExerciseDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Sets = e.Sets,
                    Reps = e.Reps,
                    Weight = e.Weight,
                    WeightUnit = e.WeightUnit,
                    Notes = e.Notes
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return Result<List<WorkoutDto>>.Success(workouts);
    }
}
