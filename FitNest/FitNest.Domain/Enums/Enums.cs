namespace FitNest.Domain.Enums;

public enum UserRole
{
    Coach = 1,
    Member = 2
}

public enum WorkoutStatus
{
    Uploaded = 1,
    Processing = 2,
    Completed = 3,
    Failed = 4
}

public enum VerificationStatus
{
    Pending = 1,
    Verified = 2,
    Rejected = 3
}
