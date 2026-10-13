using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class AssignmentSummaryDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public int MaxPoints { get; set; }
    public DateTime? DueDate { get; set; }
    public bool HasSubmitted { get; set; }
    public int? MyGrade { get; set; }
    public string? MyFeedback { get; set; }
    public DateTime? MySubmittedAt { get; set; }
    public int TotalSubmissions { get; set; }
}

public class AssignmentDetailDto : AssignmentSummaryDto
{
    public List<AssignmentSubmissionDto> Submissions { get; set; } = new();
}

public class AssignmentCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Instructions { get; set; } = string.Empty;

    public int MaxPoints { get; set; } = 100;

    public DateTime? DueDate { get; set; }
}

public class AssignmentSubmitDto
{
    [Required]
    public string SubmissionText { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }
}

public class AssignmentGradeDto
{
    [Required]
    public int Grade { get; set; }

    public string? Feedback { get; set; }
}

public class AssignmentSubmissionDto
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string SubmissionText { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime SubmittedAt { get; set; }
    public int? Grade { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAt { get; set; }
}
