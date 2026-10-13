using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class DiscussionDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public int? ParentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<DiscussionDto> Replies { get; set; } = new();
}

public class DiscussionCreateDto
{
    [Required]
    public string Content { get; set; } = string.Empty;

    public int? ParentId { get; set; }
}

public class CertificateDto
{
    public int Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
}
