using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class Admin
{
    [Key]
    public int Id {get; set;}
    public string Username {get; set;} = string.Empty;
    public string Password {get; set;} = string.Empty;
}