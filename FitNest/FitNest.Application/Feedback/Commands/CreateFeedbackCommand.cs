using FitNest.Domain.Entities;
using MediatR;

namespace FitNest.Application.Feedback.Commands;

public record CreateFeedbackCommand(Guid WorkoutId, Guid CoachId, Guid MemberId, string Content, int? Rating) : IRequest<Guid>;

public class CreateFeedbackCommandHandler : IRequestHandler<CreateFeedbackCommand, Guid>
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
            Timestamp = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        return feedback.Id;
    }
}
