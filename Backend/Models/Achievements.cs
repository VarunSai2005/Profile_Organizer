using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class Achievement
{
    [Key]
    public string RollNumber { get; set; } = string.Empty;

    public List<Attachment> Achievements { get; set; } = new();
}