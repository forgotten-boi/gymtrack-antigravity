using FitNest.Domain.Entities;
using FitNest.Domain.Enums;
using FitNest.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FitNest.Application.Common.Interfaces;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(
        UserManager<IdentityUser> userManager,
        ApplicationDbContext context,
        IJwtService jwtService)
    {
        _userManager = userManager;
        _context = context;
        _jwtService = jwtService;
    }

    public record RegisterRequest(
        string Email,
        string Password,
        string FirstName,
        string LastName,
        string Role,
        Guid? TenantId = null);

    public record LoginRequest(string Email, string Password);

    public record AuthResponse(
        string Token,
        string Id,
        string Email,
        string FirstName,
        string LastName,
        string TenantId,
        string Role);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return BadRequest(new { message = "Email already registered." });

        if (!Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
            return BadRequest(new { message = "Invalid role. Use 'Coach' or 'Member'." });

        Guid tenantId;

        if (parsedRole == UserRole.Coach)
        {
            // Create a new Tenant for this coach
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = $"{request.FirstName} {request.LastName}'s Gym",
                IsActive = true,
                SubscriptionStartDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync(CancellationToken.None);
            tenantId = tenant.Id;
        }
        else
        {
            // Members must specify an existing tenant (coach's gym)
            if (!request.TenantId.HasValue || request.TenantId.Value == Guid.Empty)
                return BadRequest(new { message = "Members must provide a valid TenantId to join a gym." });

            var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == request.TenantId.Value);
            if (!tenantExists)
                return BadRequest(new { message = "Tenant not found." });

            tenantId = request.TenantId.Value;
        }

        // Create ASP.NET Identity user for authentication
        var identityUser = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var identityResult = await _userManager.CreateAsync(identityUser, request.Password);
        if (!identityResult.Succeeded)
            return BadRequest(new { errors = identityResult.Errors.Select(e => e.Description) });

        // Create domain User entity
        var domainUser = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = parsedRole,
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow
        };

        _context.AppUsers.Add(domainUser);
        await _context.SaveChangesAsync(CancellationToken.None);

        var token = _jwtService.GenerateToken(domainUser);

        return Ok(new AuthResponse(
            token,
            domainUser.Id.ToString(),
            domainUser.Email,
            domainUser.FirstName,
            domainUser.LastName,
            domainUser.TenantId.ToString(),
            domainUser.Role.ToString()
        ));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var identityUser = await _userManager.FindByEmailAsync(request.Email);
        if (identityUser == null)
            return Unauthorized(new { message = "Invalid email or password." });

        var passwordValid = await _userManager.CheckPasswordAsync(identityUser, request.Password);
        if (!passwordValid)
            return Unauthorized(new { message = "Invalid email or password." });

        var domainUser = await _context.AppUsers
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (domainUser == null)
            return Unauthorized(new { message = "User profile not found." });

        var token = _jwtService.GenerateToken(domainUser);

        return Ok(new AuthResponse(
            token,
            domainUser.Id.ToString(),
            domainUser.Email,
            domainUser.FirstName,
            domainUser.LastName,
            domainUser.TenantId.ToString(),
            domainUser.Role.ToString()
        ));
    }

    [HttpGet("tenants")]
    public async Task<IActionResult> GetTenants()
    {
        var tenants = await _context.Tenants
            .Where(t => t.IsActive)
            .Select(t => new { t.Id, t.Name })
            .ToListAsync();
        return Ok(tenants);
    }
}
