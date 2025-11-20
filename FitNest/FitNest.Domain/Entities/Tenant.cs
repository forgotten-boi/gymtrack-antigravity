using FitNest.Domain.Common;
using FitNest.Domain.Enums;

namespace FitNest.Domain.Entities;

/// <summary>
/// Tenant entity - Each coach is a tenant
/// </summary>
public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Subscription info
    public DateTime? SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public int MaxMembers { get; set; } = 50;
    
    // Navigation properties
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Workout> Workouts { get; set; } = new List<Workout>();
}
