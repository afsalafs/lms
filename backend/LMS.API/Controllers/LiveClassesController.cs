using System.Security.Claims;
using LMS.API.Data;
using LMS.API.DTOs;
using LMS.API.Models;
using LMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LiveClassesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IZoomService _zoomService;

    public LiveClassesController(AppDbContext context, IZoomService zoomService)
    {
        _context = context;
        _zoomService = zoomService;
    }

    [HttpGet("/api/courses/{courseId}/live-classes")]
    public async Task<ActionResult<List<LiveClassDto>>> GetCourseLiveClasses(int courseId)
    {
        var list = await _context.LiveClasses
            .Include(l => l.Instructor)
            .Include(l => l.Course)
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.ScheduledStartTime)
            .Select(l => new LiveClassDto
            {
                Id = l.Id,
                CourseId = l.CourseId,
                CourseTitle = l.Course != null ? l.Course.Title : "",
                InstructorId = l.InstructorId,
                InstructorName = l.Instructor != null ? l.Instructor.Name : "Instructor",
                InstructorAvatar = l.Instructor != null ? l.Instructor.AvatarUrl : null,
                Title = l.Title,
                Description = l.Description,
                Platform = l.Platform,
                JoinUrl = l.JoinUrl,
                MeetingId = l.MeetingId,
                Passcode = l.Passcode,
                ScheduledStartTime = l.ScheduledStartTime,
                DurationMinutes = l.DurationMinutes,
                Status = l.Status,
                RecordingUrl = l.RecordingUrl,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<LiveClassDto>>> GetUpcomingLiveClasses()
    {
        var list = await _context.LiveClasses
            .Include(l => l.Instructor)
            .Include(l => l.Course)
            .Where(l => l.Status != "Completed")
            .OrderBy(l => l.ScheduledStartTime)
            .Take(10)
            .Select(l => new LiveClassDto
            {
                Id = l.Id,
                CourseId = l.CourseId,
                CourseTitle = l.Course != null ? l.Course.Title : "",
                InstructorId = l.InstructorId,
                InstructorName = l.Instructor != null ? l.Instructor.Name : "Instructor",
                InstructorAvatar = l.Instructor != null ? l.Instructor.AvatarUrl : null,
                Title = l.Title,
                Description = l.Description,
                Platform = l.Platform,
                JoinUrl = l.JoinUrl,
                MeetingId = l.MeetingId,
                Passcode = l.Passcode,
                ScheduledStartTime = l.ScheduledStartTime,
                DurationMinutes = l.DurationMinutes,
                Status = l.Status,
                RecordingUrl = l.RecordingUrl,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost("/api/courses/{courseId}/live-classes")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<LiveClassDto>> ScheduleLiveClass(int courseId, LiveClassCreateDto dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Course not found." });

        var userId = GetCurrentUserId();

        var joinUrl = dto.JoinUrl;
        var meetingId = dto.MeetingId;
        var passcode = dto.Passcode;

        // AUTOMATIC ZOOM MEETING GENERATION:
        // If platform is Zoom and no join URL was manually provided, auto-create a real Zoom meeting!
        if (dto.Platform.Equals("Zoom", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(joinUrl))
        {
            var zoomMeeting = await _zoomService.CreateMeetingAsync(
                dto.Title, 
                dto.ScheduledStartTime, 
                dto.DurationMinutes, 
                dto.Description
            );

            joinUrl = zoomMeeting.JoinUrl;
            meetingId = zoomMeeting.MeetingId;
            passcode = zoomMeeting.Passcode;
        }

        var liveClass = new LiveClass
        {
            CourseId = courseId,
            InstructorId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Platform = dto.Platform,
            JoinUrl = joinUrl ?? "https://zoom.us",
            MeetingId = meetingId,
            Passcode = passcode,
            ScheduledStartTime = dto.ScheduledStartTime,
            DurationMinutes = dto.DurationMinutes,
            Status = "Scheduled",
            RecordingUrl = dto.RecordingUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.LiveClasses.Add(liveClass);
        await _context.SaveChangesAsync();

        var instructor = await _context.Users.FindAsync(userId);

        return Ok(new LiveClassDto
        {
            Id = liveClass.Id,
            CourseId = liveClass.CourseId,
            CourseTitle = course.Title,
            InstructorId = liveClass.InstructorId,
            InstructorName = instructor?.Name ?? "Instructor",
            InstructorAvatar = instructor?.AvatarUrl,
            Title = liveClass.Title,
            Description = liveClass.Description,
            Platform = liveClass.Platform,
            JoinUrl = liveClass.JoinUrl,
            MeetingId = liveClass.MeetingId,
            Passcode = liveClass.Passcode,
            ScheduledStartTime = liveClass.ScheduledStartTime,
            DurationMinutes = liveClass.DurationMinutes,
            Status = liveClass.Status,
            RecordingUrl = liveClass.RecordingUrl,
            CreatedAt = liveClass.CreatedAt
        });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> UpdateStatus(int id, LiveClassUpdateStatusDto dto)
    {
        var live = await _context.LiveClasses.FindAsync(id);
        if (live == null) return NotFound();

        live.Status = dto.Status;
        if (!string.IsNullOrWhiteSpace(dto.RecordingUrl))
        {
            live.RecordingUrl = dto.RecordingUrl;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Live class status updated.", status = live.Status });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteLiveClass(int id)
    {
        var live = await _context.LiveClasses.FindAsync(id);
        if (live == null) return NotFound();

        _context.LiveClasses.Remove(live);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Live class deleted." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
