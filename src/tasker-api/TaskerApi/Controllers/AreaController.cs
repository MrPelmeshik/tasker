using Microsoft.AspNetCore.Mvc;
using TaskerApi.Attributes;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;

namespace TaskerApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class AreaController(IAreaService service) : ControllerBase
{
    [HttpGet]
    [UserLog("Получение списка областей")]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    { 
        try 
        {
            return Ok(await service.GetAsync(cancellationToken));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost]
    [UserLog("Создание области")]
    public async Task<IActionResult> Create([FromBody]AreaCreateRequest item, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await service.CreateAsync(item, cancellationToken)); 
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}