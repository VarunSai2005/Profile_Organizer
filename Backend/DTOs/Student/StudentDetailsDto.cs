namespace Backend.DTOs.Student;

public record AttachmentSummaryDto(int Id, string Description, string FileName, string? ContentType);

public record CodingProfileDto(string CodeForces, string LeetCode, string CSES, string GFG);

public record StudentSummaryDto(string RollNumber, string Name, string Email, string Mobile);

public record StudentDetailsDto(
    string RollNumber,
    string Name,
    string Email,
    string Mobile,
    CodingProfileDto? CodingProfile,
    IReadOnlyList<AttachmentSummaryDto> Achievements,
    IReadOnlyList<AttachmentSummaryDto> Certificates);
