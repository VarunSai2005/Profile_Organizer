using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[ApiController]
[Route("api2/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext context;
    public AdminController(ApplicationDbContext context)
    {
        this.context = context;
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
