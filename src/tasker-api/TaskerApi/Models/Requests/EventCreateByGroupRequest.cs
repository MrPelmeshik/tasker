using TaskerApi.Models.Requests.Base;

namespace TaskerApi.Models.Requests;

public class EventCreateByGroupRequest : EventCreateBaseRequest
{
    public Guid GroupId { get; set; }
}