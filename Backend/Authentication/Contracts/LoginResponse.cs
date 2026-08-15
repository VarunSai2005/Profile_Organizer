namespace Backend.Authentication.Contracts;

public record LoginResponse(string Token, string Role, string Username);
