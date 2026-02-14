using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Constants;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с пользователями с использованием Entity Framework.
/// </summary>
public class UserService(
    ILogger<UserService> logger,
    IUserRepository userRepository)
    : BaseService(logger, null), IUserService
{
    /// <inheritdoc />
    public async Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var users = await userRepository.GetAllAsync(cancellationToken);
            return users.Select(u => u.ToUserResponse());
        }, nameof(GetAllAsync));
    }

    /// <inheritdoc />
    public async Task<UserResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var user = await userRepository.GetByIdAsync(id, cancellationToken);
            return user?.ToUserResponse();
        }, nameof(GetByIdAsync), new { id });
    }

    /// <inheritdoc />
    public async Task<UserResponse?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var user = await userRepository.GetByNameAsync(name, cancellationToken);
            return user?.ToUserResponse();
        }, nameof(GetByNameAsync), new { name });
    }

    /// <inheritdoc />
    public async Task<UserResponse?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var user = await userRepository.GetByEmailAsync(email, cancellationToken);
            return user?.ToUserResponse();
        }, nameof(GetByEmailAsync), new { email });
    }

    /// <inheritdoc />
    public async Task<UserResponse> CreateAsync(UserCreateRequest request, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var existingByName = await userRepository.GetByNameAsync(request.Username.Trim(), cancellationToken);
            if (existingByName != null)
            {
                throw new InvalidOperationException(ErrorMessages.UserWithSameNameExists);
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var existingByEmail = await userRepository.GetByEmailAsync(request.Email.Trim(), cancellationToken);
                if (existingByEmail != null)
                {
                    throw new InvalidOperationException(ErrorMessages.UserWithSameEmailExists);
                }
            }

            var user = request.ToUserEntity();
            var createdUser = await userRepository.CreateAsync(user, cancellationToken);
            return createdUser.ToUserResponse();
        }, nameof(CreateAsync), request);
    }

    /// <inheritdoc />
    public async Task<UserResponse> UpdateAsync(Guid id, UserUpdateRequest request, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var user = await userRepository.GetByIdAsync(id, cancellationToken);
            if (user == null)
            {
                throw new InvalidOperationException(ErrorMessages.UserNotFound);
            }

            if (request.Username != null)
            {
                var existingByName = await userRepository.GetByNameAsync(request.Username.Trim(), cancellationToken);
                if (existingByName != null && existingByName.Id != id)
                {
                    throw new InvalidOperationException(ErrorMessages.UserWithSameNameExists);
                }
            }

            if (request.Email != null && !string.IsNullOrWhiteSpace(request.Email))
            {
                var existingByEmail = await userRepository.GetByEmailAsync(request.Email.Trim(), cancellationToken);
                if (existingByEmail != null && existingByEmail.Id != id)
                {
                    throw new InvalidOperationException(ErrorMessages.UserWithSameEmailExists);
                }
            }

            request.UpdateUserEntity(user);
            var updatedUser = await userRepository.UpdateAsync(user, cancellationToken);
            return updatedUser.ToUserResponse();
        }, nameof(UpdateAsync), new { id });
    }

    /// <inheritdoc />
    public async Task<int> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }

    /// <inheritdoc />
    public async Task<int> CountAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            return await userRepository.CountAsync(cancellationToken: cancellationToken);
        }, nameof(CountAsync));
    }
}
