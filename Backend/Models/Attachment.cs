using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class Attachment
{
    [Key]
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public byte[]? File { get; set; }
}