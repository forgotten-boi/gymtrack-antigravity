using FitNest.Domain.Common;
using FitNest.Domain.Enums;

namespace FitNest.Domain.Entities;

/// <summary>
/// Workout entity - Captured by users, viewed by their coach
/// </summary>
public class Workout : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;
    
    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;
    
    public DateTime WorkoutDate { get; set; }
    public string? ImageUrl { get; set; }
    public WorkoutStatus Status { get; set; } = WorkoutStatus.Uploaded;
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
    
    // AI extracted data
    public string? AiExtractedText { get; set; }
    public decimal? AiConfidenceScore { get; set; }
    
    // Manual override
    public string? Notes { get; set; }
    public Guid? VerifiedByCoachId { get; set; }
    public DateTime? VerifiedAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
    public virtual ICollection<Feedback> Feedback { get; set; } = new List<Feedback>();
}

/// <summary>
/// Exercise entity - Individual exercises within a workout
/// </summary>
public class Exercise : BaseEntity
{
    public Guid WorkoutId { get; set; }
    public virtual Workout Workout { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public decimal? Weight { get; set; }
    public string? WeightUnit { get; set; } = "kg";
    public string? Notes { get; set; }
    public int Order { get; set; }
}
