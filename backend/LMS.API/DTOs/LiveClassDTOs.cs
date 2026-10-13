using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class LiveClassDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string? InstructorAvatar { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Platform { get; set; } = "Zoom";
    public string JoinUrl { get; set; } = string.Empty;
    public string? MeetingId { get; set; }
    public string? Passcode { get; set; }
    public DateTime ScheduledStartTime { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Live, Completed
    public string? RecordingUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LiveClassCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required, MaxLength(50)]
    public string Platform { get; set; } = "Zoom"; // Zoom, Google Meet, Microsoft Teams, Jitsi

    // Made optional because Zoom API will auto-generate JoinUrl!
    public string? JoinUrl { get; set; }

    public string? MeetingId { get; set; }

    public string? Passcode { get; set; }

    [Required]
    public DateTime ScheduledStartTime { get; set; }

    public int DurationMinutes { get; set; } = 60;

    public string? RecordingUrl { get; set; }
}

public class LiveClassUpdateStatusDto
{
    [Required]
    public string Status { get; set; } = "Live"; // Scheduled, Live, Completed

    public string? RecordingUrl { get; set; }
}
