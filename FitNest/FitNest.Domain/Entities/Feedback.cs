using FitNest.Domain.Common;

namespace FitNest.Domain.Entities;

/// <summary>
/// Feedback entity - Coach feedback to members
/// </summary>
public class Feedback : BaseEntity
{
    public Guid WorkoutId { get; set; }
    public virtual Workout Workout { get; set; } = null!;
    
    public Guid FromCoachId { get; set; }
    public virtual User FromCoach { get; set; } = null!;
    
    public Guid ToMemberId { get; set; }
    public virtual User ToMember { get; set; } = null!;
    
    public string Content { get; set; } = string.Empty;
    public int? Rating { get; set; } // 1-5 stars
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
}
