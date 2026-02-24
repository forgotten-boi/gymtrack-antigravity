using FitNest.Domain.Common;

namespace FitNest.Domain.Entities;

public class Meal : BaseEntity
{
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Calories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fat { get; set; }
    public string Source { get; set; } = "manual"; // photo, search, manual
    public string? ImageUrl { get; set; }
    public string MealType { get; set; } = "snack"; // breakfast, lunch, dinner, snack
}
