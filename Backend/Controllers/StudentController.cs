using Backend.Data;
using Backend.DTOs.Student;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using Backend.DTOs.Auth;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api1/[controller]")]

public class StudentController : ControllerBase
{
    private readonly ApplicationDbContext stcxt;
    private readonly TokenService tokenService;
    public StudentController (ApplicationDbContext stcxt, TokenService tokenService)
    {
        this.stcxt = stcxt;
        this.tokenService = tokenService;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("add")]
    public async Task<IActionResult> addStudent([FromForm] StudentDatadto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.RollNumber) || string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest();
        var st = stcxt.Find<Student>(dto.RollNumber);
        if ( st != null ) return BadRequest();
        byte[] ? pfpBytes = null;
        if (dto.Pfp != null)
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
        stcxt.Add(student);
        await stcxt.SaveChangesAsync();
        return Created("Added", student);  
    } 

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var student = await stcxt.Students.FindAsync(request.Username);
        if (student is null || string.IsNullOrWhiteSpace(student.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, student.PasswordHash))
            return Unauthorized("Invalid roll number or password.");

        return Ok(new LoginResponse(tokenService.CreateToken(student.RollNumber, "Student"), "Student", student.RollNumber));
    }

    [Authorize(Roles = "Admin,Student")]
    [HttpPut("update")]
    public async Task<IActionResult> UpdateStudent([FromForm] StudentDatadto dto, string rn)
    {
        if (dto == null || 
            string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Mobile))
            return BadRequest();
        if (User.IsInRole("Student") && User.FindFirstValue(ClaimTypes.Name) != rn)
            return Forbid();
        var st = stcxt.Find<Student>(rn);
        if (st == null) return NotFound($"No student found with roll number: {rn}");
        st.Name = dto.Name;
        st.Email = dto.Email;
        st.Mobile = dto.Mobile;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            st.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        if (dto.Pfp != null && dto.Pfp.Length > 0)
        {
            using var ms = new MemoryStream();
            await dto.Pfp.CopyToAsync(ms);
            st.Pfp = ms.ToArray();
        }
        await stcxt.SaveChangesAsync();
        return Ok("Updated the record.");
    } 

    [Authorize(Roles = "Admin")]
    [HttpDelete("del")]
    public IActionResult delStudent(string rn)
    {
        var st = stcxt.Find<Student>(rn);
        if ( st != null )
        {
            stcxt.Remove(st);
            stcxt.SaveChanges();
            return Ok("Account successfully delete.");
        }   
        return NotFound($"No student found with roll number: {rn}");
    }

    [Authorize(Roles = "Admin,Student")]
    [HttpGet("retrieve")]
    public IActionResult getAllStudents(string rn)
    {
        if (User.IsInRole("Student") && User.FindFirstValue(ClaimTypes.Name) != rn)
            return Forbid();
        var st = stcxt.Find<Student>(rn);
        if ( st != null) return Ok($"Found : {st.ToString()}");
        return NotFound($"No student found with roll number: {rn}");
    }

    
    
}
