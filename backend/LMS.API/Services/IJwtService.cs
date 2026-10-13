using LMS.API.Models;

namespace LMS.API.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}
