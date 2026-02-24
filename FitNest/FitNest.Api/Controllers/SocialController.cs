using FitNest.Domain.Entities;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SocialController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SocialController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("friends/{userId}")]
    public async Task<IActionResult> GetFriends(Guid userId)
    {
        var friendIds = await _context.Friendships
            .Where(f => f.UserId == userId || f.FriendId == userId)
            .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
            .Distinct()
            .ToListAsync();

        var friends = await _context.AppUsers
            .Where(u => friendIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.ProfileImageUrl,
                u.Email,
                FullName = u.FirstName + " " + u.LastName,
                WorkoutsThisWeek = u.Workouts.Count(w =>
                    w.WorkoutDate >= DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek)),
                StreakDays = u.Workouts
                    .Select(w => w.WorkoutDate.Date)
                    .Distinct()
                    .OrderByDescending(d => d)
                    .Count()
            })
            .ToListAsync();

        return Ok(friends);
    }

    [HttpPost("friends")]
    public async Task<IActionResult> AddFriend([FromBody] AddFriendRequest request)
    {
        // Check if already friends
        var exists = await _context.Friendships.AnyAsync(f =>
            (f.UserId == request.UserId && f.FriendId == request.FriendId) ||
            (f.UserId == request.FriendId && f.FriendId == request.UserId));
        if (exists) return BadRequest(new { message = "Already friends" });

        var friendship = new Friendship
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            FriendId = request.FriendId,
            AcceptedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();

        return Ok(friendship);
    }

    [HttpDelete("friends")]
    public async Task<IActionResult> RemoveFriend([FromQuery] Guid userId, [FromQuery] Guid friendId)
    {
        var friendship = await _context.Friendships.FirstOrDefaultAsync(f =>
            (f.UserId == userId && f.FriendId == friendId) ||
            (f.UserId == friendId && f.FriendId == userId));

        if (friendship == null) return NotFound();

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("leaderboard/{userId}")]
    public async Task<IActionResult> GetLeaderboard(Guid userId)
    {
        var friendIds = await _context.Friendships
            .Where(f => f.UserId == userId || f.FriendId == userId)
            .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
            .Distinct()
            .ToListAsync();

        friendIds.Add(userId); // Include self

        var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);

        var leaderboard = await _context.AppUsers
            .Where(u => friendIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.ProfileImageUrl,
                FullName = u.FirstName + " " + u.LastName,
                WorkoutsThisWeek = u.Workouts.Count(w => w.WorkoutDate >= startOfWeek),
                TotalWeightThisWeek = u.Workouts
                    .Where(w => w.WorkoutDate >= startOfWeek)
                    .SelectMany(w => w.Exercises)
                    .Sum(e => (e.Weight ?? 0) * e.Sets * e.Reps),
                IsCurrentUser = u.Id == userId
            })
            .OrderByDescending(u => u.WorkoutsThisWeek)
            .ThenByDescending(u => u.TotalWeightThisWeek)
            .ToListAsync();

        return Ok(leaderboard);
    }

    [HttpGet("feed/{userId}")]
    public async Task<IActionResult> GetActivityFeed(Guid userId)
    {
        var friendIds = await _context.Friendships
            .Where(f => f.UserId == userId || f.FriendId == userId)
            .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
            .Distinct()
            .ToListAsync();

        var recentWorkouts = await _context.Workouts
            .Where(w => friendIds.Contains(w.UserId))
            .Include(w => w.User)
            .Include(w => w.Exercises)
            .OrderByDescending(w => w.WorkoutDate)
            .Take(20)
            .Select(w => new
            {
                Type = "workout",
                w.Id,
                UserName = w.User.FirstName + " " + w.User.LastName,
                w.User.ProfileImageUrl,
                w.WorkoutDate,
                ExerciseCount = w.Exercises.Count,
                TotalVolume = w.Exercises.Sum(e => (e.Weight ?? 0) * e.Sets * e.Reps),
                TopExercise = w.Exercises.OrderByDescending(e => e.Weight).Select(e => e.Name).FirstOrDefault(),
                w.Notes
            })
            .ToListAsync();

        return Ok(recentWorkouts);
    }

    [HttpGet("suggested/{userId}")]
    public async Task<IActionResult> GetSuggestedFriends(Guid userId)
    {
        var currentFriendIds = await _context.Friendships
            .Where(f => f.UserId == userId || f.FriendId == userId)
            .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
            .Distinct()
            .ToListAsync();

        currentFriendIds.Add(userId);

        // Get user's tenant
        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return NotFound();

        var suggested = await _context.AppUsers
            .Where(u => u.TenantId == user.TenantId && !currentFriendIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.ProfileImageUrl,
                FullName = u.FirstName + " " + u.LastName,
                WorkoutCount = u.Workouts.Count
            })
            .Take(10)
            .ToListAsync();

        return Ok(suggested);
    }

    public record AddFriendRequest(Guid UserId, Guid FriendId);
}
