using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Models.Entities;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Services;

public class AreaMembershipService : BaseService<AreaMembershipEntity, Guid>, IAreaMembershipService
{
    private readonly IAreaMembershipProvider _areaMembershipProvider;

    public AreaMembershipService(ILogger logger, IUnitOfWorkFactory unitOfWorkFactory, IAreaMembershipProvider areaMembershipProvider) 
        : base(logger, unitOfWorkFactory, areaMembershipProvider)
    {
        _areaMembershipProvider = areaMembershipProvider;
    }

    public async Task<IEnumerable<AreaMembershipEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<AreaMembershipEntity>();
    }

    public async Task<IEnumerable<AreaMembershipEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<AreaMembershipEntity>();
    }

    public async Task<Guid> AddMemberAsync(Guid areaId, Guid userId, string role, CancellationToken cancellationToken = default)
    {
        var membership = new AreaMembershipEntity
        {
            Id = Guid.NewGuid(),
            AreaId = areaId,
            UserId = userId,
            Role = role,
            Joined = DateTimeOffset.UtcNow,
            IsActive = true,
            Created = DateTimeOffset.UtcNow,
            Updated = DateTimeOffset.UtcNow
        };

        await CreateAsync(membership, cancellationToken);
        return membership.Id;
    }

    public async Task RemoveMemberAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно ничего не делаем, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        var membership = await GetByAreaAndUserAsync(areaId, userId, cancellationToken);
        if (membership != null)
        {
            await DeleteAsync(membership.Id, cancellationToken);
        }
    }

    public async Task ChangeRoleAsync(Guid areaId, Guid userId, string newRole, CancellationToken cancellationToken = default)
    {
        // Временно ничего не делаем, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        var membership = await GetByAreaAndUserAsync(areaId, userId, cancellationToken);
        if (membership != null)
        {
            membership.Role = newRole;
            membership.Updated = DateTimeOffset.UtcNow;
            await UpdateAsync(membership, cancellationToken);
        }
    }

    public async Task<bool> IsMemberAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем false, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        var membership = await GetByAreaAndUserAsync(areaId, userId, cancellationToken);
        return membership != null;
    }

    public async Task<string?> GetRoleAsync(Guid areaId, Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем null, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        var membership = await GetByAreaAndUserAsync(areaId, userId, cancellationToken);
        return membership?.Role;
    }

    private async Task<AreaMembershipEntity?> GetByAreaAndUserAsync(Guid areaId, Guid userId, CancellationToken cancellationToken)
    {
        // Временно возвращаем null, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return null;
    }
}
