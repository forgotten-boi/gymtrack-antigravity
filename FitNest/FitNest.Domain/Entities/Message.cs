using System;
using FitNest.Domain.Common;

namespace FitNest.Domain.Entities;

public class Message : BaseEntity
{
    public string SenderId { get; set; } = string.Empty;
    public string ReceiverId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    // Navigation properties if needed, but keeping it simple for now with IDs
    // public User Sender { get; set; }
    // public User Receiver { get; set; }
}
