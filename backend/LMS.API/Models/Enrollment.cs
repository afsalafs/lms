using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class Enrollment
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public User? Student { get; set; }

    public int CourseId { get; set; }
    public Course? Course { get; set; }

    /// <summary>Pending | Approved | Rejected</summary>
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public string? AdminNote { get; set; }

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public int ProgressPercentage { get; set; } = 0;

    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
}

public class LessonProgress
{
    public int Id { get; set; }

    public int EnrollmentId { get; set; }
    [JsonIgnore]
    public Enrollment? Enrollment { get; set; }

    public int LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public bool IsCompleted { get; set; } = false;

    public DateTime? CompletedAt { get; set; }
}
