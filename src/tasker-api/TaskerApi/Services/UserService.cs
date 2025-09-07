using TaskerApi.Core.Interfaces;
using TaskerApi.Models.Entities;
using TaskerApi.Providers.Interfaces;
using TaskerApi.Services.Interfaces;

namespace TaskerApi.Services.Implementations;

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
            await userProvider.UpdateAsync(uow.Connection, existing, cancellationToken, uow.Transaction, setDefaultValues: true);
            await uow.CommitAsync(cancellationToken);
            return existing;
        }

        var user = new UserEntity
        {
            Id = Guid.NewGuid(),
            Name = windowsIdentityName
        };

        user.Id = await userProvider.CreateAsync(uow.Connection, user, cancellationToken, uow.Transaction, setDefaultValues: true);
        await uow.CommitAsync(cancellationToken);
        return user;
    }
}