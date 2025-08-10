using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Models.Entities;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Services;

public class RuleService : BaseService<RuleEntity, Guid>, IRuleService
{
    private readonly IRuleProvider _ruleProvider;

    public RuleService(ILogger logger, IUnitOfWorkFactory unitOfWorkFactory, IRuleProvider ruleProvider) 
        : base(logger, unitOfWorkFactory, ruleProvider)
    {
        _ruleProvider = ruleProvider;
    }

    public async Task<IEnumerable<RuleEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<RuleEntity>();
    }

    public async Task<IEnumerable<RuleEntity>> GetEnabledAsync(CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<RuleEntity>();
    }

    public async Task<IEnumerable<RuleEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<RuleEntity>();
    }

    public async Task EnableAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rule = await GetByIdAsync(id, cancellationToken);
        if (rule != null)
        {
            rule.IsEnabled = true;
            await UpdateAsync(rule, cancellationToken);
        }
    }

    public async Task DisableAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rule = await GetByIdAsync(id, cancellationToken);
        if (rule != null)
        {
            rule.IsEnabled = false;
            await UpdateAsync(rule, cancellationToken);
        }
    }
}
