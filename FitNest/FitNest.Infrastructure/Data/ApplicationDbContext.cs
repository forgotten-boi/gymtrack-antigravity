using FitNest.Domain.Interfaces;
using FitNest.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> AppUsers { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Workout> Workouts { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<OutboxMessage> OutboxMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure User
        builder.Entity<User>(entity =>
        {
            entity.HasOne(u => u.Tenant)
                .WithMany(t => t.Users)
                .HasForeignKey(u => u.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(u => u.AssignedCoach)
                .WithMany()
                .HasForeignKey(u => u.AssignedCoachId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Workout
        builder.Entity<Workout>(entity =>
        {
            entity.HasOne(w => w.User)
                .WithMany(u => u.Workouts)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(w => w.Tenant)
                .WithMany(t => t.Workouts)
                .HasForeignKey(w => w.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Feedback
        builder.Entity<Feedback>(entity =>
        {
            entity.HasOne(f => f.FromCoach)
                .WithMany(u => u.GivenFeedback)
                .HasForeignKey(f => f.FromCoachId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.ToMember)
                .WithMany(u => u.ReceivedFeedback)
                .HasForeignKey(f => f.ToMemberId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Message
        builder.Entity<Message>(entity =>
        {
            entity.HasIndex(m => m.SenderId);
            entity.HasIndex(m => m.ReceiverId);
        });
    }
}
