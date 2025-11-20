using System.Reflection;
using FitNest.Application.Common.CQRS;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace FitNest.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Register Custom CQRS Dispatcher
        services.AddScoped<Dispatcher>();

        // Register Command Handlers
        services.Scan(scan => scan
            .FromAssemblyOf<Dispatcher>()
            .AddClasses(classes => classes.AssignableTo(typeof(ICommandHandler<,>)))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        // Register Query Handlers
        services.Scan(scan => scan
            .FromAssemblyOf<Dispatcher>()
            .AddClasses(classes => classes.AssignableTo(typeof(IQueryHandler<,>)))
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        return services;
    }
}
