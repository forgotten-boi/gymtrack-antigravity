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
}
