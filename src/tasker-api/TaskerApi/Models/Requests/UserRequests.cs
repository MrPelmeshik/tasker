namespace TaskerApi.Models.Requests;

public class CreateUserRequest
{
    public string? Idp { get; set; }
    public string SsoSubject { get; set; } = string.Empty;
    public string? Realm { get; set; }
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? PictureUrl { get; set; }
}

public class UpdateUserRequest
{
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? PictureUrl { get; set; }
}
