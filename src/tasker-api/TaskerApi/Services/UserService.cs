using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

public class UserService(
    ILogger<UserService> logger, 
    IUnitOfWorkFactory uowFactory, 
    IUserProvider userProvider)
    : IUserService
{
    public async Task<UserEntity> GetOrCreateByWindowsIdentityAsync(string windowsIdentityName, CancellationToken cancellationToken)
    {
        await using var uow = await uowFactory.CreateAsync(cancellationToken, useTransaction: true);

        var existing = await userProvider.GetByNameAsync(uow.Connection, windowsIdentityName, cancellationToken, uow.Transaction);
        if (existing != null)
        {
            // Update last seen timestamp if desired
            existing.UpdatedAt = DateTimeOffset.Now;
            await userProvider.UpdateAsync(uow.Connection, existing, cancellationToken, uow.Transaction, setDefaultValues: true);
            await uow.CommitAsync(cancellationToken);
            return existing;
        }

        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = windowsIdentityName,
            CreatedAt = DateTimeOffset.Now,
            UpdatedAt = DateTimeOffset.Now,
            IsActive = true
        };

        user.Id = await userProvider.CreateAsync(uow.Connection, user, cancellationToken, uow.Transaction, setDefaultValues: true);
        await uow.CommitAsync(cancellationToken);
        return user;
    }
}