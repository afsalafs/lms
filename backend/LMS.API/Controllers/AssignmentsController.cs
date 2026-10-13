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
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AssignmentDetailDto>> GetAssignment(int id)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null) return NotFound(new { message = "Assignment not found." });

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var isInstructorOrAdmin = userRole == "Admin" || userRole == "Instructor";

        var mySub = userId > 0 ? assignment.Submissions.FirstOrDefault(s => s.StudentId == userId) : null;

        var dto = new AssignmentDetailDto
        {
            Id = assignment.Id,
            CourseId = assignment.CourseId,
            Title = assignment.Title,
            Instructions = assignment.Instructions,
            MaxPoints = assignment.MaxPoints,
            DueDate = assignment.DueDate,
            HasSubmitted = mySub != null,
            MyGrade = mySub?.Grade,
            MyFeedback = mySub?.Feedback,
            MySubmittedAt = mySub?.SubmittedAt,
            TotalSubmissions = assignment.Submissions.Count,
            Submissions = isInstructorOrAdmin ? assignment.Submissions.Select(s => new AssignmentSubmissionDto
            {
                Id = s.Id,
                AssignmentId = s.AssignmentId,
                StudentId = s.StudentId,
                StudentName = s.Student?.Name ?? "Student",
                StudentEmail = s.Student?.Email ?? "",
                SubmissionText = s.SubmissionText,
                AttachmentUrl = s.AttachmentUrl,
                SubmittedAt = s.SubmittedAt,
                Grade = s.Grade,
                Feedback = s.Feedback,
                GradedAt = s.GradedAt
            }).ToList() : new List<AssignmentSubmissionDto>()
        };

        return Ok(dto);
    }

    [HttpPost("/api/courses/{courseId}/assignments")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<AssignmentSummaryDto>> CreateAssignment(int courseId, AssignmentCreateDto dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Course not found." });

        var assignment = new Assignment
        {
            CourseId = courseId,
            Title = dto.Title,
            Instructions = dto.Instructions,
            MaxPoints = dto.MaxPoints,
            DueDate = dto.DueDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, new AssignmentSummaryDto
        {
            Id = assignment.Id,
            CourseId = assignment.CourseId,
            Title = assignment.Title,
            Instructions = assignment.Instructions,
            MaxPoints = assignment.MaxPoints,
            DueDate = assignment.DueDate,
            HasSubmitted = false,
            TotalSubmissions = 0
        });
    }

    [HttpPost("{id}/submit")]
    [Authorize]
    public async Task<IActionResult> SubmitAssignment(int id, AssignmentSubmitDto dto)
    {
        var studentId = GetCurrentUserId();
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound(new { message = "Assignment not found." });

        var existing = await _context.AssignmentSubmissions
            .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == studentId);

        if (existing != null)
        {
            existing.SubmissionText = dto.SubmissionText;
            existing.AttachmentUrl = dto.AttachmentUrl;
            existing.SubmittedAt = DateTime.UtcNow;
        }
        else
        {
            var submission = new AssignmentSubmission
            {
                AssignmentId = id,
                StudentId = studentId,
                SubmissionText = dto.SubmissionText,
                AttachmentUrl = dto.AttachmentUrl,
                SubmittedAt = DateTime.UtcNow
            };
            _context.AssignmentSubmissions.Add(submission);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Assignment submitted successfully." });
    }

    [HttpPost("submissions/{submissionId}/grade")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> GradeSubmission(int submissionId, AssignmentGradeDto dto)
    {
        var sub = await _context.AssignmentSubmissions.FindAsync(submissionId);
        if (sub == null) return NotFound(new { message = "Submission not found." });

        sub.Grade = dto.Grade;
        sub.Feedback = dto.Feedback;
        sub.GradedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Submission graded successfully." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound();

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Assignment deleted successfully." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
