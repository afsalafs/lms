using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class ModuleDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
    public List<LessonSummaryDto> Lessons { get; set; } = new();
}

public class ModuleCreateUpdateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int OrderIndex { get; set; } = 0;
}
