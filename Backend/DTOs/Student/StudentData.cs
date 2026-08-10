namespace Backend.DTOs.Student;
public record StudentDatadto(
    string RollNumber,
    string Name,
    string Email,
    string Mobile,
    IFormFile ? Pfp
);