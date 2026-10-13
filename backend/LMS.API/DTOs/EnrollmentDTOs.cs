using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class EnrollmentDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnail { get; set; }
    public string Category { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? AdminNote { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public int ProgressPercentage { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class UpdateEnrollmentStatusRequest
{
    [Required]
    public string Status { get; set; } = "Approved"; // Approved or Rejected
    public string? AdminNote { get; set; }
}

public class ToggleLessonProgressRequest
{
    public int LessonId { get; set; }
    public bool IsCompleted { get; set; }
}

public class LessonProgressResultDto
{
    public int LessonId { get; set; }
    public bool IsCompleted { get; set; }
    public int ProgressPercentage { get; set; }
    public bool IsCourseCompleted { get; set; }
    public string? CertificateNumber { get; set; }
}
