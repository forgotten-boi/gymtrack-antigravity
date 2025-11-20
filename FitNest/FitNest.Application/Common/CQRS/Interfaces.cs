namespace FitNest.Application.Common.CQRS;

/// <summary>
/// Marker interface for commands (write operations)
/// </summary>
public interface ICommand<out TResponse>
{
}

/// <summary>
/// Marker interface for queries (read operations)
/// </summary>
public interface IQuery<out TResponse>
{
}

/// <summary>
/// Handler interface for commands
/// </summary>
public interface ICommandHandler<in TCommand, TResponse> where TCommand : ICommand<TResponse>
{
    Task<TResponse> Handle(TCommand command, CancellationToken cancellationToken = default);
}

/// <summary>
/// Handler interface for queries
/// </summary>
public interface IQueryHandler<in TQuery, TResponse> where TQuery : IQuery<TResponse>
{
    Task<TResponse> Handle(TQuery query, CancellationToken cancellationToken = default);
}
