using FitNest.Domain.Entities;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NutritionController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NutritionController(ApplicationDbContext context)
    {
        _context = context;
    }

    public record CreateMealRequest(
        Guid UserId, string Name, int Calories, decimal Protein,
        decimal Carbs, decimal Fat, string Source, string MealType,
        string? ImageUrl = null, DateTime? Date = null);

    [HttpGet]
    public async Task<IActionResult> GetMeals([FromQuery] Guid userId, [FromQuery] DateTime? date)
    {
        var targetDate = date?.Date ?? DateTime.UtcNow.Date;
        var meals = await _context.Meals
            .Where(m => m.UserId == userId && m.Date.Date == targetDate)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

        var totals = new
        {
            Calories = meals.Sum(m => m.Calories),
            Protein = meals.Sum(m => m.Protein),
            Carbs = meals.Sum(m => m.Carbs),
            Fat = meals.Sum(m => m.Fat)
        };

        // Get user's daily goal
        var user = await _context.AppUsers.FindAsync(userId);
        var dailyGoal = user?.DailyCalorieGoal ?? 2000;

        return Ok(new { meals, totals, dailyGoal });
    }

    [HttpPost]
    public async Task<IActionResult> CreateMeal([FromBody] CreateMealRequest request)
    {
        var meal = new Meal
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Date = request.Date ?? DateTime.UtcNow,
            Name = request.Name,
            Calories = request.Calories,
            Protein = request.Protein,
            Carbs = request.Carbs,
            Fat = request.Fat,
            Source = request.Source,
            MealType = request.MealType,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Meals.Add(meal);
        await _context.SaveChangesAsync();

        return Ok(meal);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeal(Guid id)
    {
        var meal = await _context.Meals.FindAsync(id);
        if (meal == null) return NotFound();

        _context.Meals.Remove(meal);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetWeeklySummary([FromQuery] Guid userId)
    {
        var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
        var meals = await _context.Meals
            .Where(m => m.UserId == userId && m.Date >= startOfWeek)
            .ToListAsync();

        var dailySummary = meals
            .GroupBy(m => m.Date.Date)
            .Select(g => new
            {
                Date = g.Key,
                Calories = g.Sum(m => m.Calories),
                Protein = g.Sum(m => m.Protein),
                Carbs = g.Sum(m => m.Carbs),
                Fat = g.Sum(m => m.Fat)
            })
            .OrderBy(d => d.Date)
            .ToList();

        return Ok(new
        {
            WeeklyAvgCalories = meals.Any() ? meals.Sum(m => m.Calories) / Math.Max(1, dailySummary.Count) : 0,
            DailySummary = dailySummary
        });
    }
}
