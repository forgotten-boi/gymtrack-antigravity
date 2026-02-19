using Microsoft.AspNetCore.Mvc;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/users/notifications")]
public class NotificationsController : ControllerBase
{
    [HttpGet("{userId}")]
    public IActionResult GetNotifications(string userId)
    {
        // Mock implementation
        return Ok(new[]
        {
            new { Id = 1, Title = "Workout Verified", Message = "Your Squat session was verified.", Time = DateTime.UtcNow.AddHours(-2), Read = false, Type = "info" },
            new { Id = 2, Title = "New Message", Message = "Coach Mike sent you a message.", Time = DateTime.UtcNow.AddHours(-5), Read = true, Type = "message" }
        });
    }

    [HttpPost("{id}/read")]
    public IActionResult MarkAsRead(int id)
    {
        // Mock implementation
        return Ok(new { Success = true });
    }
}
