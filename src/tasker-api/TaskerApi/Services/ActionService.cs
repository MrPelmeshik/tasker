using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Models.Entities;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Services;

public class ActionService : BaseService<ActionEntity, Guid>, IActionService
{
    private readonly IActionProvider _actionProvider;

    public ActionService(ILogger logger, IUnitOfWorkFactory unitOfWorkFactory, IActionProvider actionProvider) 
        : base(logger, unitOfWorkFactory, actionProvider)
    {
        _actionProvider = actionProvider;
    }

    public async Task<IEnumerable<ActionEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<ActionEntity>();
    }

    public async Task<IEnumerable<ActionEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<ActionEntity>();
    }

    public async Task<IEnumerable<ActionEntity>> GetByTimeRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<ActionEntity>();
    }

    public async Task<IEnumerable<ActionEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<ActionEntity>();
    }

    public async Task StartActionAsync(Guid areaId, Guid userId, int? verbId, string? summary, string? note, int visibilityId, CancellationToken cancellationToken = default)
    {
        var action = new ActionEntity
        {
            Id = Guid.NewGuid(),
            AreaId = areaId,
            UserId = userId,
            VerbId = verbId,
            Summary = summary,
            Note = note,
            Started = DateTimeOffset.UtcNow,
            VisibilityId = visibilityId,
            Context = "{}",
            IsActive = true,
            Created = DateTimeOffset.UtcNow,
            Updated = DateTimeOffset.UtcNow
        };

        await CreateAsync(action, cancellationToken);
    }

    public async Task FinishActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        var action = await GetByIdAsync(actionId, cancellationToken);
        if (action != null)
        {
            action.Ended = DateTimeOffset.UtcNow;
            action.DurationSec = (int)(action.Ended.Value - action.Started).TotalSeconds;
            action.Updated = DateTimeOffset.UtcNow;

            await UpdateAsync(action, cancellationToken);
        }
    }

    public async Task UpdateActionAsync(Guid actionId, string? summary, string? note, int? verbId, int? visibilityId, CancellationToken cancellationToken = default)
    {
        var action = await GetByIdAsync(actionId, cancellationToken);
        if (action != null)
        {
            if (summary != null) action.Summary = summary;
            if (note != null) action.Note = note;
            if (verbId.HasValue) action.VerbId = verbId.Value;
            if (visibilityId.HasValue) action.VisibilityId = visibilityId.Value;
            action.Updated = DateTimeOffset.UtcNow;

            await UpdateAsync(action, cancellationToken);
        }
    }
}
