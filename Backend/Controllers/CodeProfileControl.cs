using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;

namespace Backend.Controllers;

public class CodeProfileController : ControllerBase
{
    private readonly ApplicationDbContext cpcxt;

    public CodeProfileController( ApplicationDbContext cpcxt)
    {
        this.cpcxt = cpcxt;
    }

    

}
