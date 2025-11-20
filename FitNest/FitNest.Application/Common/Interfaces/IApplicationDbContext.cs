using FitNest.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Domain.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> AppUsers { get; }
    DbSet<Tenant> Tenants { get; }
    DbSet<Workout> Workouts { get; }
    DbSet<Exercise> Exercises { get; }
    DbSet<Feedback> Feedbacks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
