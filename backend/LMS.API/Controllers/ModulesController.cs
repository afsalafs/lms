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
public class ModulesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ModulesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("/api/courses/{courseId}/modules")]
    public async Task<ActionResult<List<ModuleDto>>> GetCourseModules(int courseId)
    {
        var modules = await _context.Modules
            .Include(m => m.Lessons.OrderBy(l => l.OrderIndex))
            .Where(m => m.CourseId == courseId)
            .OrderBy(m => m.OrderIndex)
            .Select(m => new ModuleDto
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
                    IsFreePreview = l.IsFreePreview
                }).ToList()
            })
            .ToListAsync();

        return Ok(modules);
    }

    [HttpPost("/api/courses/{courseId}/modules")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<ModuleDto>> CreateModule(int courseId, ModuleCreateUpdateDto dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound(new { message = "Course not found." });

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && course.InstructorId != userId)
        {
            return Forbid();
        }

        var module = new Module
        {
            CourseId = courseId,
            Title = dto.Title,
            Description = dto.Description,
            OrderIndex = dto.OrderIndex,
            CreatedAt = DateTime.UtcNow
        };

        _context.Modules.Add(module);
        await _context.SaveChangesAsync();

        return Ok(new ModuleDto
        {
            Id = module.Id,
            CourseId = module.CourseId,
            Title = module.Title,
            Description = module.Description,
            OrderIndex = module.OrderIndex,
            Lessons = new List<LessonSummaryDto>()
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> UpdateModule(int id, ModuleCreateUpdateDto dto)
    {
        var module = await _context.Modules.Include(m => m.Course).FirstOrDefaultAsync(m => m.Id == id);
        if (module == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && module.Course?.InstructorId != userId)
        {
            return Forbid();
        }

        module.Title = dto.Title;
        module.Description = dto.Description;
        module.OrderIndex = dto.OrderIndex;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Module updated successfully." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> DeleteModule(int id)
    {
        var module = await _context.Modules.Include(m => m.Course).FirstOrDefaultAsync(m => m.Id == id);
        if (module == null) return NotFound();

        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin" && module.Course?.InstructorId != userId)
        {
            return Forbid();
        }

        _context.Modules.Remove(module);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Module deleted successfully." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
