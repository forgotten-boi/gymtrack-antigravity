using FitNest.Domain.Entities;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        // Update other fields as needed

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("athletes")]
    public async Task<ActionResult<List<User>>> GetAthletes([FromQuery] Guid tenantId)
    {
        // In a real app, filter by tenant/gym
        // For now, return all users who are not coaches (assuming Role property exists or just all users)
        var athletes = await _context.AppUsers.ToListAsync();
        return Ok(athletes);
    }

    [HttpGet("{id}/stats")]
    public IActionResult GetStats(string id)
    {
        // Mock implementation
        return Ok(new
        {
            WorkoutsCompleted = 42,
            TotalWeightLifted = 15000,
            StreakDays = 5
        });
    }

    [HttpGet("{id}/prs")]
    public IActionResult GetPRs(string id)
    {
        // Mock implementation
        return Ok(new[]
        {
            new { Exercise = "Bench Press", Weight = 100, Unit = "kg", Date = DateTime.UtcNow.AddDays(-10) },
            new { Exercise = "Squat", Weight = 140, Unit = "kg", Date = DateTime.UtcNow.AddDays(-5) },
            new { Exercise = "Deadlift", Weight = 180, Unit = "kg", Date = DateTime.UtcNow.AddDays(-2) }
        });
    }
}
