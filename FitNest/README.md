# FitNest - Advanced Gym Tracker

FitNest is a comprehensive gym tracking solution connecting athletes with coaches. It features a mobile app for athletes to capture workouts and chat with coaches, and a web dashboard for coaches to manage athletes and provide feedback.

## Features

### Mobile App (Athlete)
- **Authentication**: Secure login and registration.
- **Workout Capture**: AI-powered workout logging using camera.
- **Chat**: Real-time messaging with coaches.
- **Profile**: Manage user profile and settings.
- **Workout History**: View past workouts and progress.

### Web App (Coach)
- **Dashboard**: Overview of athlete activity and alerts.
- **Athlete Management**: View athlete profiles and workout history.
- **Chat Widget**: Real-time communication with athletes.
- **Workout Verification**: Review and verify athlete workouts.

## Tech Stack

- **Backend**: .NET 9, ASP.NET Core Web API, SignalR, Entity Framework Core, PostgreSQL or SQL Server.
- **Mobile**: Ionic 8, Angular 18, Capacitor.
- **Web**: Angular 18, Standalone Components.
- **Orchestration**: .NET Aspire.
- **Database**: Multi-provider support — PostgreSQL (local/Aspire) or SQL Server (local/Aspire or Azure SQL).

## Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- Docker Desktop
- PostgreSQL or SQL Server (optional — Aspire provides local containers)

### Running the Project

1. **Configure Database Provider** (optional):
   - Edit `FitNest.Api/appsettings.json` and set `DatabaseProvider` to `"PostgreSQL"` (default) or `"SqlServer"`.
   - For Azure SQL, update the `fitnest-db-sqlserver` connection string with your server details.

2. **Start the Backend & Orchestration**:
   ```bash
   dotnet run --project FitNest.AppHost
   ```

3. **Start the Mobile App**:
   ```bash
   cd fitnest-mobile
   npm install
   npm start
   ```

4. **Start the Web App**:
   ```bash
   cd fitnest-web
   npm install
   npm start
   ```

## Database Configuration

### PostgreSQL (Default)
- Runs via Aspire container in development.
- Connection string in `FitNest.Api/appsettings.json` under `ConnectionStrings.fitnest-db`.

### SQL Server
1. Set `DatabaseProvider: "SqlServer"` in `FitNest.Api/appsettings.json`.
2. Either:
   - Use local Aspire container: Runs automatically when AppHost detects SQL Server provider.
   - Use Azure SQL: Update `ConnectionStrings.fitnest-db-sqlserver` with connection details.

For migrations targeting SQL Server:
```powershell
$env:DatabaseProvider="SqlServer"
$env:ConnectionStrings__fitnest-db-sqlserver="Your connection string"
dotnet ef migrations add MyMigration -p FitNest.Infrastructure -s FitNest.Api
```

## Project Structure

- `FitNest.AppHost`: .NET Aspire orchestration project.
- `FitNest.Api`: Backend API and SignalR Hubs.
- `FitNest.Domain`: Domain entities and logic.
- `FitNest.Infrastructure`: Database context and repositories.
- `fitnest-mobile`: Ionic/Angular mobile application.
- `fitnest-web`: Angular web dashboard.

## Recent Updates
- Added Multi-Database Support (PostgreSQL and SQL Server).
- Real-time Chat (SignalR).
- Profile Management.
- Enhanced Workout Capture with Date Selection.
- Coach Chat Widget and Athlete Profile View.
