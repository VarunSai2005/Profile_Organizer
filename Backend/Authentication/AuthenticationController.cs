using Backend.Authentication.Contracts;
using Backend.Data;
using Backend.DTOs.Student;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Authentication;

[ApiController]
public class AuthenticationController(
    ApplicationDbContext context,
    JwtTokenService tokenService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("/api2/Admin/add")]
    public async Task<IActionResult> RegisterInitialAdmin(Admin admin)
    {
        if (await context.Admins.AnyAsync())
            return Forbid();

        if (string.IsNullOrWhiteSpace(admin.Username) || string.IsNullOrWhiteSpace(admin.Password))
            return BadRequest("Invalid Username or Password");

        admin.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
        context.Admins.Add(admin);
        await context.SaveChangesAsync();

        return Ok(new { admin.Id, admin.Username });
    }

    [AllowAnonymous]
    [HttpPost("/api2/Admin/login")]
    public async Task<IActionResult> LoginAdmin(LoginRequest request)
    {
        var admin = await context.Admins.SingleOrDefaultAsync(a => a.Username == request.Username);
        if (admin is null)
            return Unauthorized("Invalid username or password.");

        var passwordIsHashed = admin.Password.StartsWith("$2", StringComparison.Ordinal);
        var passwordIsValid = passwordIsHashed
            ? BCrypt.Net.BCrypt.Verify(request.Password, admin.Password)
            : request.Password == admin.Password;
        if (!passwordIsValid)
            return Unauthorized("Invalid username or password.");

        if (!passwordIsHashed)
        {
            admin.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            await context.SaveChangesAsync();
        }

        return Ok(new LoginResponse(tokenService.CreateToken(admin.Username, "Admin"), "Admin", admin.Username));
    }

    [AllowAnonymous]
    [HttpPost("/api1/Student/login")]
    public async Task<IActionResult> LoginStudent(LoginRequest request)
    {
        var student = await context.Students.FindAsync(request.Username);
        if (student is null || string.IsNullOrWhiteSpace(student.PasswordHash) ||
            !BCrypt.Net.BCrypt.Verify(request.Password, student.PasswordHash))
        {
            return Unauthorized("Invalid roll number or password.");
        }

        return Ok(new LoginResponse(
            tokenService.CreateToken(student.RollNumber, "Student"),
            "Student",
            student.RollNumber));
    }

    [AllowAnonymous]
    [HttpPost("/api1/Student/register")]
    public async Task<IActionResult> RegisterStudent([FromForm] StudentDatadto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.RollNumber) || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("All fields are required.");

        var existing = await context.Students.FindAsync(dto.RollNumber);
        if (existing != null)
            return Conflict("A student with this roll number already exists.");

        byte[]? pfpBytes = null;
        if (dto.Pfp != null && dto.Pfp.Length > 0)
        {
            using var ms = new MemoryStream();
            await dto.Pfp.CopyToAsync(ms);
            pfpBytes = ms.ToArray();
        }

        var student = new Student
        {
            RollNumber = dto.RollNumber,
            Name = dto.Name,
            Email = dto.Email,
            Mobile = dto.Mobile,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Pfp = pfpBytes
        };

        context.Students.Add(student);
        await context.SaveChangesAsync();

        return Ok(new LoginResponse(
            tokenService.CreateToken(student.RollNumber, "Student"),
            "Student",
            student.RollNumber));
    }
}
