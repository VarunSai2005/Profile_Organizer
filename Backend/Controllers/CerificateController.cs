using System.Collections.Immutable;
using System.Runtime.ConstrainedExecution;
using Backend.Data;
using Backend.DTOs.Student;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Backend.Controllers;

[ApiController]
[Route("api4/[controller]")]

public class CertificateController : ControllerBase
{
    private readonly ApplicationDbContext cccxt;
    public CertificateController(ApplicationDbContext cccxt)
    {
        this.cccxt = cccxt;
    }

    [HttpPost("add")]
    public async Task<IActionResult> addCert(string rn)
    {
        if (string.IsNullOrWhiteSpace(rn)) return BadRequest("Empty fields");
        var st = await cccxt.FindAsync<Certificate>(rn);
        if (st != null) return Conflict("Certificate already exists");
        var cert = new Certificate { RollNumber = rn };
        cccxt.Add(cert);
        await cccxt.SaveChangesAsync();
        return Created("Added successfully", cert);
    }

    [HttpPut("addOne")]
    public async Task<IActionResult> addOneCert(IFormFile file, string rn, string? desc)
    {
        if (file == null || file.Length == 0) return BadRequest("Empty file.");
        var st = await cccxt.FindAsync<Certificate>(rn);
        if (st == null)
        {
            st = new Certificate { RollNumber = rn };
            cccxt.Add(st);
        }
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var cert = new Attachment
        {
            Description = desc ?? file.FileName,
            File = ms.ToArray(),
            ContentType = file.ContentType
        };
        st.Certificates.Add(cert);
        await cccxt.SaveChangesAsync();
        return Ok("Added");
    }

    [HttpPut("update")]
    public async Task<IActionResult> update(IFormFile file, string rn, string desc)
    {
        if (file == null || file.Length == 0) return BadRequest("Empty File");
        var st = await cccxt.Set<Certificate>()
                            .Include(c => c.Certificates)
                            .FirstOrDefaultAsync(c => c.RollNumber == rn);
        if (st == null) return NotFound();
        var target = st.Certificates.FirstOrDefault(d => d.Description == desc);
        if (target == null) return NotFound("Attachment with this description is not found.");
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        target.File = ms.ToArray();
        target.ContentType = file.ContentType;
        await cccxt.SaveChangesAsync();
        return Ok("successfully updated");
    }

    [HttpDelete("deleteOne")]
    public async Task<IActionResult> deleteOneRecord(string rn, string desc)
    {
        if(string.IsNullOrWhiteSpace(rn)|| string.IsNullOrWhiteSpace(desc)) 
            return BadRequest("Empty Rollnumber");
        var st = await cccxt.Set<Certificate>()
                            .Include(c => c.Certificates)
                            .FirstOrDefaultAsync(c => c.RollNumber == rn);
        if(st == null) return NotFound();
        var target = st.Certificates.FirstOrDefault(d => d.Description == desc);
        if (target == null) return NotFound("Attachment with this description is not found.");
        cccxt.Remove(target);
        await cccxt.SaveChangesAsync();
        return Ok("Successfully deleted");
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> deleteRecord(string rn)
    {
        if(string.IsNullOrWhiteSpace(rn)) return BadRequest("Empty Rollnumber");
        var st = await cccxt.Set<Certificate>()
                            .Include(c => c.Certificates)
                            .FirstOrDefaultAsync(c => c.RollNumber == rn);
        if (st == null) return NotFound("No record found.");
        cccxt.Remove(st);
        await cccxt.SaveChangesAsync();
        return Ok("Successfully deleted.");
    }

    [HttpGet("get/{id:int}")]
    public async Task<IActionResult> getCert(int id)
    {
        var cert = await cccxt.FindAsync<Attachment>(id);
        if (cert?.File == null) return NotFound();

        return File(cert.File, "application/pdf", cert.Description);
    }
}