using FitNest.Domain.Common;

namespace FitNest.Domain.Entities;

public class Friendship : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid FriendId { get; set; }
    public DateTime AcceptedAt { get; set; } = DateTime.UtcNow;
}
