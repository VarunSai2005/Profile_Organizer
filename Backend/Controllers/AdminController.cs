using Microsoft.AspNetCore.Mvc;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api2/[controller]")]

public class AdminController : ControllerBase
{
    [HttpPost("Register")]
    public IActionResult signUp(Admin admin)
    {
        return Ok($"Registered as an admin with username {admin.Username}");
    }
    
    [HttpPost("Login")] 
    public IActionResult login(Admin admin)
    {
        return Ok($"Logged in as admin : {admin.Username}");
    }

    [HttpGet]
    public IActionResult getAllStudents()
    {
        return Ok();
    }
}