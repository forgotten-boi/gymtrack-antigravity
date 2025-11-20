using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace FitNest.Api.Hubs;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendPrivateMessage(string receiverId, string message)
    {
        // In a real app, we'd map userId to connectionId
        await Clients.User(receiverId).SendAsync("ReceivePrivateMessage", Context.UserIdentifier, message);
    }
}
