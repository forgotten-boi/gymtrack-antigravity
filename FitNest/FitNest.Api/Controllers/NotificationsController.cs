using FitNest.Domain.Enums;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/users/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotificationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetNotifications(string userId)
    {
        if (!Guid.TryParse(userId, out var uid))
            return BadRequest();

        var notifications = new List<object>();
        var idCounter = 1;

        // Get recent feedback received by this user
        var feedbacks = await _context.Feedbacks
            .Where(f => f.ToMemberId == uid)
            .OrderByDescending(f => f.CreatedAt)
            .Take(20)
            .Include(f => f.FromCoach)
            .Include(f => f.Workout)
            .ToListAsync();

        foreach (var fb in feedbacks)
        {
            notifications.Add(new
            {
                Id = idCounter++,
                Title = "Coach Feedback",
                Message = $"{fb.FromCoach?.FirstName ?? "Coach"} left feedback on your workout: \"{(fb.Content.Length > 50 ? fb.Content[..50] + "..." : fb.Content)}\"",
                Time = fb.CreatedAt,
                Read = fb.IsRead,
                Type = "primary"
            });
        }

        // Get recently verified/rejected workouts for this user
        var verifiedWorkouts = await _context.Workouts
            .Where(w => w.UserId == uid &&
                        w.VerificationStatus != VerificationStatus.Pending &&
                        w.VerifiedAt != null)
            .OrderByDescending(w => w.VerifiedAt)
            .Take(20)
            .ToListAsync();

        foreach (var w in verifiedWorkouts)
        {
            var isVerified = w.VerificationStatus == VerificationStatus.Verified;
            notifications.Add(new
            {
                Id = idCounter++,
                Title = isVerified ? "Workout Verified" : "Workout Rejected",
                Message = isVerified
                    ? $"Your workout from {w.WorkoutDate:MMM dd} was verified by your coach."
                    : $"Your workout from {w.WorkoutDate:MMM dd} was rejected. {(string.IsNullOrEmpty(w.Notes) ? "" : $"Note: {w.Notes}")}",
                Time = w.VerifiedAt,
                Read = isVerified,
                Type = isVerified ? "success" : "warning"
            });
        }

        // Get recent messages
        var messages = await _context.Messages
            .Where(m => m.ReceiverId == userId && !m.IsRead)
            .OrderByDescending(m => m.Timestamp)
            .Take(10)
            .ToListAsync();

        foreach (var msg in messages)
        {
            notifications.Add(new
            {
                Id = idCounter++,
                Title = "New Message",
                Message = msg.Content.Length > 60 ? msg.Content[..60] + "..." : msg.Content,
                Time = msg.Timestamp,
                Read = msg.IsRead,
                Type = "primary"
            });
        }

        var sorted = notifications
            .OrderByDescending(n => ((dynamic)n).Time)
            .Take(30)
            .ToList();

        return Ok(sorted);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        // For feedback-based notifications, mark feedback as read
        var feedbacks = await _context.Feedbacks
            .Where(f => !f.IsRead)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        if (id > 0 && id <= feedbacks.Count)
        {
            var fb = feedbacks[id - 1];
            fb.IsRead = true;
            fb.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return Ok(new { Success = true });
    }
}
