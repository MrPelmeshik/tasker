namespace TaskerApi.Models.Responses;

public class UserResponse
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset Updated { get; set; }
}

public class UserDetailedResponse : UserResponse
{
    public int AreasCount { get; set; }
    public int TasksCount { get; set; }
    public int ActionsCount { get; set; }
}
