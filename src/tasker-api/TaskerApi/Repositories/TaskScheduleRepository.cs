using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Models.Entities;

namespace TaskerApi.Repositories;

/// <summary>
/// Репозиторий для работы с расписаниями задач
/// </summary>
public class TaskScheduleRepository : BaseRepository<TaskScheduleEntity, Guid>, ITaskScheduleRepository
{
    private readonly TaskerDbContext _context;

    public TaskScheduleRepository(TaskerDbContext context, ILogger<TaskScheduleRepository> logger)
        : base(context, logger)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TaskScheduleEntity>> GetByTaskIdAsync(Guid taskId, CancellationToken ct = default)
    {
        return await _context.TaskSchedules
            .Where(s => s.TaskId == taskId)
            .OrderBy(s => s.StartAt)
            .ToListAsync(ct);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TaskScheduleEntity>> GetByDateRangeAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken ct = default)
    {
        return await _context.TaskSchedules
            .Include(s => s.Task)
            .Where(s => s.StartAt < to && s.EndAt > from)
            .OrderBy(s => s.StartAt)
            .ToListAsync(ct);
    }
}
