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
}
