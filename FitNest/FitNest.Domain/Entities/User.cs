using FitNest.Domain.Common;
using FitNest.Domain.Enums;

namespace FitNest.Domain.Entities;

/// <summary>
/// User entity - Coaches and Members (gym-goers)
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } // For ASP.NET Identity
    public string? FirebaseUid { get; set; } // For Firebase auth
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    
    // Multi-tenancy: Users belong to a coach (tenant)
    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;
    
    // Profile info
    public string? ProfileImageUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }

    // Onboarding data
    public string? FitnessGoals { get; set; } // JSON array: ["weight_loss","muscle_gain",...]
    public string? ExperienceLevel { get; set; } // beginner, intermediate, advanced
    public decimal? Height { get; set; } // cm
    public decimal? CurrentWeight { get; set; } // kg
    public string? DietaryPreference { get; set; } // standard, vegetarian, vegan, keto, etc.
    public int? WeeklyFrequency { get; set; } // target workouts per week
    public bool OnboardingCompleted { get; set; } = false;
    public int DailyCalorieGoal { get; set; } = 2000;

    // For members: assigned coach
    public Guid? AssignedCoachId { get; set; }
    public virtual User? AssignedCoach { get; set; }
    
    // Navigation properties
    public virtual ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    public virtual ICollection<Feedback> ReceivedFeedback { get; set; } = new List<Feedback>();
    public virtual ICollection<Feedback> GivenFeedback { get; set; } = new List<Feedback>();
    
    public string FullName => $"{FirstName} {LastName}";
}
