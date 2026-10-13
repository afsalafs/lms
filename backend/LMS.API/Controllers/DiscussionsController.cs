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
public class DiscussionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiscussionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("/api/courses/{courseId}/discussions")]
    public async Task<ActionResult<List<DiscussionDto>>> GetCourseDiscussions(int courseId)
    {
        var discussions = await _context.Discussions
            .Include(d => d.User)
            .Include(d => d.Replies)
                .ThenInclude(r => r.User)
            .Where(d => d.CourseId == courseId && d.ParentId == null)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        var list = discussions.Select(d => new DiscussionDto
        {
            Id = d.Id,
            CourseId = d.CourseId,
            UserId = d.UserId,
            UserName = d.User?.Name ?? "User",
            UserRole = d.User?.Role ?? "Student",
            UserAvatar = d.User?.AvatarUrl,
            ParentId = d.ParentId,
            Content = d.Content,
            CreatedAt = d.CreatedAt,
            Replies = d.Replies.OrderBy(r => r.CreatedAt).Select(r => new DiscussionDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                UserId = r.UserId,
                UserName = r.User?.Name ?? "User",
                UserRole = r.User?.Role ?? "Student",
                UserAvatar = r.User?.AvatarUrl,
                ParentId = r.ParentId,
                Content = r.Content,
                CreatedAt = r.CreatedAt
            }).ToList()
        }).ToList();

        return Ok(list);
    }

    [HttpPost("/api/courses/{courseId}/discussions")]
    [Authorize]
    public async Task<ActionResult<DiscussionDto>> PostDiscussion(int courseId, DiscussionCreateDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Course not found." });

        var discussion = new Discussion
        {
            CourseId = courseId,
            UserId = userId,
            ParentId = dto.ParentId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Discussions.Add(discussion);
        await _context.SaveChangesAsync();

        return Ok(new DiscussionDto
        {
            Id = discussion.Id,
            CourseId = discussion.CourseId,
            UserId = user.Id,
            UserName = user.Name,
            UserRole = user.Role,
            UserAvatar = user.AvatarUrl,
            ParentId = discussion.ParentId,
            Content = discussion.Content,
            CreatedAt = discussion.CreatedAt,
            Replies = new List<DiscussionDto>()
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteDiscussion(int id)
    {
        var item = await _context.Discussions.FindAsync(id);
        if (item == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole != "Admin" && item.UserId != userId)
        {
            return Forbid();
        }

        _context.Discussions.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Deleted successfully." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
