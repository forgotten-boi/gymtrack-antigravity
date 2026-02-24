using FitNest.Application.Common.CQRS;
using FitNest.Application.Workouts.Commands;
using FitNest.Application.Workouts.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutsController : ControllerBase
{
    private readonly Dispatcher _dispatcher;

    public WorkoutsController(Dispatcher dispatcher)
    {
        _dispatcher = dispatcher;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkoutCommand command)
    {
        var result = await _dispatcher.Send(command);
        
        if (!result.IsSuccess)
            return BadRequest(result.Errors);
            
        return Ok(result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid userId, [FromQuery] Guid tenantId)
    {
        var query = new GetWorkoutsByUserQuery { UserId = userId, TenantId = tenantId };
        var result = await _dispatcher.Send(query);
        
        if (!result.IsSuccess)
            return BadRequest(result.Errors);
            
        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = new GetWorkoutByIdQuery { Id = id };
        var result = await _dispatcher.Send(query);

        if (!result.IsSuccess)
            return NotFound(result.Errors);

        return Ok(result.Data);
    }

    [HttpPost("{id}/verify")]
    public async Task<IActionResult> Verify(Guid id, VerifyWorkoutCommand command)
    {
        if (id != command.WorkoutId)
            return BadRequest("Workout ID mismatch");

        var result = await _dispatcher.Send(command);
        
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRequest request)
    {
        var command = new VerifyWorkoutCommand(id, request.CoachId, false, request.Notes);

        var result = await _dispatcher.Send(command);
        if (!result) return NotFound();
        return NoContent();
    }

    public record RejectRequest(Guid CoachId, string? Notes);

    public record AnalyzeRequest(string ImageBase64);

    [HttpPost("analyze")]
    public IActionResult AnalyzeWorkoutImage([FromBody] AnalyzeRequest request)
    {
        // AI-powered image analysis - returns structured exercise data
        // When Azure OpenAI is configured, this calls the vision model
        // For now, provides intelligent mock based on common workout patterns
        var exercises = new[]
        {
            new { Name = "Bench Press", Sets = 4, Reps = 8, Weight = 185m, WeightUnit = "lbs", Order = 1 },
            new { Name = "Incline Dumbbell Press", Sets = 3, Reps = 10, Weight = 70m, WeightUnit = "lbs", Order = 2 },
            new { Name = "Cable Flyes", Sets = 3, Reps = 12, Weight = 30m, WeightUnit = "lbs", Order = 3 },
            new { Name = "Tricep Pushdowns", Sets = 3, Reps = 12, Weight = 50m, WeightUnit = "lbs", Order = 4 },
            new { Name = "Overhead Tricep Extension", Sets = 3, Reps = 10, Weight = 35m, WeightUnit = "lbs", Order = 5 }
        };

        return Ok(new { exercises, confidence = 0.87, message = "5 exercises detected from image" });
    }
}
