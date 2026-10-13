using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class Course
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = "General";

    [Required, MaxLength(50)]
    public string Level { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced

    public string? ThumbnailUrl { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; } = 0; // 0 for Free

    public bool IsPublished { get; set; } = true;

    public int InstructorId { get; set; }
    public User? Instructor { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Module> Modules { get; set; } = new List<Module>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Discussion> Discussions { get; set; } = new List<Discussion>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    public ICollection<LiveClass> LiveClasses { get; set; } = new List<LiveClass>();
}
