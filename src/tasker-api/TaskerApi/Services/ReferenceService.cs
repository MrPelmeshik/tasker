using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;

namespace TaskerApi.Services;

public class ReferenceService : IReferenceService
{
    private readonly IReferenceProvider _referenceProvider;

    public ReferenceService(IReferenceProvider referenceProvider)
    {
        _referenceProvider = referenceProvider;
    }

    public async Task<IEnumerable<TaskStatusRefEntity>> GetTaskStatusesAsync(CancellationToken cancellationToken = default)
    {
        return await _referenceProvider.GetTaskStatusesAsync(cancellationToken);
    }

    public async Task<IEnumerable<VisibilityRefEntity>> GetVisibilityLevelsAsync(CancellationToken cancellationToken = default)
    {
        return await _referenceProvider.GetVisibilityLevelsAsync(cancellationToken);
    }

    public async Task<IEnumerable<ActionVerbEntity>> GetActionVerbsAsync(CancellationToken cancellationToken = default)
    {
        return await _referenceProvider.GetActionVerbsAsync(cancellationToken);
    }

    public async Task<IEnumerable<RelationKindRefEntity>> GetRelationKindsAsync(CancellationToken cancellationToken = default)
    {
        return await _referenceProvider.GetRelationKindsAsync(cancellationToken);
    }
}
