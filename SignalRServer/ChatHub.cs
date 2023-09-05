using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

public class ChatHub : Hub
{
    public async Task SendMessage(string message)
    {
        if (_users.TryGetValue(Context.ConnectionId, out var userName))
        {
            await Clients.All.SendAsync("ReceiveMessage", userName, message);
        }
        else
        {
            // Handle error: user not found
        }
    }

    private static ConcurrentDictionary<string, string> _users = new ConcurrentDictionary<string, string>();
    private static int _userCounter = 0;

    public override async Task OnConnectedAsync()
    {
        var userName = "User " + Interlocked.Increment(ref _userCounter);
        _users.TryAdd(Context.ConnectionId, userName);
        await Clients.All.SendAsync("UsersOnline", _users.Values);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_users.TryRemove(Context.ConnectionId, out var userName))
        {
            Interlocked.Decrement(ref _userCounter);
            await Clients.All.SendAsync("UsersOnline", _users.Values);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
