using System.Security.Claims;
using LMS.API.Data;
using LMS.API.DTOs;
using LMS.API.Models;
using LMS.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
        {
            return BadRequest(new { message = "Email is already registered." });
        }

        var allowedRoles = new[] { "Student", "Instructor" };
        var role = allowedRoles.Contains(request.Role, StringComparer.OrdinalIgnoreCase) 
            ? request.Role 
            : "Student";

        // Admin approval rule:
        // Any newly registered user begins with AccountStatus = "Pending"
        // Admins can approve them so they can log in.
        var user = new User
        {
            Name = request.Name,
            Email = request.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role,
            AccountStatus = "Pending", // Awaits admin validation and approval
            Bio = request.Bio,
            AvatarUrl = $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(request.Name)}"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Token = string.Empty, // No token until admin approves!
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            AccountStatus = user.AccountStatus,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        // Validate admin approval
        if (user.AccountStatus == "Pending")
        {
            return StatusCode(403, new { 
                message = "Your registration is pending approval by the Admin. You will be able to log in once your account is verified and approved.",
                accountStatus = "Pending"
            });
        }

        if (user.AccountStatus == "Rejected")
        {
            return StatusCode(403, new { 
                message = "Your registration was rejected by the Admin. Please contact support at EduBerg India.",
                accountStatus = "Rejected"
            });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            AccountStatus = user.AccountStatus,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            AccountStatus = user.AccountStatus,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!string.IsNullOrWhiteSpace(request.Name)) user.Name = request.Name;
        if (request.Bio != null) user.Bio = request.Bio;
        if (!string.IsNullOrWhiteSpace(request.AvatarUrl)) user.AvatarUrl = request.AvatarUrl;

        await _context.SaveChangesAsync();

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            AccountStatus = user.AccountStatus,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserProfileDto>>> GetAllUsers([FromQuery] string? status)
    {
        var query = _context.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(u => u.AccountStatus.ToLower() == status.ToLower());
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserProfileDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                AccountStatus = u.AccountStatus,
                Bio = u.Bio,
                AvatarUrl = u.AvatarUrl,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPatch("users/{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (user.Role == "Admin")
        {
            return BadRequest(new { message = "Cannot modify status of Admin account." });
        }

        user.AccountStatus = request.Status; // "Approved" or "Rejected"
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User registration status updated to {user.AccountStatus}.", accountStatus = user.AccountStatus });
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (user.Role == "Admin")
        {
            return BadRequest(new { message = "Cannot delete Admin account." });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "User removed successfully." });
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
