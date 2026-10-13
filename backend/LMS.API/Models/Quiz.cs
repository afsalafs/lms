using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMS.API.Models;

public class Quiz
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    [JsonIgnore]
    public Course? Course { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int PassingScore { get; set; } = 70; // Percentage, e.g. 70%

    public int TimeLimitMinutes { get; set; } = 15;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Question> Questions { get; set; } = new List<Question>();

    [JsonIgnore]
    public ICollection<QuizSubmission> Submissions { get; set; } = new List<QuizSubmission>();
}

public class Question
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    [JsonIgnore]
    public Quiz? Quiz { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    [Required]
    public string OptionA { get; set; } = string.Empty;

    [Required]
    public string OptionB { get; set; } = string.Empty;

    public string? OptionC { get; set; }

    public string? OptionD { get; set; }

    [Required, MaxLength(1)]
    public string CorrectOption { get; set; } = "A"; // "A", "B", "C", "D"

    public string? Explanation { get; set; }

    public int Points { get; set; } = 10;
}

public class QuizSubmission
{
    public int Id { get; set; }

    public int QuizId { get; set; }
    public Quiz? Quiz { get; set; }

    public int StudentId { get; set; }
    public User? Student { get; set; }

    public int Score { get; set; } // achieved points

    public int TotalPoints { get; set; }

    public bool Passed { get; set; }

    public string? AnswersJson { get; set; } // Record submitted options

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
