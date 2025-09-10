namespace TaskerApi.Interfaces.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Username { get; }
    string Email { get; }
    bool IsAuthenticated { get; }
}


