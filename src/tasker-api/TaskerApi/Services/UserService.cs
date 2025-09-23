using TaskerApi.Interfaces.Core;
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
}