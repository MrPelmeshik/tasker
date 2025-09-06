using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IUserService
{
    Task<UserEntity> GetOrCreateByWindowsIdentityAsync(string windowsIdentityName, CancellationToken cancellationToken);
}