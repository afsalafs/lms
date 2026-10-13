using System.ComponentModel.DataAnnotations;

namespace LMS.API.DTOs;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string Role { get; set; } = "Student"; // "Student" or "Instructor"

    public string? Bio { get; set; }
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AccountStatus { get; set; } = "Pending";
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AccountStatus { get; set; } = "Pending";
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UpdateUserStatusRequest
{
    [Required]
    public string Status { get; set; } = "Approved"; // Approved or Rejected
}
