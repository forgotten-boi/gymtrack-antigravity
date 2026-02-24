using FitNest.Domain.Entities;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiAssistantController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public AiAssistantController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public record ChatRequest(string Message, Guid UserId);
    public record ChatResponse(string Reply, string Type, object? Data = null);

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        // Save user message
        var userMsg = new AiChatMessage
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Role = "user",
            Content = request.Message,
            CreatedAt = DateTime.UtcNow
        };
        _context.AiChatMessages.Add(userMsg);

        // Build context-aware response based on user data
        var user = await _context.AppUsers.FindAsync(request.UserId);
        var recentWorkouts = await _context.Workouts
            .Where(w => w.UserId == request.UserId)
            .Include(w => w.Exercises)
            .OrderByDescending(w => w.WorkoutDate)
            .Take(5)
            .ToListAsync();

        var prs = await _context.Workouts
            .Where(w => w.UserId == request.UserId)
            .SelectMany(w => w.Exercises)
            .GroupBy(e => e.Name)
            .Select(g => new { Exercise = g.Key, MaxWeight = g.Max(e => e.Weight ?? 0) })
            .ToListAsync();

        var todayMeals = await _context.Meals
            .Where(m => m.UserId == request.UserId && m.Date.Date == DateTime.UtcNow.Date)
            .ToListAsync();

        var messageNorm = request.Message.ToLowerInvariant();
        string reply;
        string type;
        object? data = null;

        if (messageNorm.Contains("workout plan") || messageNorm.Contains("generate") || messageNorm.Contains("training"))
        {
            type = "workout_plan";
            var level = user?.ExperienceLevel ?? "intermediate";
            var goals = user?.FitnessGoals ?? "general fitness";
            var frequency = user?.WeeklyFrequency ?? 4;

            reply = $"Based on your {level} level and goals ({goals}), here's your {frequency}-day plan:";
            data = GenerateWorkoutPlan(level, frequency, prs);
        }
        else if (messageNorm.Contains("calorie") || messageNorm.Contains("macro") || messageNorm.Contains("nutrition") || messageNorm.Contains("diet"))
        {
            type = "calorie_card";
            var dailyGoal = user?.DailyCalorieGoal ?? 2000;
            var consumed = todayMeals.Sum(m => m.Calories);
            var protein = todayMeals.Sum(m => m.Protein);
            var carbs = todayMeals.Sum(m => m.Carbs);
            var fat = todayMeals.Sum(m => m.Fat);

            reply = consumed < dailyGoal
                ? $"You've consumed {consumed} of {dailyGoal} calories today. You have {dailyGoal - consumed} calories remaining. Keep it up!"
                : $"You've reached {consumed} of {dailyGoal} calories today. Consider lighter options for the rest of the day.";

            data = new { dailyGoal, consumed, remaining = Math.Max(0, dailyGoal - consumed), protein, carbs, fat };
        }
        else if (messageNorm.Contains("progress") || messageNorm.Contains("stats") || messageNorm.Contains("how am i"))
        {
            type = "progress_card";
            var totalWorkouts = recentWorkouts.Count;
            var totalVolume = recentWorkouts.SelectMany(w => w.Exercises).Sum(e => (e.Weight ?? 0) * e.Sets * e.Reps);

            reply = totalWorkouts > 0
                ? $"In your last {totalWorkouts} workouts, you've lifted a total of {totalVolume:N0} lbs. "
                  + (prs.Any() ? $"Your top PR is {prs.OrderByDescending(p => p.MaxWeight).First().Exercise} at {prs.OrderByDescending(p => p.MaxWeight).First().MaxWeight} lbs." : "")
                : "I don't have enough workout data yet. Log some workouts and I'll have great insights for you!";

            data = new { totalWorkouts, totalVolume, prs = prs.Select(p => new { p.Exercise, p.MaxWeight }) };
        }
        else if (messageNorm.Contains("stretch") || messageNorm.Contains("warm") || messageNorm.Contains("recovery"))
        {
            type = "text";
            reply = "Great recovery habits! Here's a recommended routine:\n\n"
                + "**Pre-workout (5 min):**\n- Arm circles (30s)\n- Leg swings (30s each)\n- Hip openers (30s)\n- Light jog (2 min)\n\n"
                + "**Post-workout (10 min):**\n- Quad stretch (30s each)\n- Hamstring stretch (30s each)\n- Chest doorway stretch (30s)\n- Cat-cow (1 min)\n- Child's pose (1 min)";
        }
        else
        {
            type = "text";
            var workoutCount = recentWorkouts.Count;
            reply = workoutCount > 0
                ? $"Hey {user?.FirstName ?? "there"}! You've completed {workoutCount} workouts recently. "
                  + "I can help you with:\n- **Generate a workout plan** tailored to your goals\n"
                  + "- **Analyze your progress** and trends\n- **Adjust calorie targets** based on your activity\n"
                  + "- **Recovery tips** and stretching routines\n\nWhat would you like to explore?"
                : $"Welcome {user?.FirstName ?? "there"}! I'm your AI fitness assistant. "
                  + "I can help generate workout plans, track your nutrition, analyze progress, and more. What would you like to start with?";
        }

        // Save assistant response
        var assistantMsg = new AiChatMessage
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Role = "assistant",
            Content = reply,
            ResponseType = type,
            CreatedAt = DateTime.UtcNow
        };
        _context.AiChatMessages.Add(assistantMsg);
        await _context.SaveChangesAsync();

        return Ok(new ChatResponse(reply, type, data));
    }

    [HttpGet("history/{userId}")]
    public async Task<IActionResult> GetChatHistory(Guid userId)
    {
        var messages = await _context.AiChatMessages
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.CreatedAt)
            .Take(50)
            .Select(m => new
            {
                m.Id,
                m.Role,
                m.Content,
                m.ResponseType,
                m.CreatedAt
            })
            .ToListAsync();

        return Ok(messages);
    }

    private static object GenerateWorkoutPlan(string level, int frequency, object prs)
    {
        var plans = new Dictionary<int, List<object>>
        {
            [3] = new()
            {
                new { Day = "Day 1 - Push", Exercises = new[] {
                    new { Name = "Bench Press", Sets = 4, Reps = "8-10", Rest = "90s" },
                    new { Name = "Overhead Press", Sets = 3, Reps = "8-10", Rest = "90s" },
                    new { Name = "Incline Dumbbell Press", Sets = 3, Reps = "10-12", Rest = "60s" },
                    new { Name = "Lateral Raises", Sets = 3, Reps = "12-15", Rest = "60s" },
                    new { Name = "Tricep Pushdowns", Sets = 3, Reps = "12-15", Rest = "60s" }
                }},
                new { Day = "Day 2 - Pull", Exercises = new[] {
                    new { Name = "Deadlift", Sets = 3, Reps = "5", Rest = "120s" },
                    new { Name = "Barbell Rows", Sets = 4, Reps = "8-10", Rest = "90s" },
                    new { Name = "Pull-ups", Sets = 3, Reps = "6-10", Rest = "90s" },
                    new { Name = "Face Pulls", Sets = 3, Reps = "15-20", Rest = "60s" },
                    new { Name = "Barbell Curls", Sets = 3, Reps = "10-12", Rest = "60s" }
                }},
                new { Day = "Day 3 - Legs", Exercises = new[] {
                    new { Name = "Squat", Sets = 4, Reps = "6-8", Rest = "120s" },
                    new { Name = "Romanian Deadlift", Sets = 3, Reps = "10-12", Rest = "90s" },
                    new { Name = "Leg Press", Sets = 3, Reps = "10-12", Rest = "90s" },
                    new { Name = "Walking Lunges", Sets = 3, Reps = "12 each", Rest = "60s" },
                    new { Name = "Calf Raises", Sets = 4, Reps = "15-20", Rest = "60s" }
                }}
            },
            [4] = new()
            {
                new { Day = "Day 1 - Upper Push", Exercises = new[] {
                    new { Name = "Bench Press", Sets = 4, Reps = "6-8", Rest = "120s" },
                    new { Name = "Overhead Press", Sets = 3, Reps = "8-10", Rest = "90s" },
                    new { Name = "Dumbbell Flyes", Sets = 3, Reps = "12-15", Rest = "60s" },
                    new { Name = "Lateral Raises", Sets = 3, Reps = "12-15", Rest = "60s" },
                    new { Name = "Tricep Dips", Sets = 3, Reps = "10-12", Rest = "60s" }
                }},
                new { Day = "Day 2 - Lower", Exercises = new[] {
                    new { Name = "Squat", Sets = 4, Reps = "6-8", Rest = "120s" },
                    new { Name = "Romanian Deadlift", Sets = 3, Reps = "10-12", Rest = "90s" },
                    new { Name = "Bulgarian Split Squats", Sets = 3, Reps = "10 each", Rest = "60s" },
                    new { Name = "Leg Curl", Sets = 3, Reps = "12-15", Rest = "60s" },
                    new { Name = "Calf Raises", Sets = 4, Reps = "15-20", Rest = "60s" }
                }},
                new { Day = "Day 3 - Upper Pull", Exercises = new[] {
                    new { Name = "Barbell Rows", Sets = 4, Reps = "6-8", Rest = "90s" },
                    new { Name = "Pull-ups", Sets = 3, Reps = "6-10", Rest = "90s" },
                    new { Name = "Cable Rows", Sets = 3, Reps = "10-12", Rest = "60s" },
                    new { Name = "Face Pulls", Sets = 3, Reps = "15-20", Rest = "60s" },
                    new { Name = "Barbell Curls", Sets = 3, Reps = "10-12", Rest = "60s" }
                }},
                new { Day = "Day 4 - Lower + Core", Exercises = new[] {
                    new { Name = "Deadlift", Sets = 3, Reps = "5", Rest = "120s" },
                    new { Name = "Front Squat", Sets = 3, Reps = "8-10", Rest = "90s" },
                    new { Name = "Walking Lunges", Sets = 3, Reps = "12 each", Rest = "60s" },
                    new { Name = "Hanging Leg Raises", Sets = 3, Reps = "12-15", Rest = "60s" },
                    new { Name = "Plank", Sets = 3, Reps = "60s hold", Rest = "30s" }
                }}
            }
        };

        var key = Math.Clamp(frequency, 3, 4);
        return plans.GetValueOrDefault(key, plans[3])!;
    }
}
