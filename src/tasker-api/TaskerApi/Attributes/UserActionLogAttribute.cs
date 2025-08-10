using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;

namespace TaskerApi.Attributes;

/// <summary>
/// Атрибут для логирования действий пользователя с возможностью указать описание действия.
/// Использует внутренний фильтр, поддерживающий DI и пользовательский текст.
/// </summary>
public class UserActionLogAttribute : TypeFilterAttribute
{
    /// <summary>
    /// Создаёт атрибут логирования и принимает человекочитаемое описание действия.
    /// </summary>
    /// <param name="actionDescription">Описание действия, выполняемого эндпоинтом.</param>
    public UserActionLogAttribute(string actionDescription) : base(typeof(UserActionLogFilter))
    {
        Arguments = new object[] { actionDescription };
    }

    /// <summary>
    /// Внутренний фильтр, выполняющий запись лога действия пользователя в БД.
    /// </summary>
    private sealed class UserActionLogFilter : IAsyncActionFilter
    {
        private readonly ILogger<UserActionLogFilter> _logger;
        private readonly IUserActionLogProvider _logProvider;
        private readonly IUnitOfWorkFactory _uowFactory;
        private readonly string _actionDescription;

        public UserActionLogFilter(ILogger<UserActionLogFilter> logger, IUserActionLogProvider logProvider, IUnitOfWorkFactory uowFactory, string actionDescription)
        {
            _logger = logger;
            _logProvider = logProvider;
            _uowFactory = uowFactory;
            _actionDescription = actionDescription;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
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
                    ["action_description"] = _actionDescription
                };
                foreach (var kv in context.RouteData.Values)
                    requestParams[$"route:{kv.Key}"] = kv.Value;
                foreach (var kv in request.Query)
                    requestParams[$"query:{kv.Key}"] = kv.Value.ToString();

                string? errorMessage = null;
                if (executedContext.Exception is Exception ex)
                {
                    errorMessage = ex.Message;
                }

                var entity = new UserActionLogEntity
                {
                    UserId = userId,
                    IpAddress = ip,
                    UserAgent = userAgent,
                    HttpMethod = httpMethod,
                    Endpoint = endpoint,
                    RequestParams = JsonSerializer.Serialize(requestParams),
                    ResponseCode = response?.StatusCode,
                    ErrorMessage = errorMessage,
                    Created = DateTimeOffset.UtcNow
                };

                // Лог пишем в собственной короткой транзакции, чтобы не зависеть от бизнес-логики
                await using var uow = await _uowFactory.CreateAsync(httpContext.RequestAborted, useTransaction: true);
                await _logProvider.InsertAsync(entity, httpContext.RequestAborted, uow.Connection);
                await uow.CommitAsync(httpContext.RequestAborted);
            }
            catch (Exception logEx)
            {
                _logger.LogError(logEx, "Не удалось записать лог действия пользователя");
            }
        }
    }
}


