using FitNest.Application.Common.CQRS;
using FitNest.Application.Common.Models;
using FitNest.Domain.Entities;
using FitNest.Domain.Enums;
using FitNest.Domain.Interfaces; // Assuming we'll create this
using FluentValidation;

namespace FitNest.Application.Workouts.Commands;

public class CreateWorkoutCommandHandler : ICommandHandler<CreateWorkoutCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateWorkoutCommand> _validator;

    public CreateWorkoutCommandHandler(IApplicationDbContext context, IValidator<CreateWorkoutCommand> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<Result<Guid>> Handle(CreateWorkoutCommand command, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Result<Guid>.Failure(validationResult.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var workout = new Workout
        {
            Id = Guid.NewGuid(),
            UserId = command.UserId,
            TenantId = command.TenantId,
            WorkoutDate = command.WorkoutDate,
            ImageUrl = command.ImageUrl,
            Status = WorkoutStatus.Uploaded,
            VerificationStatus = VerificationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var exerciseDto in command.Exercises)
        {
            workout.Exercises.Add(new Exercise
            {
                Id = Guid.NewGuid(),
                Name = exerciseDto.Name,
                Sets = exerciseDto.Sets,
                Reps = exerciseDto.Reps,
                Weight = exerciseDto.Weight,
                WeightUnit = exerciseDto.WeightUnit,
                Notes = exerciseDto.Notes,
                Order = exerciseDto.Order,
                CreatedAt = DateTime.UtcNow
            });
        }

        _context.Workouts.Add(workout);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(workout.Id);
    }
}

public class CreateWorkoutCommandValidator : AbstractValidator<CreateWorkoutCommand>
{
    public CreateWorkoutCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.WorkoutDate).NotEmpty();
        RuleFor(x => x.Exercises).NotEmpty().WithMessage("At least one exercise is required.");
        RuleForEach(x => x.Exercises).SetValidator(new ExerciseDtoValidator());
    }
}

public class ExerciseDtoValidator : AbstractValidator<ExerciseDto>
{
    public ExerciseDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Sets).GreaterThan(0);
        RuleFor(x => x.Reps).GreaterThan(0);
    }
}
