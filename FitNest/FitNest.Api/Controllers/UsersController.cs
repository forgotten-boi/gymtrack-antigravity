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

    public record OnboardingRequest(
        string? FitnessGoals, string? ExperienceLevel, decimal? Height,
        decimal? CurrentWeight, DateTime? DateOfBirth, string? DietaryPreference,
        int? WeeklyFrequency, int? DailyCalorieGoal);

    [HttpPost("{id}/onboarding")]
    public async Task<IActionResult> SaveOnboarding(string id, [FromBody] OnboardingRequest request)
    {
        if (!Guid.TryParse(id, out var userId)) return BadRequest();

        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return NotFound();

        user.FitnessGoals = request.FitnessGoals;
        user.ExperienceLevel = request.ExperienceLevel;
        user.Height = request.Height;
        user.CurrentWeight = request.CurrentWeight;
        user.DateOfBirth = request.DateOfBirth;
        user.DietaryPreference = request.DietaryPreference;
        user.WeeklyFrequency = request.WeeklyFrequency;
        user.DailyCalorieGoal = request.DailyCalorieGoal ?? 2000;
        user.OnboardingCompleted = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Onboarding completed", user.OnboardingCompleted });
    }

    [HttpGet("{id}/adherence")]
    public async Task<IActionResult> GetAdherence(string id, [FromQuery] int weeks = 8)
    {
        if (!Guid.TryParse(id, out var userId)) return BadRequest();

        var user = await _context.AppUsers.FindAsync(userId);
        if (user == null) return NotFound();

        var targetPerWeek = user.WeeklyFrequency ?? 4;
        var startDate = DateTime.UtcNow.Date.AddDays(-weeks * 7);

        var workouts = await _context.Workouts
            .Where(w => w.UserId == userId && w.WorkoutDate >= startDate)
            .Select(w => w.WorkoutDate)
            .ToListAsync();

        var weeklyAdherence = new List<object>();
        for (int i = 0; i < weeks; i++)
        {
            var weekStart = startDate.AddDays(i * 7);
            var weekEnd = weekStart.AddDays(7);
            var count = workouts.Count(d => d >= weekStart && d < weekEnd);
            var pct = targetPerWeek > 0 ? Math.Min(100, (int)(count * 100.0 / targetPerWeek)) : 0;
            weeklyAdherence.Add(new { WeekStart = weekStart, WorkoutCount = count, Target = targetPerWeek, AdherencePercent = pct });
        }

        var adherenceValues = weeklyAdherence.Cast<dynamic>().Select(w => (int)w.AdherencePercent).ToList();
        var overallAdherence = adherenceValues.Count > 0 ? (int)adherenceValues.Average() : 0;

        return Ok(new { overallAdherence, targetPerWeek, weeklyAdherence });
    }
}
