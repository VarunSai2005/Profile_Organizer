using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api5/[controller]")]

public class AchievementController : ControllerBase
{
    private readonly ApplicationDbContext accxt;
    public AchievementController( ApplicationDbContext accxt)
    {
        this.accxt = accxt;
    }

    [HttpPost("add")]
    public async Task<IActionResult> addCert(string rn)
    {
        if (string.IsNullOrWhiteSpace(rn)) return BadRequest("Empty fields");
        var st = await accxt.FindAsync<Achievement>(rn);
        if (st != null) return Conflict("Certificate already exists");
        var achievement = new Achievement { RollNumber = rn, Achievements = new List<Attachment>() };
        accxt.Add(achievement);
        await accxt.SaveChangesAsync();
        return Created("Added successfully", achievement);
    }

    [HttpPut("addOne")]
    public async Task<IActionResult> addOne(string rn, IFormFile file, string? desc)
    {
        if (file == null || file.Length == 0 || string.IsNullOrWhiteSpace(rn))
            return BadRequest("Empty file.");
        var st = await accxt.FindAsync<Achievement>(rn);
        if (st == null)
        {
            st = new Achievement { RollNumber = rn, Achievements = new List<Attachment>() };
            accxt.Add(st);
        }
        st.Achievements ??= new List<Attachment>();
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var cert = new Attachment
        {
            Description = desc ?? file.FileName,
            File = ms.ToArray(),
            ContentType = file.ContentType
        };
        st.Achievements.Add(cert);
        await accxt.SaveChangesAsync();
        return Ok("successfully added.");
    }

    [HttpPut("update")]
    public async Task<IActionResult> update(IFormFile file, string rn, string desc)
    {
        if (file == null || file.Length == 0) return BadRequest("Empty File");
        var st = await accxt.Set<Achievement>()
                            .Include(c => c.Achievements)
                            .FirstOrDefaultAsync(c => c.RollNumber == rn);
        if (st == null) return NotFound();
        var target = st.Achievements.FirstOrDefault(d => d.Description == desc);
        if (target == null) return NotFound("Attachment with this description is not found.");
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        target.File = ms.ToArray();
        target.ContentType = file.ContentType;
        await accxt.SaveChangesAsync();
        return Ok("successfully updated");
    }

    [HttpDelete("deleteOne")]
    public async Task<IActionResult> deleteOneRecord(string rn, string desc)
    {
        if(string.IsNullOrWhiteSpace(rn)|| string.IsNullOrWhiteSpace(desc)) 
            return BadRequest("Empty Rollnumber");
        var st = await accxt.Set<Achievement>()
                            .Include(c => c.Achievements)
                            .FirstOrDefaultAsync(c => c.RollNumber == rn);
        if(st == null) return NotFound();
        var target = st.Achievements.FirstOrDefault(d => d.Description == desc);
        if (target == null) return NotFound("Attachment with this description is not found.");
        accxt.Remove(target);
        await accxt.SaveChangesAsync();
        return Ok("Successfully deleted");
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> deleteRecord(string rn)
    {
        if(string.IsNullOrWhiteSpace(rn)) return BadRequest("Empty Rollnumber");
        var st = await accxt.Set<Achievement>()
                            .Include(c => c.Achievements)
                            .FirstOrDefaultAsync(c => c.RollNumber == rn);
        if (st == null) return NotFound("No record found.");
        accxt.Remove(st);
        await accxt.SaveChangesAsync();
        return Ok("Successfully deleted.");
    }

    [HttpGet("get/{id:int}")]
    public async Task<IActionResult> getCert(int id)
    {
        var cert = await accxt.FindAsync<Attachment>(id);
        if (cert?.File == null) return NotFound();

        return File(cert.File, "application/pdf", cert.Description);
    }

}
