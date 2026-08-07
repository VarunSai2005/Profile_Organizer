using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class Admin
{
    [Key]
    public string Username {get; set;} = string.Empty;
    public string Password {get; set;} = string.Empty;
}