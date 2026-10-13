using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
    public int InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string? InstructorAvatar { get; set; }
    public int TotalModules { get; set; }
    public int TotalLessons { get; set; }
    public int TotalDurationMinutes { get; set; }
    public int EnrolledStudentsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CourseDetailDto : CourseDto
{
    public List<ModuleDto> Modules { get; set; } = new();
    public List<QuizSummaryDto> Quizzes { get; set; } = new();
    public List<AssignmentSummaryDto> Assignments { get; set; } = new();
    public bool IsUserEnrolled { get; set; }
    public string EnrollmentStatus { get; set; } = "None"; // None, Pending, Approved, Rejected
    public int UserProgressPercentage { get; set; }
    public List<int> CompletedLessonIds { get; set; } = new();
}

public class CourseCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = "Web Development";

    [Required]
    public string Level { get; set; } = "Beginner";

    public string? ThumbnailUrl { get; set; }

    public decimal Price { get; set; } = 0;

    public bool IsPublished { get; set; } = true;
}

public class CourseUpdateDto : CourseCreateDto
{
}

public class LessonSummaryDto
{
    public int Id { get; set; }
    public int ModuleId { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public int OrderIndex { get; set; }
    public bool IsFreePreview { get; set; }
    public bool IsCompleted { get; set; }
}

public class LessonDetailDto : LessonSummaryDto
{
    public string Content { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
}

public class LessonCreateUpdateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? VideoUrl { get; set; }

    public int DurationMinutes { get; set; } = 10;

    public int OrderIndex { get; set; } = 0;

    public bool IsFreePreview { get; set; } = false;
}
