using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class Lesson
{
    public int Id { get; set; }

    // Lesson now belongs to a Module (not directly to Course)
    public int ModuleId { get; set; }
    [JsonIgnore]
    public Module? Module { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty; // Markdown or rich text

    public string? VideoUrl { get; set; } // YouTube or MP4 URL

    public int DurationMinutes { get; set; } = 10;

    public int OrderIndex { get; set; } = 0;

    public bool IsFreePreview { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
}
