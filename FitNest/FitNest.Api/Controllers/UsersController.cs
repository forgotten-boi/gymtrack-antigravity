using FitNest.Domain.Entities;
using FitNest.Domain.Enums;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetProfile(string id)
    {
        if (!Guid.TryParse(id, out var userId)) return BadRequest();

        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(string id, User user)
    {
        if (!Guid.TryParse(id, out var userId)) return BadRequest();
        if (userId != user.Id) return BadRequest();

        var existingUser = await _context.AppUsers.FindAsync(userId);
        if (existingUser == null) return NotFound();

        existingUser.FirstName = user.FirstName;
        existingUser.LastName = user.LastName;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("athletes")]
    public async Task<ActionResult<List<User>>> GetAthletes([FromQuery] Guid tenantId)
    {
        var athletes = await _context.AppUsers
            .Where(u => u.TenantId == tenantId && u.Role == UserRole.Member)
            .ToListAsync();
        return Ok(athletes);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetStats(string id)
    {
        if (!Guid.TryParse(id, out var userId))
            return BadRequest();

        var workouts = await _context.Workouts
            .Where(w => w.UserId == userId)
            .Include(w => w.Exercises)
            .ToListAsync();

        var totalWeight = workouts
            .SelectMany(w => w.Exercises)
            .Sum(e => (e.Weight ?? 0) * e.Sets * e.Reps);

        var streakDays = 0;
        var today = DateTime.UtcNow.Date;
        var workoutDates = workouts
            .Select(w => w.WorkoutDate.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        foreach (var date in workoutDates)
        {
            if (date == today.AddDays(-streakDays))
                streakDays++;
            else
                break;
        }

        return Ok(new
        {
            WorkoutsCompleted = workouts.Count,
            TotalWeightLifted = totalWeight,
            StreakDays = streakDays
        });
    }

    [HttpGet("{id}/prs")]
    public async Task<IActionResult> GetPRs(string id)
    {
        if (!Guid.TryParse(id, out var userId))
            return BadRequest();

        var exercises = await _context.Workouts
            .Where(w => w.UserId == userId)
            .SelectMany(w => w.Exercises.Select(e => new
            {
                e.Name,
                e.Weight,
                WeightUnit = e.WeightUnit ?? "kg",
                w.WorkoutDate
            }))
            .ToListAsync();

        var prs = exercises
            .GroupBy(e => e.Name)
            .Select(g => g.OrderByDescending(e => e.Weight ?? 0).First())
            .Select(e => new
            {
                Exercise = e.Name,
                Weight = e.Weight ?? 0,
                Unit = e.WeightUnit,
                Date = e.WorkoutDate
            })
            .ToList();

        return Ok(prs);
    }
}
