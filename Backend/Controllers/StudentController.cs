using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
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
        stcxt.SaveChanges();
        return Created("Added", student);
         
    } 


    [HttpGet]
    public IActionResult getAllStudents()
    {
        return Ok();
    }
    

}