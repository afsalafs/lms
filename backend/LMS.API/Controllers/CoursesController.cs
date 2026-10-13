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
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseDto>>> GetCourses(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? level)
    {
        var query = _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Modules)
                .ThenInclude(m => m.Lessons)
            .Include(c => c.Enrollments)
            .Where(c => c.IsPublished)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(s) || c.Description.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(c => c.Category.ToLower() == category.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(level) && level != "All")
        {
            query = query.Where(c => c.Level.ToLower() == level.Trim().ToLower());
        }

        var courses = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Title = c.Title,
                ShortDescription = c.ShortDescription,
                Description = c.Description,
                Category = c.Category,
                Level = c.Level,
                ThumbnailUrl = c.ThumbnailUrl,
                Price = c.Price,
                IsPublished = c.IsPublished,
                InstructorId = c.InstructorId,
                InstructorName = c.Instructor != null ? c.Instructor.Name : "Instructor",
                InstructorAvatar = c.Instructor != null ? c.Instructor.AvatarUrl : null,
                TotalModules = c.Modules.Count,
                TotalLessons = c.Modules.SelectMany(m => m.Lessons).Count(),
                TotalDurationMinutes = c.Modules.SelectMany(m => m.Lessons).Sum(l => l.DurationMinutes),
                EnrolledStudentsCount = c.Enrollments.Count(e => e.Status == "Approved"),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDetailDto>> GetCourse(int id)
    {
        var course = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Modules.OrderBy(m => m.OrderIndex))
                .ThenInclude(m => m.Lessons.OrderBy(l => l.OrderIndex))
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.Questions)
            .Include(c => c.Quizzes)
                .ThenInclude(q => q.Submissions)
            .Include(c => c.Assignments)
                .ThenInclude(a => a.Submissions)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "Course not found." });

        var userId = GetCurrentUserId();
        var enrollment = userId > 0 
            ? await _context.Enrollments
                .Include(e => e.LessonProgresses)
                .FirstOrDefaultAsync(e => e.CourseId == id && e.StudentId == userId)
            : null;

        var completedLessonIds = enrollment?.LessonProgresses
            .Where(lp => lp.IsCompleted)
            .Select(lp => lp.LessonId)
            .ToList() ?? new List<int>();

        var allLessons = course.Modules.SelectMany(m => m.Lessons).ToList();

        var dto = new CourseDetailDto
        {
            Id = course.Id,
            Title = course.Title,
            ShortDescription = course.ShortDescription,
            Description = course.Description,
            Category = course.Category,
            Level = course.Level,
            ThumbnailUrl = course.ThumbnailUrl,
            Price = course.Price,
            IsPublished = course.IsPublished,
            InstructorId = course.InstructorId,
            InstructorName = course.Instructor?.Name ?? "Instructor",
            InstructorAvatar = course.Instructor?.AvatarUrl,
            TotalModules = course.Modules.Count,
            TotalLessons = allLessons.Count,
            TotalDurationMinutes = allLessons.Sum(l => l.DurationMinutes),
            EnrolledStudentsCount = course.Enrollments.Count(e => e.Status == "Approved"),
            CreatedAt = course.CreatedAt,
            IsUserEnrolled = enrollment != null && enrollment.Status == "Approved",
            EnrollmentStatus = enrollment?.Status ?? "None",
            UserProgressPercentage = enrollment?.ProgressPercentage ?? 0,
            CompletedLessonIds = completedLessonIds,
            Modules = course.Modules.Select(m => new ModuleDto
            {
                Id = m.Id,
                CourseId = m.CourseId,
                Title = m.Title,
                Description = m.Description,
                OrderIndex = m.OrderIndex,
                Lessons = m.Lessons.Select(l => new LessonSummaryDto
                {
                    Id = l.Id,
                    ModuleId = l.ModuleId,
                    CourseId = m.CourseId,
                    Title = l.Title,
                    Description = l.Description,
                    DurationMinutes = l.DurationMinutes,
                    OrderIndex = l.OrderIndex,
                    IsFreePreview = l.IsFreePreview,
                    IsCompleted = completedLessonIds.Contains(l.Id)
                }).ToList()
            }).ToList(),
            Quizzes = course.Quizzes.Select(q =>
            {
                var mySubmissions = userId > 0 
                    ? q.Submissions.Where(s => s.StudentId == userId).ToList() 
                    : new List<QuizSubmission>();
                var bestSub = mySubmissions.OrderByDescending(s => s.Score).FirstOrDefault();

                return new QuizSummaryDto
                {
                    Id = q.Id,
                    CourseId = q.CourseId,
                    Title = q.Title,
                    Description = q.Description,
                    PassingScore = q.PassingScore,
                    TimeLimitMinutes = q.TimeLimitMinutes,
                    QuestionCount = q.Questions.Count,
                    TotalPoints = q.Questions.Sum(ques => ques.Points),
                    HasAttempted = bestSub != null,
                    BestScore = bestSub?.Score,
                    Passed = bestSub?.Passed
                };
            }).ToList(),
            Assignments = course.Assignments.Select(a =>
            {
                var mySub = userId > 0 ? a.Submissions.FirstOrDefault(s => s.StudentId == userId) : null;
                return new AssignmentSummaryDto
                {
                    Id = a.Id,
                    CourseId = a.CourseId,
                    Title = a.Title,
                    Instructions = a.Instructions,
                    MaxPoints = a.MaxPoints,
                    DueDate = a.DueDate,
                    HasSubmitted = mySub != null,
                    MyGrade = mySub?.Grade,
                    MyFeedback = mySub?.Feedback,
                    MySubmittedAt = mySub?.SubmittedAt,
                    TotalSubmissions = a.Submissions.Count
                };
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<CourseDto>> CreateCourse(CourseCreateDto dto)
    {
        var userId = GetCurrentUserId();
        var course = new Course
        {
            Title = dto.Title,
            ShortDescription = dto.ShortDescription,
            Description = dto.Description,
            Category = dto.Category,
            Level = dto.Level,
            ThumbnailUrl = string.IsNullOrWhiteSpace(dto.ThumbnailUrl) 
                ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80" 
                : dto.ThumbnailUrl,
            Price = dto.Price,
            IsPublished = dto.IsPublished,
            InstructorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var instructor = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, new CourseDto
        {
            Id = course.Id,
            Title = course.Title,
            ShortDescription = course.ShortDescription,
            Description = course.Description,
            Category = course.Category,
            Level = course.Level,
            ThumbnailUrl = course.ThumbnailUrl,
            Price = course.Price,
            IsPublished = course.IsPublished,
            InstructorId = course.InstructorId,
            InstructorName = instructor?.Name ?? "Instructor",
            InstructorAvatar = instructor?.AvatarUrl,
            TotalModules = 0,
            TotalLessons = 0,
            TotalDurationMinutes = 0,
            EnrolledStudentsCount = 0,
            CreatedAt = course.CreatedAt
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> UpdateCourse(int id, CourseUpdateDto dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole != "Admin" && course.InstructorId != userId)
        {
            return Forbid();
        }

        course.Title = dto.Title;
        course.ShortDescription = dto.ShortDescription;
        course.Description = dto.Description;
        course.Category = dto.Category;
        course.Level = dto.Level;
        if (!string.IsNullOrWhiteSpace(dto.ThumbnailUrl)) course.ThumbnailUrl = dto.ThumbnailUrl;
        course.Price = dto.Price;
        course.IsPublished = dto.IsPublished;
        course.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Course updated successfully." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole != "Admin" && course.InstructorId != userId)
        {
            return Forbid();
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Course deleted successfully." });
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        var categories = await _context.Courses
            .Where(c => c.IsPublished)
            .Select(c => c.Category)
            .Distinct()
            .ToListAsync();

        if (!categories.Any())
        {
            categories = new List<string> { "Web Development", "Database", "DevOps", "Data Science", "Mobile" };
        }

        return Ok(categories);
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
