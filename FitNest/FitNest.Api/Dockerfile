# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["FitNest.Api/FitNest.Api.csproj", "FitNest.Api/"]
COPY ["FitNest.Application/FitNest.Application.csproj", "FitNest.Application/"]
COPY ["FitNest.Domain/FitNest.Domain.csproj", "FitNest.Domain/"]
COPY ["FitNest.Infrastructure/FitNest.Infrastructure.csproj", "FitNest.Infrastructure/"]
COPY ["FitNest.ServiceDefaults/FitNest.ServiceDefaults.csproj", "FitNest.ServiceDefaults/"]
RUN dotnet restore "./FitNest.Api/FitNest.Api.csproj"
COPY . .
WORKDIR "/src/FitNest.Api"
RUN dotnet build "./FitNest.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FitNest.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FitNest.Api.dll"]
