using TaskerApi.Models.Entities;

namespace TaskerApi.Services.Interfaces;

public interface IUserService
{
    Task<UserEntity> GetOrCreateByWindowsIdentityAsync(string windowsIdentityName, CancellationToken cancellationToken);
}