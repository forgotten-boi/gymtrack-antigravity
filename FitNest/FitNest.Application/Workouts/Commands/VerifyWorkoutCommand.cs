using FitNest.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Application.Workouts.Commands;

public record VerifyWorkoutCommand(Guid WorkoutId, Guid CoachId, bool IsVerified, string? Notes) : IRequest<bool>;

public class VerifyWorkoutCommandHandler : IRequestHandler<VerifyWorkoutCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public VerifyWorkoutCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(VerifyWorkoutCommand request, CancellationToken cancellationToken)
    {
        var workout = await _context.Workouts.FindAsync(new object[] { request.WorkoutId }, cancellationToken);

        if (workout == null)
            return false;

        workout.VerificationStatus = request.IsVerified ? VerificationStatus.Verified : VerificationStatus.Rejected;
        workout.VerifiedByCoachId = request.CoachId;
        workout.VerifiedAt = DateTime.UtcNow;
        
        if (!string.IsNullOrEmpty(request.Notes))
        {
            workout.Notes = request.Notes;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
