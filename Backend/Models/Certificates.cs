using System.ComponentModel.DataAnnotations;
using System.Net.Mail;

namespace Backend.Models;
public class Certificate
{
    [Key]
    public string RollNumber { get; set; } = string.Empty;
    public List<Attachment> Certificates { get; set; } = new();
}