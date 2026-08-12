namespace Backend.DTOs.Student;
using Backend.Models;
public record AttachmentDto(
    string RollNumber,
    IFormFile ? Attachment 
);