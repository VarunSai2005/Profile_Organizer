using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Xml;
using Backend.Data;
using Backend.DTOs.Student;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api1/[controller]")]

public class StudentController : ControllerBase
{
    private readonly ApplicationDbContext stcxt;
    public StudentController ( ApplicationDbContext stcxt)
    {
        this.stcxt = stcxt;
    }

    [HttpPost("add")]
    public async Task<IActionResult> addStudent([FromForm] StudentDatadto dto)
    {
        if (dto == null || dto.Name == null || dto.Email == null || dto.Mobile == null)
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
         Pfp = pfpBytes
        };
        stcxt.Add(student);
        await stcxt.SaveChangesAsync();
        return Created("Added", student);  
    } 

    [HttpPut("update")]
    public async Task<IActionResult> UpdateStudent([FromForm] StudentDatadto dto, string rn)
    {
        if (dto == null || 
            string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Mobile))
            return BadRequest();
        var st = stcxt.Find<Student>(rn);
        if (st == null) return NotFound($"No student found with roll number: {rn}");
        st.Name = dto.Name;
        st.Email = dto.Email;
        st.Mobile = dto.Mobile;
        if (dto.Pfp != null && dto.Pfp.Length > 0)
        {
            using var ms = new MemoryStream();
            await dto.Pfp.CopyToAsync(ms);
            st.Pfp = ms.ToArray();
        }
        await stcxt.SaveChangesAsync();
        return Ok("Updated the record.");
    } 

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

    [HttpGet("retrieve")]
    public IActionResult getAllStudents(string rn)
    {
        var st = stcxt.Find<Student>(rn);
        if ( st != null) return Ok($"Found : {st.ToString()}");
        return NotFound($"No student found with roll number: {rn}");
    }
    
}