using Backend.Data;
using Backend.DTOs.Student;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api1/[controller]")]

public class StudentController : ControllerBase
{
    private readonly ApplicationDbContext stcxt;
    public StudentController(ApplicationDbContext stcxt)
    {
        this.stcxt = stcxt;
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
    public async Task<IActionResult> GetStudent(string rn)
    {
        if (User.IsInRole("Student") && User.FindFirstValue(ClaimTypes.Name) != rn)
            return Forbid();

        var student = await BuildStudentDetails(rn);
        return student is null
            ? NotFound($"No student found with roll number: {rn}")
            : Ok(student);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllStudents()
    {
        var students = await stcxt.Students.AsNoTracking()
            .OrderBy(student => student.Name)
            .Select(student => new StudentSummaryDto(student.RollNumber, student.Name, student.Email, student.Mobile))
            .ToListAsync();
        return Ok(students);
    }

    private async Task<StudentDetailsDto?> BuildStudentDetails(string rollNumber)
    {
        var student = await stcxt.Students.AsNoTracking().FirstOrDefaultAsync(item => item.RollNumber == rollNumber);
        if (student is null) return null;

        var codingProfile = await stcxt.CodingProfiles.AsNoTracking().FirstOrDefaultAsync(item => item.RollNumber == rollNumber);
        var achievement = await stcxt.Achievements.AsNoTracking().Include(item => item.Achievements).FirstOrDefaultAsync(item => item.RollNumber == rollNumber);
        var certificate = await stcxt.Certificates.AsNoTracking().Include(item => item.Certificates).FirstOrDefaultAsync(item => item.RollNumber == rollNumber);

        return new StudentDetailsDto(
            student.RollNumber, student.Name, student.Email, student.Mobile,
            codingProfile is null ? null : new CodingProfileDto(codingProfile.CodeForces, codingProfile.LeetCode, codingProfile.CSES, codingProfile.GFG),
            (achievement?.Achievements ?? []).Select(file => new AttachmentSummaryDto(file.Id, file.Description, file.FileName, file.ContentType)).ToList(),
            (certificate?.Certificates ?? []).Select(file => new AttachmentSummaryDto(file.Id, file.Description, file.FileName, file.ContentType)).ToList());
    }
}
