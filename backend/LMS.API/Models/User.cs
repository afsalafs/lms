using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Role { get; set; } = "Student"; // Admin, Instructor, Student

    /// <summary>Pending | Approved | Rejected</summary>
    [MaxLength(20)]
    public string AccountStatus { get; set; } = "Pending";

    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public ICollection<Course> InstructedCourses { get; set; } = new List<Course>();

    [JsonIgnore]
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    [JsonIgnore]
    public ICollection<QuizSubmission> QuizSubmissions { get; set; } = new List<QuizSubmission>();

    [JsonIgnore]
    public ICollection<AssignmentSubmission> AssignmentSubmissions { get; set; } = new List<AssignmentSubmission>();

    [JsonIgnore]
    public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();

    [JsonIgnore]
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
}
