using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using TaskerApi.Interfaces.Core;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;

namespace TaskerApi.Attributes;

/// <summary>
/// Атрибут для логирования действий пользователя с возможностью указать описание действия.
/// Использует внутренний фильтр, поддерживающий DI и пользовательский текст.
/// </summary>
public class UserLogAttribute : TypeFilterAttribute
{
    /// <summary>
    /// Создаёт атрибут логирования и принимает человекочитаемое описание действия.
    /// </summary>
    /// <param name="actionDescription">Описание действия, выполняемого эндпоинтом.</param>
    public UserLogAttribute(string actionDescription) : base(typeof(UserActionLogFilter))
    {
        Arguments = [actionDescription];
    }

    /// <summary>
    /// Внутренний фильтр, выполняющий запись лога действия пользователя в БД.
    /// </summary>
    private sealed class UserActionLogFilter(
        ILogger<UserActionLogFilter> logger,
        IUserLogProvider logProvider,
        IUnitOfWorkFactory uowFactory,
        string actionDescription)
        : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            logger.LogInformation("Записываем лог действия пользователя: {actionDescription}", actionDescription);
            var executedContext = await next();

            try
            {
                var httpContext = context.HttpContext;
                var request = httpContext.Request;
                var response = httpContext.Response;

                Guid? userId = null;

                var ip = httpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = request.Headers.UserAgent.ToString();
                var httpMethod = request.Method;
                var endpoint = request.Path.ToString();

                var requestParams = new Dictionary<string, object?>
                {
                    ["action_description"] = actionDescription
                };
                foreach (var kv in context.RouteData.Values)
                    requestParams[$"route:{kv.Key}"] = kv.Value;
                foreach (var kv in request.Query)
                    requestParams[$"query:{kv.Key}"] = kv.Value.ToString();

                string? errorMessage = null;
                if (executedContext.Exception != null)
                {
                    errorMessage = executedContext.Exception.Message;
                }

                var entity = new UserLogEntity
                {
                    UserId = userId,
                    IpAddress = ip,
                    UserAgent = userAgent,
                    HttpMethod = httpMethod,
                    Endpoint = endpoint,
                    RequestParams = JsonSerializer.Serialize(requestParams),
                    ResponseCode = response?.StatusCode,
                    ErrorMessage = errorMessage,
                    CreatedAt = DateTimeOffset.UtcNow
                };

                await using var uow = await uowFactory.CreateAsync(httpContext.RequestAborted, useTransaction: true);
                await logProvider.CreateAsync(uow.Connection,entity, httpContext.RequestAborted, uow.Transaction, setDefaultValues: true);
                await uow.CommitAsync(httpContext.RequestAborted);
            }
            catch (Exception logEx)
            {
                logger.LogError(logEx, "Не удалось записать лог действия пользователя");
            }
        }
    }
}


