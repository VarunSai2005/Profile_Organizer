using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs.Admin;
using Backend.DTOs.Auth;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[ApiController]
[Route("api2/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext context;
    private readonly TokenService tokenService;
    public AdminController(ApplicationDbContext context, TokenService tokenService)
    {
        this.context = context;
        this.tokenService = tokenService;
    }

    [AllowAnonymous]
    [HttpPost("add")]
    public IActionResult addAdmin(Admin admin)
    {
        if (context.Admins.Any())
            return Forbid();
        if (string.IsNullOrWhiteSpace(admin.Username) || string.IsNullOrWhiteSpace(admin.Password))
            return BadRequest("Invalid Username or Password");
        admin.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
        context.Admins.Add(admin);
        context.SaveChanges();
        return Ok(new { admin.Id, admin.Username });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
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

    [Authorize(Roles = "Admin")]
    [HttpPut("username")]
    public IActionResult UpdateUsername(UpdateUsernameDto request)
    {
        var admin = context.Admins.Find(request.Id);
        if (admin == null)
            return NotFound("Admin not found");
        var usernameExists = context.Admins.Any(a => a.Username == request.NewUsername);
        if (usernameExists)
            return BadRequest("Username already exists");
        admin.Username = request.NewUsername;
        context.SaveChanges();
        return Ok("Username updated");
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("password")]
    public IActionResult UpdatePassword(Admin admin)
    {
        var adm = context.Admins.Find(admin.Id);
        if (adm == null)
            return NotFound($"No record found with id: {admin.Id}");
        adm.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
        context.SaveChanges();
        return Ok("Password updated.");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("del")]
    public IActionResult deleteAdmin(Admin admin)
    {
        context.Remove(admin);
        context.SaveChanges();
        return Ok("Deleted the record.");
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("user")]
    public IActionResult getAllAdmins(string username)
    {
        var adm = context.Admins.SingleOrDefault(a => a.Username == username);
        if (adm == null)
            return NotFound("Admin not found");
        return Ok(new { adm.Id, adm.Username });
    }
}
