namespace LMS.API.Services;

public class ZoomSettings
{
    public string AccountId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}

public class ZoomMeetingResult
{
    public string JoinUrl { get; set; } = string.Empty;
    public string StartUrl { get; set; } = string.Empty;
    public string MeetingId { get; set; } = string.Empty;
    public string Passcode { get; set; } = string.Empty;
}

public interface IZoomService
{
    Task<ZoomMeetingResult> CreateMeetingAsync(string topic, DateTime startTime, int durationMinutes, string? agenda = null);
}
