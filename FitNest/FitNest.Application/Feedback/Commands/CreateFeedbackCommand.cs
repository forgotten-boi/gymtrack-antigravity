using FitNest.Domain.Entities;
using FitNest.Application.Common.CQRS;
using FitNest.Domain.Interfaces;

namespace FitNest.Application.Feedback.Commands;

public record CreateFeedbackCommand(Guid WorkoutId, Guid CoachId, Guid MemberId, string Content, int? Rating) : ICommand<Guid>;

public class CreateFeedbackCommandHandler : ICommandHandler<CreateFeedbackCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateFeedbackCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = new Domain.Entities.Feedback
        {
            WorkoutId = request.WorkoutId,
            FromCoachId = request.CoachId,
            ToMemberId = request.MemberId,
            Content = request.Content,
            Rating = request.Rating,
            CreatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        return feedback.Id;
    }
}
