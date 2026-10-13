using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class QuizSummaryDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int PassingScore { get; set; }
    public int TimeLimitMinutes { get; set; }
    public int QuestionCount { get; set; }
    public int TotalPoints { get; set; }
    public bool HasAttempted { get; set; }
    public int? BestScore { get; set; }
    public bool? Passed { get; set; }
}

public class QuizDetailDto : QuizSummaryDto
{
    public List<QuestionDto> Questions { get; set; } = new();
}

public class QuestionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }
    public int Points { get; set; }
    // Instructor/Admin view may have CorrectOption, Student view hides CorrectOption during test
    public string? CorrectOption { get; set; }
    public string? Explanation { get; set; }
}

public class QuizSubmitRequest
{
    public Dictionary<int, string> Answers { get; set; } = new(); // QuestionId -> SelectedOption ('A', 'B', 'C', 'D')
}

public class QuizResultDto
{
    public int SubmissionId { get; set; }
    public int QuizId { get; set; }
    public int Score { get; set; }
    public int TotalPoints { get; set; }
    public double Percentage { get; set; }
    public bool Passed { get; set; }
    public int PassingScore { get; set; }
    public List<QuestionReviewDto> QuestionReviews { get; set; } = new();
}

public class QuestionReviewDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string SelectedOption { get; set; } = string.Empty;
    public string CorrectOption { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
    public int PointsEarned { get; set; }
}

public class QuizCreateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int PassingScore { get; set; } = 70;

    public int TimeLimitMinutes { get; set; } = 15;

    public List<QuestionCreateDto> Questions { get; set; } = new();
}

public class QuestionCreateDto
{
    [Required]
    public string Text { get; set; } = string.Empty;

    [Required]
    public string OptionA { get; set; } = string.Empty;

    [Required]
    public string OptionB { get; set; } = string.Empty;

    public string? OptionC { get; set; }

    public string? OptionD { get; set; }

    [Required, MaxLength(1)]
    public string CorrectOption { get; set; } = "A";

    public string? Explanation { get; set; }

    public int Points { get; set; } = 10;
}
