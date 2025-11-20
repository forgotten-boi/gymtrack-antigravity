using Microsoft.Extensions.DependencyInjection;

namespace FitNest.Application.Common.CQRS;

/// <summary>
/// Lightweight dispatcher for commands and queries
/// </summary>
public class Dispatcher
{
    private readonly IServiceProvider _serviceProvider;

    public Dispatcher(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<TResponse> Send<TResponse>(ICommand<TResponse> command, CancellationToken cancellationToken = default)
    {
        var commandType = command.GetType();
        var handlerType = typeof(ICommandHandler<,>).MakeGenericType(commandType, typeof(TResponse));
        
        var handler = _serviceProvider.GetRequiredService(handlerType);
        var handleMethod = handlerType.GetMethod("Handle");
        
        if (handleMethod == null)
            throw new InvalidOperationException($"Handler for {commandType.Name} not found");

        var task = (Task<TResponse>)handleMethod.Invoke(handler, new object[] { command, cancellationToken })!;
        return await task;
    }

    public async Task<TResponse> Send<TResponse>(IQuery<TResponse> query, CancellationToken cancellationToken = default)
    {
        var queryType = query.GetType();
        var handlerType = typeof(IQueryHandler<,>).MakeGenericType(queryType, typeof(TResponse));
        
        var handler = _serviceProvider.GetRequiredService(handlerType);
        var handleMethod = handlerType.GetMethod("Handle");
        
        if (handleMethod == null)
            throw new InvalidOperationException($"Handler for {queryType.Name} not found");

        var task = (Task<TResponse>)handleMethod.Invoke(handler, new object[] { query, cancellationToken })!;
        return await task;
    }
}
