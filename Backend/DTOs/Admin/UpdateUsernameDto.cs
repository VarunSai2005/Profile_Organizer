namespace Backend.DTOs.Admin;
public record UpdateUsernameDto(
    int Id,
    string Username ,
    string NewUsername
);