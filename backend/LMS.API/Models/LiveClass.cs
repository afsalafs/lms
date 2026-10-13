using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class LiveClass
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    [JsonIgnore]
    public Course? Course { get; set; }

    public int InstructorId { get; set; }
    public User? Instructor { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required, MaxLength(50)]
    public string Platform { get; set; } = "Zoom"; // Zoom, Google Meet, Microsoft Teams, Jitsi

    [Required]
    public string JoinUrl { get; set; } = string.Empty;

    public string? MeetingId { get; set; }

    public string? Passcode { get; set; }

    public DateTime ScheduledStartTime { get; set; }

    public int DurationMinutes { get; set; } = 60;

    [MaxLength(20)]
    public string Status { get; set; } = "Scheduled"; // Scheduled, Live, Completed

    public string? RecordingUrl { get; set; } // Zoom Cloud recording or Vimeo/YouTube replay URL

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
