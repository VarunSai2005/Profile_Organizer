using System.ComponentModel.DataAnnotations;
namespace Backend.Models;
public class Student
{
    [Key]
    public string RollNumber {get; set;} = string.Empty;
    public string Name {get; set;} = string.Empty;
    public string Email {get; set;} = string.Empty;
    public string Mobile {get; set;} = string.Empty;
    public byte[]? Pfp {get; set;}
}