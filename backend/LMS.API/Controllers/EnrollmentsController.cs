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
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EnrollmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("my-courses")]
    public async Task<ActionResult<List<EnrollmentDto>>> GetMyCourses()
    {
        var studentId = GetCurrentUserId();

        var enrollments = await _context.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c!.Instructor)
            .Include(e => e.Course)
                .ThenInclude(c => c!.Modules)
                    .ThenInclude(m => m.Lessons)
            .Include(e => e.LessonProgresses)
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        var list = enrollments.Select(e =>
        {
            var totalLessons = e.Course?.Modules.SelectMany(m => m.Lessons).Count() ?? 0;
            var completedCount = e.LessonProgresses.Count(lp => lp.IsCompleted);

            return new EnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course?.Title ?? "Course",
                CourseThumbnail = e.Course?.ThumbnailUrl,
                Category = e.Course?.Category ?? "General",
                InstructorName = e.Course?.Instructor?.Name ?? "Instructor",
                StudentId = e.StudentId,
                Status = e.Status,
                AdminNote = e.AdminNote,
                TotalLessons = totalLessons,
                CompletedLessons = completedCount,
                ProgressPercentage = e.ProgressPercentage,
                EnrolledAt = e.EnrolledAt,
                ApprovedAt = e.ApprovedAt,
                CompletedAt = e.CompletedAt
            };
        }).ToList();

        return Ok(list);
    }

    [HttpPost("{courseId}")]
    public async Task<IActionResult> Enroll(int courseId)
    {
        var studentId = GetCurrentUserId();
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Course not found." });

        var existing = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (existing != null)
        {
            return Ok(new { 
                message = existing.Status == "Approved" 
                    ? "Already enrolled and approved for this course." 
                    : $"Enrollment application status is currently: {existing.Status}.", 
                enrollmentId = existing.Id,
                status = existing.Status
            });
        }

        // Enrollment requires Admin Approval before the student can enter the course & admit to class
        var enrollment = new Enrollment
        {
            CourseId = courseId,
            StudentId = studentId,
            Status = "Pending", // Awaiting admin approval
            EnrolledAt = DateTime.UtcNow,
            ProgressPercentage = 0
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = "Enrollment request submitted! It will be reviewed and approved by the administrator before you can access the course materials.", 
            enrollmentId = enrollment.Id,
            status = enrollment.Status
        });
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<EnrollmentDto>>> GetAllEnrollments([FromQuery] string? status)
    {
        var query = _context.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c!.Instructor)
            .Include(e => e.Course)
                .ThenInclude(c => c!.Modules)
                    .ThenInclude(m => m.Lessons)
            .Include(e => e.Student)
            .Include(e => e.LessonProgresses)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(e => e.Status.ToLower() == status.ToLower());
        }

        var enrollments = await query
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        var list = enrollments.Select(e =>
        {
            var totalLessons = e.Course?.Modules.SelectMany(m => m.Lessons).Count() ?? 0;
            var completedCount = e.LessonProgresses.Count(lp => lp.IsCompleted);

            return new EnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course?.Title ?? "Course",
                CourseThumbnail = e.Course?.ThumbnailUrl,
                Category = e.Course?.Category ?? "General",
                InstructorName = e.Course?.Instructor?.Name ?? "Instructor",
                StudentId = e.StudentId,
                StudentName = e.Student?.Name ?? "Student",
                StudentEmail = e.Student?.Email ?? "",
                Status = e.Status,
                AdminNote = e.AdminNote,
                TotalLessons = totalLessons,
                CompletedLessons = completedCount,
                ProgressPercentage = e.ProgressPercentage,
                EnrolledAt = e.EnrolledAt,
                ApprovedAt = e.ApprovedAt,
                CompletedAt = e.CompletedAt
            };
        }).ToList();

        return Ok(list);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEnrollmentStatus(int id, [FromBody] UpdateEnrollmentStatusRequest request)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (enrollment == null) return NotFound(new { message = "Enrollment request not found." });

        enrollment.Status = request.Status; // "Approved" or "Rejected"
        enrollment.AdminNote = request.AdminNote;
        if (request.Status == "Approved")
        {
            enrollment.ApprovedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Enrollment status updated to {enrollment.Status}.", 
            status = enrollment.Status,
            enrollmentId = enrollment.Id
        });
    }

    [HttpPost("lessons/{lessonId}/progress")]
    public async Task<ActionResult<LessonProgressResultDto>> UpdateLessonProgress(int lessonId, [FromBody] ToggleLessonProgressRequest request)
    {
        var studentId = GetCurrentUserId();
        var lesson = await _context.Lessons
            .Include(l => l.Module)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null || lesson.Module == null) return NotFound(new { message = "Lesson not found." });

        var courseId = lesson.Module.CourseId;

        // Check if student is enrolled AND approved
        var enrollment = await _context.Enrollments
            .Include(e => e.LessonProgresses)
            .Include(e => e.Course)
                .ThenInclude(c => c!.Modules)
                    .ThenInclude(m => m.Lessons)
            .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

        if (enrollment == null)
        {
            return BadRequest(new { message = "You are not enrolled in this course." });
        }

        if (enrollment.Status != "Approved")
        {
            return StatusCode(403, new { message = "Your enrollment in this course has not been approved by the Admin yet." });
        }

        var progress = enrollment.LessonProgresses.FirstOrDefault(p => p.LessonId == lessonId);
        if (progress == null)
        {
            progress = new LessonProgress
            {
                EnrollmentId = enrollment.Id,
                LessonId = lessonId,
                IsCompleted = request.IsCompleted,
                CompletedAt = request.IsCompleted ? DateTime.UtcNow : null
            };
            _context.LessonProgresses.Add(progress);
        }
        else
        {
            progress.IsCompleted = request.IsCompleted;
            progress.CompletedAt = request.IsCompleted ? DateTime.UtcNow : null;
        }

        await _context.SaveChangesAsync();

        // Recalculate progress percentage across all lessons in course modules
        var totalLessons = enrollment.Course?.Modules.SelectMany(m => m.Lessons).Count() ?? 0;
        var completedLessons = await _context.LessonProgresses
            .CountAsync(lp => lp.EnrollmentId == enrollment.Id && lp.IsCompleted);

        enrollment.ProgressPercentage = totalLessons > 0 ? (int)Math.Round((double)completedLessons / totalLessons * 100) : 0;

        string? certNumber = null;
        var isCourseCompleted = false;

        if (enrollment.ProgressPercentage >= 100)
        {
            isCourseCompleted = true;
            if (!enrollment.CompletedAt.HasValue)
            {
                enrollment.CompletedAt = DateTime.UtcNow;
            }

            // Issue Certificate if not yet issued
            var existingCert = await _context.Certificates
                .FirstOrDefaultAsync(c => c.CourseId == enrollment.CourseId && c.StudentId == studentId);

            if (existingCert == null)
            {
                certNumber = $"EDUBERG-{enrollment.CourseId}-{studentId}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
                var cert = new Certificate
                {
                    CourseId = enrollment.CourseId,
                    StudentId = studentId,
                    CertificateNumber = certNumber,
                    IssuedAt = DateTime.UtcNow
                };
                _context.Certificates.Add(cert);
            }
            else
            {
                certNumber = existingCert.CertificateNumber;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new LessonProgressResultDto
        {
            LessonId = lessonId,
            IsCompleted = progress.IsCompleted,
            ProgressPercentage = enrollment.ProgressPercentage,
            IsCourseCompleted = isCourseCompleted,
            CertificateNumber = certNumber
        });
    }

    [HttpGet("{courseId}/certificate")]
    public async Task<ActionResult<CertificateDto>> GetCertificate(int courseId)
    {
        var studentId = GetCurrentUserId();
        var cert = await _context.Certificates
            .Include(c => c.Student)
            .Include(c => c.Course)
                .ThenInclude(c => c!.Instructor)
            .FirstOrDefaultAsync(c => c.CourseId == courseId && c.StudentId == studentId);

        if (cert == null)
        {
            return NotFound(new { message = "Certificate not found. Complete 100% of course lessons first." });
        }

        return Ok(new CertificateDto
        {
            Id = cert.Id,
            CertificateNumber = cert.CertificateNumber,
            StudentName = cert.Student?.Name ?? "Student",
            CourseTitle = cert.Course?.Title ?? "Course",
            InstructorName = cert.Course?.Instructor?.Name ?? "Instructor",
            IssuedAt = cert.IssuedAt
        });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
