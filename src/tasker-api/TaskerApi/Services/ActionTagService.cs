using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;
using System.Data;
using Dapper;

namespace TaskerApi.Services;

/// <summary>
/// Сервис для управления связями между действиями и тегами.
/// </summary>
public class ActionTagService : IActionTagService
{
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;
    private readonly IActionProvider _actionProvider;
    private readonly ITagProvider _tagProvider;

    public ActionTagService(
        IUnitOfWorkFactory unitOfWorkFactory,
        IActionProvider actionProvider,
        ITagProvider tagProvider)
    {
        _unitOfWorkFactory = unitOfWorkFactory;
        _actionProvider = actionProvider;
        _tagProvider = tagProvider;
    }

    /// <summary>
    /// Добавить тег к действию.
    /// </summary>
    public async Task AddTagToActionAsync(Guid actionId, Guid tagId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            INSERT INTO action_tag (id, action_id, tag_id, created, is_active)
            VALUES (@Id, @ActionId, @TagId, @Created, @IsActive)
            ON CONFLICT (action_id, tag_id) DO UPDATE SET
                is_active = @IsActive,
                deactivated = NULL";

        var link = new ActionTagEntity
        {
            Id = Guid.NewGuid(),
            ActionId = actionId,
            TagId = tagId,
            Created = DateTimeOffset.UtcNow,
            IsActive = true
        };

        await connection.ExecuteAsync(sql, link);
    }

    /// <summary>
    /// Убрать тег с действия.
    /// </summary>
    public async Task RemoveTagFromActionAsync(Guid actionId, Guid tagId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            UPDATE action_tag 
            SET is_active = false, deactivated = @Deactivated
            WHERE action_id = @ActionId AND tag_id = @TagId AND is_active = true";

        await connection.ExecuteAsync(sql, new 
        { 
            ActionId = actionId, 
            TagId = tagId, 
            Deactivated = DateTimeOffset.UtcNow 
        });
    }

    /// <summary>
    /// Получить все теги действия.
    /// </summary>
    public async Task<IEnumerable<TagEntity>> GetTagsForActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT t.id, t.area_id, t.slug, t.label, t.is_active, t.deactivated, t.created, t.updated
            FROM tags t
            INNER JOIN action_tag at ON t.id = at.tag_id AND at.is_active
            WHERE at.action_id = @ActionId AND t.is_active = true
            ORDER BY t.label";

        return await connection.QueryAsync<TagEntity>(sql, new { ActionId = actionId });
    }

    /// <summary>
    /// Получить все действия с определенным тегом.
    /// </summary>
    public async Task<IEnumerable<ActionEntity>> GetActionsByTagAsync(Guid tagId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT a.id, a.area_id, a.user_id, a.verb_id, a.summary, a.note, a.started, 
                   a.ended, a.duration_sec, a.visibility_id, a.context, a.is_active, 
                   a.deactivated, a.created, a.updated
            FROM actions a
            INNER JOIN action_tag at ON a.id = at.action_id AND at.is_active
            WHERE at.tag_id = @TagId AND a.is_active = true
            ORDER BY a.started DESC";

        return await connection.QueryAsync<ActionEntity>(sql, new { TagId = tagId });
    }

    /// <summary>
    /// Получить статистику по тегу.
    /// </summary>
    public async Task<TagStatistics> GetTagStatisticsAsync(Guid tagId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT 
                COUNT(DISTINCT at.action_id) as actions_count,
                COALESCE(SUM(a.duration_sec), 0) as total_duration_sec,
                COUNT(DISTINCT a.user_id) as unique_users_count
            FROM action_tag at
            INNER JOIN actions a ON at.action_id = a.id AND at.is_active AND a.is_active
            WHERE at.tag_id = @TagId";

        var result = await connection.QueryFirstOrDefaultAsync(sql, new { TagId = tagId });
        
        return new TagStatistics
        {
            TagId = tagId,
            ActionsCount = result?.actions_count ?? 0,
            TotalDurationSec = result?.total_duration_sec ?? 0,
            UniqueUsersCount = result?.unique_users_count ?? 0
        };
    }

    /// <summary>
    /// Получить популярные теги в области.
    /// </summary>
    public async Task<IEnumerable<TagUsage>> GetPopularTagsInAreaAsync(Guid areaId, int limit = 10, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);

        const string sql = @"
            SELECT 
                t.id, t.slug, t.label,
                COUNT(DISTINCT at.action_id) as usage_count
            FROM tags t
            INNER JOIN action_tag at ON t.id = at.tag_id AND at.is_active
            INNER JOIN actions a ON at.action_id = a.id AND at.is_active AND a.is_active
            WHERE t.area_id = @AreaId AND t.is_active = true
            GROUP BY t.id, t.slug, t.label
            ORDER BY usage_count DESC
            LIMIT @Limit";

        var results = await connection.QueryAsync(sql, new { AreaId = areaId, Limit = limit });
        
        return results.Select(r => new TagUsage
        {
            TagId = r.id,
            Slug = r.slug,
            Label = r.label,
            UsageCount = r.usage_count
        });
    }
}

/// <summary>
/// Статистика по тегу.
/// </summary>
public class TagStatistics
{
    public Guid TagId { get; set; }
    public int ActionsCount { get; set; }
    public int TotalDurationSec { get; set; }
    public int UniqueUsersCount { get; set; }
}

/// <summary>
/// Использование тега.
/// </summary>
public class TagUsage
{
    public Guid TagId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? Label { get; set; }
    public int UsageCount { get; set; }
}
