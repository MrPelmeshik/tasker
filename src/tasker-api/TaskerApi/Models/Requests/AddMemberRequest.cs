namespace TaskerApi.Models.Requests;

public class AddMemberRequest
{
    public Guid UserId { get; set; }
    public string Role { get; set; } = string.Empty;
}
