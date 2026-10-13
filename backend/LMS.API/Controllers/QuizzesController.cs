using System.Security.Claims;
using System.Text.Json;
using LMS.API.Data;
using LMS.API.DTOs;
using LMS.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuizzesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDetailDto>> GetQuiz(int id)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Submissions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null) return NotFound(new { message = "Quiz not found." });

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var isInstructorOrAdmin = userRole == "Admin" || userRole == "Instructor";

        var mySubmissions = userId > 0 
            ? quiz.Submissions.Where(s => s.StudentId == userId).ToList() 
            : new List<QuizSubmission>();
        var best = mySubmissions.OrderByDescending(s => s.Score).FirstOrDefault();

        var dto = new QuizDetailDto
        {
            Id = quiz.Id,
            CourseId = quiz.CourseId,
            Title = quiz.Title,
            Description = quiz.Description,
            PassingScore = quiz.PassingScore,
            TimeLimitMinutes = quiz.TimeLimitMinutes,
            QuestionCount = quiz.Questions.Count,
            TotalPoints = quiz.Questions.Sum(q => q.Points),
            HasAttempted = best != null,
            BestScore = best?.Score,
            Passed = best?.Passed,
            Questions = quiz.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                Points = q.Points,
                CorrectOption = isInstructorOrAdmin ? q.CorrectOption : null,
                Explanation = isInstructorOrAdmin ? q.Explanation : null
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost("/api/courses/{courseId}/quizzes")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<QuizDetailDto>> CreateQuiz(int courseId, QuizCreateDto dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Course not found." });

        var quiz = new Quiz
        {
            CourseId = courseId,
            Title = dto.Title,
            Description = dto.Description,
            PassingScore = dto.PassingScore,
            TimeLimitMinutes = dto.TimeLimitMinutes,
            CreatedAt = DateTime.UtcNow,
            Questions = dto.Questions.Select(q => new Question
            {
                Text = q.Text,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectOption = q.CorrectOption.ToUpper(),
                Explanation = q.Explanation,
                Points = q.Points
            }).ToList()
        };

        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuiz), new { id = quiz.Id }, new QuizDetailDto
        {
            Id = quiz.Id,
            CourseId = quiz.CourseId,
            Title = quiz.Title,
            Description = quiz.Description,
            PassingScore = quiz.PassingScore,
            TimeLimitMinutes = quiz.TimeLimitMinutes,
            QuestionCount = quiz.Questions.Count,
            TotalPoints = quiz.Questions.Sum(q => q.Points),
            Questions = quiz.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                Points = q.Points,
                CorrectOption = q.CorrectOption,
                Explanation = q.Explanation
            }).ToList()
        });
    }

    [HttpPost("{id}/submit")]
    [Authorize]
    public async Task<ActionResult<QuizResultDto>> SubmitQuiz(int id, QuizSubmitRequest request)
    {
        var studentId = GetCurrentUserId();
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null) return NotFound(new { message = "Quiz not found." });

        var totalPoints = quiz.Questions.Sum(q => q.Points);
        var earnedPoints = 0;
        var reviews = new List<QuestionReviewDto>();

        foreach (var question in quiz.Questions)
        {
            request.Answers.TryGetValue(question.Id, out var selectedOption);
            selectedOption = (selectedOption ?? "").Trim().ToUpper();

            var isCorrect = !string.IsNullOrEmpty(selectedOption) && 
                            selectedOption.Equals(question.CorrectOption, StringComparison.OrdinalIgnoreCase);

            var points = isCorrect ? question.Points : 0;
            earnedPoints += points;

            reviews.Add(new QuestionReviewDto
            {
                QuestionId = question.Id,
                QuestionText = question.Text,
                SelectedOption = selectedOption,
                CorrectOption = question.CorrectOption,
                IsCorrect = isCorrect,
                Explanation = question.Explanation,
                PointsEarned = points
            });
        }

        var percentage = totalPoints > 0 ? ((double)earnedPoints / totalPoints) * 100 : 0;
        var passed = percentage >= quiz.PassingScore;

        var submission = new QuizSubmission
        {
            QuizId = id,
            StudentId = studentId,
            Score = earnedPoints,
            TotalPoints = totalPoints,
            Passed = passed,
            AnswersJson = JsonSerializer.Serialize(request.Answers),
            SubmittedAt = DateTime.UtcNow
        };

        _context.QuizSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(new QuizResultDto
        {
            SubmissionId = submission.Id,
            QuizId = id,
            Score = earnedPoints,
            TotalPoints = totalPoints,
            Percentage = Math.Round(percentage, 1),
            Passed = passed,
            PassingScore = quiz.PassingScore,
            QuestionReviews = reviews
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var quiz = await _context.Quizzes.FindAsync(id);
        if (quiz == null) return NotFound();

        _context.Quizzes.Remove(quiz);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Quiz deleted successfully." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
