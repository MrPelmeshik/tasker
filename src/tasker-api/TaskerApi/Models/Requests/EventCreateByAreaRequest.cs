using TaskerApi.Models.Requests.Base;

namespace TaskerApi.Models.Requests;

public class EventCreateByAreaRequest : EventCreateBaseRequest
{
    public Guid AreaId { get; set; }
}