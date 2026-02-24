using FitNest.Domain.Common;

namespace FitNest.Domain.Entities;

public class AiChatMessage : BaseEntity
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = "user"; // user, assistant
    public string Content { get; set; } = string.Empty;
    public string? ResponseType { get; set; } // text, workout_plan, calorie_card, progress_card
}
