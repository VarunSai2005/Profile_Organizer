using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api1/[controller]")]

public class StudentController : ControllerBase
{
    [HttpGet]
    public IActionResult getAllStudents()
    {
        return Ok();
    }
    

}