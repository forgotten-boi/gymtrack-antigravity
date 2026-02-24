using FitNest.Application.Common.CQRS;
using FitNest.Application.Feedback.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly Dispatcher _dispatcher;

    public FeedbackController(Dispatcher dispatcher)
    {
        _dispatcher = dispatcher;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFeedbackCommand command)
    {
        // In a real app, we'd validate that the user is authorized to give feedback
        var result = await _dispatcher.Send(command);
        return Ok(result);
    }
}
