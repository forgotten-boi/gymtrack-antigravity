using FitNest.Application.Common.CQRS;
using FitNest.Domain.Entities;
using FitNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Application.Workouts.Queries;

public class GetWorkoutByIdQueryHandler : IQueryHandler<GetWorkoutByIdQuery, Workout>
{
    private readonly ApplicationDbContext _context;

    public GetWorkoutByIdQueryHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Workout>> Handle(GetWorkoutByIdQuery request, CancellationToken cancellationToken)
    {
        var workout = await _context.Workouts
            .Include(w => w.Exercises)
            .Include(w => w.Feedback)
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken);

        if (workout == null)
        {
            return Result<Workout>.Failure("Workout not found");
        }

        return Result<Workout>.Success(workout);
    }
}
