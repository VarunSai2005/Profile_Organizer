using System.Collections.Immutable;
using System.Runtime.ConstrainedExecution;
using Backend.Data;
using Backend.DTOs.Student;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
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
            FileName = file.FileName,
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
        target.FileName = file.FileName;
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

        return InlineFile(cert);
    }

    [HttpGet("download/{id:int}")]
    public async Task<IActionResult> downloadCert(int id)
    {
        var cert = await cccxt.FindAsync<Attachment>(id);
        if (cert?.File == null) return NotFound();

        return File(cert.File, GetContentType(cert), GetFileName(cert), enableRangeProcessing: true);
    }

    private IActionResult InlineFile(Attachment attachment)
    {
        Response.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline")
        {
            FileNameStar = GetFileName(attachment)
        }.ToString();
        return File(attachment.File!, GetContentType(attachment), enableRangeProcessing: true);
    }

    private static string GetContentType(Attachment attachment)
    {
        if (!string.IsNullOrWhiteSpace(attachment.ContentType) && attachment.ContentType != "application/octet-stream")
            return attachment.ContentType;

        var bytes = attachment.File;
        if (bytes is null) return "application/octet-stream";
        if (bytes.Length >= 4 && bytes[0] == 0x25 && bytes[1] == 0x50 && bytes[2] == 0x44 && bytes[3] == 0x46) return "application/pdf";
        if (bytes.Length >= 8 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) return "image/png";
        if (bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF) return "image/jpeg";
        if (bytes.Length >= 6 && bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46) return "image/gif";
        if (bytes.Length >= 12 && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50) return "image/webp";
        return "application/octet-stream";
    }

    private static string GetFileName(Attachment attachment)
    {
        var fileName = string.IsNullOrWhiteSpace(attachment.FileName) ? attachment.Description : attachment.FileName;
        if (Path.HasExtension(fileName)) return fileName;

        return GetContentType(attachment) switch
        {
            "application/pdf" => $"{fileName}.pdf",
            "image/jpeg" => $"{fileName}.jpg",
            "image/png" => $"{fileName}.png",
            "image/gif" => $"{fileName}.gif",
            "image/webp" => $"{fileName}.webp",
            _ => fileName
        };
    }
}
