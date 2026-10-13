using System.Security.Claims;
using LMS.API.Data;
using LMS.API.DTOs;
using LMS.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController : ControllerBase
{
    private readonly AppDbContext _context;

    public LessonsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LessonDetailDto>> GetLesson(int id)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Module)
                .ThenInclude(m => m!.Course)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null || lesson.Module == null) return NotFound(new { message = "Lesson not found." });

        var courseId = lesson.Module.CourseId;
        var userId = GetCurrentUserId();
        var isCompleted = false;

        if (userId > 0)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == userId);

            // Access gate: Must be enrolled AND approved OR lesson must be free preview
            if (!lesson.IsFreePreview)
            {
                if (enrollment == null)
                {
                    return StatusCode(403, new { message = "You must be enrolled in this course to view this lesson." });
                }
                if (enrollment.Status != "Approved")
                {
                    return StatusCode(403, new { message = "Your enrollment in this course is awaiting Admin approval." });
                }
            }

            if (enrollment != null)
            {
                isCompleted = enrollment.LessonProgresses.Any(lp => lp.LessonId == id && lp.IsCompleted);
            }
        }
        else if (!lesson.IsFreePreview)
        {
            return StatusCode(401, new { message = "Please log in to view this lesson." });
        }

        return Ok(new LessonDetailDto
        {
            Id = lesson.Id,
            ModuleId = lesson.ModuleId,
            CourseId = courseId,
            Title = lesson.Title,
            Description = lesson.Description,
            Content = lesson.Content,
            VideoUrl = lesson.VideoUrl,
            DurationMinutes = lesson.DurationMinutes,
            OrderIndex = lesson.OrderIndex,
            IsFreePreview = lesson.IsFreePreview,
            IsCompleted = isCompleted
        });
    }

    [HttpPost("/api/modules/{moduleId}/lessons")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<LessonDetailDto>> CreateLesson(int moduleId, LessonCreateUpdateDto dto)
    {
        var module = await _context.Modules.Include(m => m.Course).FirstOrDefaultAsync(m => m.Id == moduleId);
        if (module == null) return NotFound(new { message = "Module not found." });

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && module.Course?.InstructorId != userId)
        {
            return Forbid();
        }

        var lesson = new Lesson
        {
            ModuleId = moduleId,
            Title = dto.Title,
            Description = dto.Description,
            Content = dto.Content,
            VideoUrl = dto.VideoUrl,
            DurationMinutes = dto.DurationMinutes,
            OrderIndex = dto.OrderIndex,
            IsFreePreview = dto.IsFreePreview,
            CreatedAt = DateTime.UtcNow
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, new LessonDetailDto
        {
            Id = lesson.Id,
            ModuleId = lesson.ModuleId,
            CourseId = module.CourseId,
            Title = lesson.Title,
            Description = lesson.Description,
            Content = lesson.Content,
            VideoUrl = lesson.VideoUrl,
            DurationMinutes = lesson.DurationMinutes,
            OrderIndex = lesson.OrderIndex,
            IsFreePreview = lesson.IsFreePreview,
            IsCompleted = false
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> UpdateLesson(int id, LessonCreateUpdateDto dto)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Module)
                .ThenInclude(m => m!.Course)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && lesson.Module?.Course?.InstructorId != userId)
        {
            return Forbid();
        }

        lesson.Title = dto.Title;
        lesson.Description = dto.Description;
        lesson.Content = dto.Content;
        lesson.VideoUrl = dto.VideoUrl;
        lesson.DurationMinutes = dto.DurationMinutes;
        lesson.OrderIndex = dto.OrderIndex;
        lesson.IsFreePreview = dto.IsFreePreview;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Lesson updated successfully." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteLesson(int id)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Module)
                .ThenInclude(m => m!.Course)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lesson == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && lesson.Module?.Course?.InstructorId != userId)
        {
            return Forbid();
        }

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Lesson deleted successfully." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
