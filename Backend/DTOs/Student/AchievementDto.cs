namespace Backend.DTOs.Student;
using Backend.Models;
public record AchievementDto(
    string RollNumber,
    IFormFile ? Attachment 
);