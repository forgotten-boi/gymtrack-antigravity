using FitNest.Application.Common.CQRS;
using FitNest.Application.Workouts.Commands;
using FitNest.Application.Workouts.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
}
