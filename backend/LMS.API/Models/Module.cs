namespace LMS.API.Models;

public class Module
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course? Course { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
