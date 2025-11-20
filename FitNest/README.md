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

- **Backend**: .NET 9, ASP.NET Core Web API, SignalR, Entity Framework Core, PostgreSQL.
- **Mobile**: Ionic 8, Angular 18, Capacitor.
- **Web**: Angular 18, Standalone Components.
- **Orchestration**: .NET Aspire.

## Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- Docker Desktop
- PostgreSQL

### Running the Project

1. **Start the Backend & Orchestration**:
   ```bash
   dotnet run --project FitNest.AppHost
   ```

2. **Start the Mobile App**:
   ```bash
   cd fitnest-mobile
   npm install
   npm start
   ```

3. **Start the Web App**:
   ```bash
   cd fitnest-web
   npm install
   npm start
   ```

## Project Structure

- `FitNest.AppHost`: .NET Aspire orchestration project.
- `FitNest.Api`: Backend API and SignalR Hubs.
- `FitNest.Domain`: Domain entities and logic.
- `FitNest.Infrastructure`: Database context and repositories.
- `fitnest-mobile`: Ionic/Angular mobile application.
- `fitnest-web`: Angular web dashboard.

## Recent Updates
- Added Real-time Chat (SignalR).
- Implemented Profile Management.
- Enhanced Workout Capture with Date Selection.
- Added Coach Chat Widget and Athlete Profile View.
