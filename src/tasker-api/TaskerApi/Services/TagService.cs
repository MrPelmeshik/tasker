using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Models.Entities;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Services;

public class TagService : BaseService<TagEntity, Guid>, ITagService
{
    private readonly ITagProvider _tagProvider;

    public TagService(ILogger logger, IUnitOfWorkFactory unitOfWorkFactory, ITagProvider tagProvider) 
        : base(logger, unitOfWorkFactory, tagProvider)
    {
        _tagProvider = tagProvider;
    }

    public async Task<IEnumerable<TagEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<TagEntity>();
    }

    public async Task<IEnumerable<TagEntity>> GetByActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<TagEntity>();
    }

    public async Task<TagEntity?> GetBySlugAsync(Guid areaId, string slug, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем null, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return null;
    }

    public async Task<IEnumerable<TagEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<TagEntity>();
    }
}
