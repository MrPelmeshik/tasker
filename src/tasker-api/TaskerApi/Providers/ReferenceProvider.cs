using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;

namespace TaskerApi.Providers;

public class ReferenceProvider : IReferenceProvider
{
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;

    public ReferenceProvider(IUnitOfWorkFactory unitOfWorkFactory)
    {
        _unitOfWorkFactory = unitOfWorkFactory;
    }

    public async Task<IEnumerable<TaskStatusRefEntity>> GetTaskStatusesAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, name, description, is_active
            FROM task_status_ref 
            WHERE is_active = true
            ORDER BY id";
        
        return await connection.QueryAsync<TaskStatusRefEntity>(sql);
    }

    public async Task<IEnumerable<VisibilityRefEntity>> GetVisibilityLevelsAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, name, description, is_active
            FROM visibility_ref 
            WHERE is_active = true
            ORDER BY id";
        
        return await connection.QueryAsync<VisibilityRefEntity>(sql);
    }

    public async Task<IEnumerable<ActionVerbEntity>> GetActionVerbsAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, verb, description, is_active
            FROM action_verbs 
            WHERE is_active = true
            ORDER BY verb";
        
        return await connection.QueryAsync<ActionVerbEntity>(sql);
    }

    public async Task<IEnumerable<RelationKindRefEntity>> GetRelationKindsAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        var sql = @"
            SELECT id, kind, description, is_active
            FROM relation_kind_ref 
            WHERE is_active = true
            ORDER BY kind";
        
        return await connection.QueryAsync<RelationKindRefEntity>(sql);
    }
}
