using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class Assignment
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    [JsonIgnore]
    public Course? Course { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Instructions { get; set; } = string.Empty;

    public int MaxPoints { get; set; } = 100;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
}

public class AssignmentSubmission
{
    public int Id { get; set; }

    public int AssignmentId { get; set; }
    public Assignment? Assignment { get; set; }

    public int StudentId { get; set; }
    public User? Student { get; set; }

    [Required]
    public string SubmissionText { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public int? Grade { get; set; } // Points given

    public string? Feedback { get; set; }

    public DateTime? GradedAt { get; set; }
}
