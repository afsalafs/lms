using System.Security.Claims;
using LMS.API.Data;
using LMS.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminDashboardDto>> GetAdminStats()
    {
        var totalStudents = await _context.Users.CountAsync(u => u.Role == "Student");
        var totalInstructors = await _context.Users.CountAsync(u => u.Role == "Instructor");
        var totalCourses = await _context.Courses.CountAsync();
        var totalEnrollments = await _context.Enrollments.CountAsync();
        var completedEnrollments = await _context.Enrollments.CountAsync(e => e.ProgressPercentage >= 100);
        var pendingRegistrations = await _context.Users.CountAsync(u => u.AccountStatus == "Pending");
        var pendingEnrollments = await _context.Enrollments.CountAsync(e => e.Status == "Pending");

        var popularCourses = await _context.Courses
            .Include(c => c.Enrollments)
            .OrderByDescending(c => c.Enrollments.Count)
            .Take(5)
            .Select(c => new CourseEnrollmentStatDto
            {
                CourseId = c.Id,
                Title = c.Title,
                Category = c.Category,
                StudentCount = c.Enrollments.Count(e => e.Status == "Approved")
            })
            .ToListAsync();

        var recentActivities = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .OrderByDescending(e => e.EnrolledAt)
            .Take(5)
            .Select(e => new RecentActivityDto
            {
                Action = e.Status == "Approved" ? "Enrolled in course" : "Applied for enrollment (Pending)",
                UserName = e.Student != null ? e.Student.Name : "Student",
                TargetTitle = e.Course != null ? e.Course.Title : "Course",
                Timestamp = e.EnrolledAt
            })
            .ToListAsync();

        return Ok(new AdminDashboardDto
        {
            TotalStudents = totalStudents,
            TotalInstructors = totalInstructors,
            TotalCourses = totalCourses,
            TotalEnrollments = totalEnrollments,
            CompletedEnrollments = completedEnrollments,
            PendingRegistrationsCount = pendingRegistrations,
            PendingEnrollmentsCount = pendingEnrollments,
            PopularCourses = popularCourses,
            RecentActivities = recentActivities
        });
    }

    [HttpGet("instructor")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<InstructorDashboardDto>> GetInstructorStats()
    {
        var instructorId = GetCurrentUserId();

        var coursesQuery = _context.Courses
            .Include(c => c.Enrollments)
            .Include(c => c.Modules)
                .ThenInclude(m => m.Lessons)
            .Include(c => c.Quizzes)
            .Include(c => c.Assignments)
                .ThenInclude(a => a.Submissions)
            .AsQueryable();

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        if (role != "Admin")
        {
            coursesQuery = coursesQuery.Where(c => c.InstructorId == instructorId);
        }

        var courses = await coursesQuery.ToListAsync();

        var totalCourses = courses.Count;
        var totalEnrolledStudents = courses.Sum(c => c.Enrollments.Count(e => e.Status == "Approved"));
        var pendingAssignments = courses
            .SelectMany(c => c.Assignments)
            .SelectMany(a => a.Submissions)
            .Count(s => !s.Grade.HasValue);

        var list = courses.Select(c => new CourseSummaryStatDto
        {
            CourseId = c.Id,
            Title = c.Title,
            StudentCount = c.Enrollments.Count(e => e.Status == "Approved"),
            LessonCount = c.Modules.SelectMany(m => m.Lessons).Count(),
            QuizCount = c.Quizzes.Count,
            AssignmentCount = c.Assignments.Count,
            IsPublished = c.IsPublished
        }).ToList();

        return Ok(new InstructorDashboardDto
        {
            TotalCoursesTaught = totalCourses,
            TotalEnrolledStudents = totalEnrolledStudents,
            PendingAssignmentsToGrade = pendingAssignments,
            Courses = list
        });
    }

    [HttpGet("student")]
    public async Task<ActionResult<StudentDashboardDto>> GetStudentStats()
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

        var certsCount = await _context.Certificates.CountAsync(c => c.StudentId == studentId);

        var recentList = enrollments.Take(5).Select(e => new EnrollmentDto
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
            TotalLessons = e.Course?.Modules.SelectMany(m => m.Lessons).Count() ?? 0,
            CompletedLessons = e.LessonProgresses.Count(lp => lp.IsCompleted),
            ProgressPercentage = e.ProgressPercentage,
            EnrolledAt = e.EnrolledAt,
            ApprovedAt = e.ApprovedAt,
            CompletedAt = e.CompletedAt
        }).ToList();

        return Ok(new StudentDashboardDto
        {
            EnrolledCoursesCount = enrollments.Count(e => e.Status == "Approved"),
            InProgressCoursesCount = enrollments.Count(e => e.Status == "Approved" && e.ProgressPercentage < 100),
            CompletedCoursesCount = enrollments.Count(e => e.Status == "Approved" && e.ProgressPercentage >= 100),
            CertificatesEarned = certsCount,
            RecentCourses = recentList
        });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
