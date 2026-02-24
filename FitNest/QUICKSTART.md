# FitNest Quick Start Guide

Get FitNest up and running in minutes.

## 5-Minute Setup (PostgreSQL - Default)

### 1. Clone and Navigate
```bash
cd FitNest
```

### 2. Start Backend with Aspire
```bash
dotnet run --project FitNest.AppHost
```
This automatically starts a PostgreSQL container and the API.

### 3. Start Mobile App (in a new terminal)
```bash
cd fitnest-mobile
npm install
npm start
```

### 4. Start Web App (in another new terminal)
```bash
cd fitnest-web
npm install
npm start
```

### 5. Access the Application
- **Web Dashboard**: http://localhost:4200
- **Mobile App**: http://localhost:8100
- **API**: http://localhost:5000
- **Aspire Dashboard**: http://localhost:18888 (displays all services)

### Test Credentials
- **Email**: coach@fitnest.com
- **Password**: Coach123!

---

## Setup with SQL Server

### 1. Switch Database Provider
Edit `FitNest.Api/appsettings.json`:
```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "fitnest-db-sqlserver": "Server=(localdb)\\mssqllocaldb;Database=fitnest-db;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### 2. Start Aspire Orchestration
```bash
dotnet run --project FitNest.AppHost
```
Aspire will automatically provision a local SQL Server container.

### 3. Start Frontend Apps
Follow steps 3-5 from PostgreSQL setup.

---

## Setup with Azure SQL

### 1. Get Azure SQL Connection String
From your Azure SQL instance in the Azure Portal, copy the connection string.

### 2. Update Configuration
Edit `FitNest.Api/appsettings.json`:
```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "fitnest-db-sqlserver": "Server=YOUR_SERVER.database.windows.net;Database=fitnest-db;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  }
}
```

### 3. Skip Aspire SQL Server (optional)
Edit `FitNest.AppHost/appsettings.json`:
```json
{
  "DatabaseProvider": "PostgreSQL"   // Leave PostgreSQL - Aspire won't provision SQL Server
}
```

### 4. Run Application
```bash
dotnet run --project FitNest.AppHost
```
The API will connect directly to your Azure SQL instance.

### 5. Start Frontend Apps
Follow steps 3-5 from PostgreSQL setup.

---

## Database Migrations

### Migrate Database Using Entity Framework
```bash
cd FitNest.Infrastructure
dotnet ef database update -s ../FitNest.Api
```

### Add a New Migration

**For PostgreSQL:**
```bash
dotnet ef migrations add YourMigrationName -p FitNest.Infrastructure -s FitNest.Api
```

**For SQL Server:**
```powershell
$env:DatabaseProvider="SqlServer"
$env:ConnectionStrings__fitnest-db-sqlserver="Your connection string"
dotnet ef migrations add YourMigrationName -p FitNest.Infrastructure -s FitNest.Api --output-dir Migrations/SqlServer
```

---

## Common Commands

| Task | Command |
|------|---------|
| Build Solution | `dotnet build` |
| Run Tests | `dotnet test` |
| Start Backend + Frontend | `dotnet run --project FitNest.AppHost` (then `npm start` in fitnest-web & fitnest-mobile) |
| View Aspire Dashboard | Navigate to http://localhost:18888 |
| Seed Test Data | Runs automatically in development on first startup |

---

## Troubleshooting

### "Connection refused" error
- Ensure Docker is running (required for Aspire containers).
- Check if the API is actually running by visiting http://localhost:5000/swagger.

### "Database does not exist" error
- Stop the app and delete the database container: `docker ps` and `docker rm <container>`
- Restart the app to recreate the database.

### Port Already in Use
- Change the port in the respective app's configuration.
- Default ports: API (5000), Web (4200), Mobile (8100).

### "Provider not configured" error
- Ensure `DatabaseProvider` is set correctly in `appsettings.json`.
- Check connection strings match the provider.

---

## Next Steps

- Read the [full README](README.md) for detailed architecture information.
- Explore the [project structure](README.md#project-structure).
- Check out the [features](README.md#features) overview.
