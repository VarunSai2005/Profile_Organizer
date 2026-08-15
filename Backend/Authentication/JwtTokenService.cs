using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Authentication;

public class JwtTokenService(IConfiguration configuration)
{
    public string CreateToken(string username, string role)
    {
        var jwt = configuration.GetSection("Jwt");
        var key = jwt["Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
        var issuer = jwt["Issuer"] ?? throw new InvalidOperationException("JWT issuer is not configured.");
        var audience = jwt["Audience"] ?? throw new InvalidOperationException("JWT audience is not configured.");

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims:
            [
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role)
            ],
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
