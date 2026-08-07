using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class CodingProfile
{
    [Key]
    public string RollNumber { get; set; } = string.Empty;
    public string CodeForces {get; set;} = string.Empty;
    public string LeetCode {get; set;} = string.Empty;
    public string CSES {get; set;} = string.Empty;
    public string GFG {get; set;} = string.Empty;
}