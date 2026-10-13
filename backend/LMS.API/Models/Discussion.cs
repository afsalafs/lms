using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class Discussion
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    [JsonIgnore]
    public Course? Course { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int? ParentId { get; set; }
    [JsonIgnore]
    public Discussion? Parent { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Discussion> Replies { get; set; } = new List<Discussion>();
}

public class Certificate
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public User? Student { get; set; }

    public int CourseId { get; set; }
    public Course? Course { get; set; }

    [Required, MaxLength(100)]
    public string CertificateNumber { get; set; } = string.Empty;

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
