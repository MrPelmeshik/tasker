using TaskerApi.Models.Entities;

namespace TaskerApi.Interfaces.Services;

public interface IReferenceService
{
    Task<IEnumerable<TaskStatusRefEntity>> GetTaskStatusesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<VisibilityRefEntity>> GetVisibilityLevelsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ActionVerbEntity>> GetActionVerbsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<RelationKindRefEntity>> GetRelationKindsAsync(CancellationToken cancellationToken = default);
}
