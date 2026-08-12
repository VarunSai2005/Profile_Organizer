using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Microsoft.Identity.Client;
using Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure;

namespace Backend.Controllers;

[ApiController]
[Route("api3/[controller]")]

public class CodeProfileController : ControllerBase
{
    private readonly ApplicationDbContext cpcxt;

    public CodeProfileController( ApplicationDbContext cpcxt )
    {
        this.cpcxt = cpcxt;
    }

    [HttpPost("add")]
    public async Task<IActionResult> addCodingProfile(CodingProfile cp)
    {
        var st = cpcxt.Find<CodingProfile>(cp.RollNumber);
        if ( st != null )
        { 
            cpcxt.Add(cp);
            await cpcxt.SaveChangesAsync();
            return Created("Added.", cp);
        }
        return BadRequest("Account already exists.");
    }

    [HttpPut("update")]
    public async Task<IActionResult> updateCodeProfile(CodingProfile cp, string rn)
    {
        var st = cpcxt.Find<CodingProfile>(rn);
        if ( st == null ||
             string.IsNullOrWhiteSpace(cp.CodeForces) ||
             string.IsNullOrWhiteSpace(cp.LeetCode) || 
             string.IsNullOrWhiteSpace(cp.GFG) ||
             string.IsNullOrWhiteSpace(cp.CSES))
        {
          return BadRequest("Invalid fields");
        }
        st.CodeForces = cp.CodeForces;
        st.LeetCode = cp.LeetCode;
        st.GFG = cp.GFG;
        st.CSES = cp.CSES; 
        await cpcxt.SaveChangesAsync();
        return Ok("Record updated.");
    }

    [HttpDelete("delete")]
    public IActionResult deleteCodeProfile(string rn)
    {
        var st = cpcxt.Find<CodingProfile>(rn);
        if ( st == null ) return BadRequest("No record found");
        cpcxt.Remove(st);
        cpcxt.SaveChanges();
        return Ok("Sucessfully deleted.");
    } 

    [HttpGet("get")]
    public IActionResult getINfo(string rn)
    {
        var st = cpcxt.Find<CodingProfile>(rn);
        if (st == null) return BadRequest("No record found");
        return Ok(st);
    }

}
