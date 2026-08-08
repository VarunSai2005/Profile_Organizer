using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs.Admin;

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

    [HttpPost("add")]
    public IActionResult addAdmin(Admin admin)
    {
        if (admin.Username == null || admin.Password == null)
            return BadRequest("Invalid Username or Password");
        context.Admins.Add(admin);
        context.SaveChanges();
        return Ok(admin);
    }

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

    [HttpPut("password")]
    public IActionResult UpdatePassword(Admin admin)
    {
        var adm = context.Admins.Find(admin.Id);
        if (adm == null)
            return NotFound($"No record found with id: {admin.Id}");
        adm.Password = admin.Password;
        context.SaveChanges();
        return Ok("Password updated.");
    }

    [HttpDelete("del")]
    public IActionResult deleteAdmin(Admin admin)
    {
        context.Remove(admin);
        context.SaveChanges();
        return Ok("Deleted the record.");
    }

    [HttpGet("user")]
    public IActionResult getAllAdmins(string username)
    {
        var adm = context.Admins.Find(username);
        if (adm == null)
            return NotFound("Admin not found");
        return Ok();
    }
}