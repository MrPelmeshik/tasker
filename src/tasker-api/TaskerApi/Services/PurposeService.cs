using TaskerApi.Constants;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Requests;
using TaskerApi.Models.Responses;
using TaskerApi.Services.Base;
using TaskerApi.Services.Mapping;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для работы с целями с использованием Entity Framework.
/// </summary>
public class PurposeService(
    ILogger<PurposeService> logger,
    ICurrentUserService currentUser,
    IPurposeRepository purposeRepository,
    TaskerDbContext context)
    : BaseService(logger, currentUser), IPurposeService
{
    public async Task<IEnumerable<PurposeResponse>> GetAsync(CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var purposes = await purposeRepository.GetAllAsync(cancellationToken);
            return purposes.Select(p => p.ToPurposeResponse());
        }, nameof(GetAsync));
    }

    public async Task<PurposeResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var purpose = await purposeRepository.GetByIdAsync(id, cancellationToken);
            return purpose?.ToPurposeResponse();
        }, nameof(GetByIdAsync), new { id });
    }

    public async Task<PurposeResponse> CreateAsync(PurposeCreateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var purpose = request.ToPurposeEntity(currentUser.UserId);
            var createdPurpose = await purposeRepository.CreateAsync(purpose, cancellationToken);
            return createdPurpose.ToPurposeResponse();
        }, nameof(CreateAsync), request);
    }

    public async Task<PurposeResponse> UpdateAsync(Guid id, PurposeUpdateRequest request, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var purpose = await purposeRepository.GetByIdAsync(id, cancellationToken);
            if (purpose == null)
                throw new InvalidOperationException(ErrorMessages.PurposeNotFound);

            request.UpdatePurposeEntity(purpose);
            await purposeRepository.UpdateAsync(purpose, cancellationToken);
            return purpose.ToPurposeResponse();
        }, nameof(UpdateAsync), new { id });
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await ExecuteWithErrorHandling(async () =>
        {
            var purpose = await purposeRepository.GetByIdAsync(id, cancellationToken);
            if (purpose == null)
                throw new InvalidOperationException(ErrorMessages.PurposeNotFound);

            await purposeRepository.DeleteAsync(id, cancellationToken);
        }, nameof(DeleteAsync), new { id });
    }

    public async Task<IEnumerable<PurposeResponse>> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken)
    {
        return await ExecuteWithErrorHandling(async () =>
        {
            var purposes = await purposeRepository.GetByOwnerIdAsync(ownerId, cancellationToken);
            return purposes.Select(p => p.ToPurposeResponse());
        }, nameof(GetByOwnerIdAsync), new { ownerId });
    }
}
