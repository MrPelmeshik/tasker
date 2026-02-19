using Microsoft.Extensions.Logging;
using Moq;
using TaskerApi.Constants;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services;

namespace TaskerApiTests.Services;

/// <summary>
/// Тесты TaskScheduleService (бизнес-логика расписаний).
/// </summary>
public class TaskScheduleServiceTests
{
    private Mock<ILogger<TaskScheduleService>> _logger = null!;
    private Mock<ICurrentUserService> _currentUser = null!;
    private Mock<ITaskScheduleRepository> _scheduleRepo = null!;
    private Mock<ITaskRepository> _taskRepo = null!;
    private Mock<IAreaRepository> _areaRepo = null!;
    private Mock<IFolderRepository> _folderRepo = null!;
    private Mock<IAreaRoleService> _areaRoleService = null!;
    private Mock<IEntityEventLogger> _eventLogger = null!;
    private TaskScheduleService _sut = null!;

    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid AreaId = Guid.NewGuid();

    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger<TaskScheduleService>>();
        _currentUser = new Mock<ICurrentUserService>();
        _scheduleRepo = new Mock<ITaskScheduleRepository>();
        _taskRepo = new Mock<ITaskRepository>();
        _areaRepo = new Mock<IAreaRepository>();
        _folderRepo = new Mock<IFolderRepository>();
        _areaRoleService = new Mock<IAreaRoleService>();
        _eventLogger = new Mock<IEntityEventLogger>();

        _currentUser.Setup(x => x.UserId).Returns(UserId);
        _currentUser.Setup(x => x.HasAccessToArea(It.IsAny<Guid>())).Returns(true);
        _areaRoleService.Setup(x => x.CanEditTaskAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _eventLogger.Setup(x => x.LogAsync(
            It.IsAny<TaskerApi.Models.Common.EntityType>(),
            It.IsAny<Guid>(),
            It.IsAny<TaskerApi.Models.Common.EventType>(),
            It.IsAny<string>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _sut = new TaskScheduleService(
            _logger.Object,
            _currentUser.Object,
            _scheduleRepo.Object,
            _taskRepo.Object,
            _areaRepo.Object,
            _folderRepo.Object,
            _areaRoleService.Object,
            _eventLogger.Object,
            null!); // context — не используется в тестируемых методах
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private static TaskEntity MakeTask(Guid? folderId = null) => new()
    {
        Id = Guid.NewGuid(),
        Title = "Task",
        AreaId = AreaId,
        FolderId = folderId,
        Status = TaskerApi.Models.Common.TaskStatus.New,
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    private static TaskScheduleEntity MakeSchedule(Guid taskId) => new()
    {
        Id = Guid.NewGuid(),
        TaskId = taskId,
        StartAt = DateTimeOffset.UtcNow.AddHours(1),
        EndAt = DateTimeOffset.UtcNow.AddHours(2),
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    private static AreaEntity MakeArea() => new()
    {
        Id = AreaId,
        Title = "Area",
        Color = "#aabbcc",
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    // ── CreateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task CreateAsync_returns_response_on_success()
    {
        var task = MakeTask();
        var request = new TaskScheduleCreateRequest
        {
            TaskId = task.Id,
            StartAt = DateTimeOffset.UtcNow.AddHours(1),
            EndAt = DateTimeOffset.UtcNow.AddHours(2)
        };
        var created = MakeSchedule(task.Id);

        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _scheduleRepo.Setup(r => r.CreateAsync(It.IsAny<TaskScheduleEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(created);
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());
        _folderRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);

        var response = await _sut.CreateAsync(request, CancellationToken.None);

        Assert.That(response, Is.Not.Null);
        Assert.That(response.TaskId, Is.EqualTo(task.Id));
        Assert.That(response.AreaColor, Is.EqualTo("#aabbcc"));
    }

    [Test]
    public void CreateAsync_throws_when_task_not_found()
    {
        _taskRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskEntity?)null);
        var request = new TaskScheduleCreateRequest { TaskId = Guid.NewGuid(), StartAt = DateTimeOffset.UtcNow, EndAt = DateTimeOffset.UtcNow.AddHours(1) };

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.TaskNotFound));
    }

    [Test]
    public void CreateAsync_throws_when_end_before_start()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        var request = new TaskScheduleCreateRequest
        {
            TaskId = task.Id,
            StartAt = DateTimeOffset.UtcNow.AddHours(2),
            EndAt = DateTimeOffset.UtcNow.AddHours(1)  // end before start
        };

        Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateAsync(request, CancellationToken.None));
    }

    [Test]
    public void CreateAsync_throws_when_no_access_to_area()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);
        var request = new TaskScheduleCreateRequest { TaskId = task.Id, StartAt = DateTimeOffset.UtcNow, EndAt = DateTimeOffset.UtcNow.AddHours(1) };

        Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CreateAsync(request, CancellationToken.None));
    }

    [Test]
    public void CreateAsync_throws_when_no_edit_permission()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _areaRoleService.Setup(x => x.CanEditTaskAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var request = new TaskScheduleCreateRequest { TaskId = task.Id, StartAt = DateTimeOffset.UtcNow, EndAt = DateTimeOffset.UtcNow.AddHours(1) };

        Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CreateAsync(request, CancellationToken.None));
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task UpdateAsync_returns_updated_response()
    {
        var task = MakeTask();
        var schedule = MakeSchedule(task.Id);
        var request = new TaskScheduleUpdateRequest
        {
            StartAt = DateTimeOffset.UtcNow.AddHours(3),
            EndAt = DateTimeOffset.UtcNow.AddHours(4)
        };
        var updatedSchedule = new TaskScheduleEntity
        {
            Id = schedule.Id,
            TaskId = task.Id,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            OwnerUserId = UserId,
            CreatedAt = schedule.CreatedAt,
            UpdatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };

        _scheduleRepo.Setup(r => r.GetByIdAsync(schedule.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(schedule);
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _scheduleRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskScheduleEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(updatedSchedule);
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());

        var response = await _sut.UpdateAsync(schedule.Id, request, CancellationToken.None);

        Assert.That(response.StartAt, Is.EqualTo(request.StartAt));
        Assert.That(response.EndAt, Is.EqualTo(request.EndAt));
    }

    [Test]
    public void UpdateAsync_throws_when_schedule_not_found()
    {
        _scheduleRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskScheduleEntity?)null);
        var request = new TaskScheduleUpdateRequest { StartAt = DateTimeOffset.UtcNow, EndAt = DateTimeOffset.UtcNow.AddHours(1) };

        Assert.ThrowsAsync<InvalidOperationException>(() => _sut.UpdateAsync(Guid.NewGuid(), request, CancellationToken.None));
    }

    [Test]
    public void UpdateAsync_throws_when_end_before_start()
    {
        var task = MakeTask();
        var schedule = MakeSchedule(task.Id);
        _scheduleRepo.Setup(r => r.GetByIdAsync(schedule.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(schedule);
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        var request = new TaskScheduleUpdateRequest
        {
            StartAt = DateTimeOffset.UtcNow.AddHours(5),
            EndAt = DateTimeOffset.UtcNow.AddHours(3)
        };

        Assert.ThrowsAsync<ArgumentException>(() => _sut.UpdateAsync(schedule.Id, request, CancellationToken.None));
    }

    // ── DeleteAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task DeleteAsync_calls_repository_delete()
    {
        var task = MakeTask();
        var schedule = MakeSchedule(task.Id);
        _scheduleRepo.Setup(r => r.GetByIdAsync(schedule.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(schedule);
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _scheduleRepo.Setup(r => r.DeleteAsync(schedule.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(1);

        await _sut.DeleteAsync(schedule.Id, CancellationToken.None);

        _scheduleRepo.Verify(r => r.DeleteAsync(schedule.Id, It.IsAny<CancellationToken>(), false), Times.Once);
    }

    [Test]
    public void DeleteAsync_throws_when_schedule_not_found()
    {
        _scheduleRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskScheduleEntity?)null);
        Assert.ThrowsAsync<InvalidOperationException>(() => _sut.DeleteAsync(Guid.NewGuid(), CancellationToken.None));
    }

    [Test]
    public void DeleteAsync_throws_when_no_edit_permission()
    {
        var task = MakeTask();
        var schedule = MakeSchedule(task.Id);
        _scheduleRepo.Setup(r => r.GetByIdAsync(schedule.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(schedule);
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _areaRoleService.Setup(x => x.CanEditTaskAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteAsync(schedule.Id, CancellationToken.None));
    }

    // ── GetByTaskIdAsync ────────────────────────────────────────────────────────

    [Test]
    public async Task GetByTaskIdAsync_returns_schedules_for_task()
    {
        var task = MakeTask();
        var schedules = new List<TaskScheduleEntity> { MakeSchedule(task.Id), MakeSchedule(task.Id) };
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _scheduleRepo.Setup(r => r.GetByTaskIdAsync(task.Id, It.IsAny<CancellationToken>())).ReturnsAsync(schedules);
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());

        var result = await _sut.GetByTaskIdAsync(task.Id, CancellationToken.None);

        Assert.That(result, Has.Count.EqualTo(2));
    }

    [Test]
    public void GetByTaskIdAsync_throws_when_task_not_found()
    {
        _taskRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskEntity?)null);
        Assert.ThrowsAsync<InvalidOperationException>(() => _sut.GetByTaskIdAsync(Guid.NewGuid(), CancellationToken.None));
    }

    // ── GetByWeekAsync ──────────────────────────────────────────────────────────

    [Test]
    public void GetByWeekAsync_throws_for_invalid_date_format()
    {
        Assert.ThrowsAsync<ArgumentException>(() => _sut.GetByWeekAsync("not-a-date", CancellationToken.None));
    }

    [Test]
    public async Task GetByWeekAsync_returns_empty_when_no_schedules()
    {
        _scheduleRepo.Setup(r => r.GetByDateRangeAsync(
            It.IsAny<DateTimeOffset>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskScheduleEntity>());
        _areaRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<AreaEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<AreaEntity>());

        var result = await _sut.GetByWeekAsync("2024-01-15", CancellationToken.None);

        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task GetByWeekAsync_filters_inaccessible_areas()
    {
        var task = MakeTask();
        var schedule = MakeSchedule(task.Id);
        schedule.Task = task;

        _scheduleRepo.Setup(r => r.GetByDateRangeAsync(
            It.IsAny<DateTimeOffset>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskScheduleEntity> { schedule });
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);
        _areaRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<AreaEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<AreaEntity>());

        var result = await _sut.GetByWeekAsync("2024-01-15", CancellationToken.None);

        Assert.That(result, Is.Empty);
    }

    [Test]
    public async Task GetByWeekAsync_returns_accessible_schedules_with_area_color()
    {
        var task = MakeTask();
        var schedule = MakeSchedule(task.Id);
        schedule.Task = task;
        var area = MakeArea();

        _scheduleRepo.Setup(r => r.GetByDateRangeAsync(
            It.IsAny<DateTimeOffset>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskScheduleEntity> { schedule });
        _areaRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<AreaEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<AreaEntity> { area });
        _folderRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<FolderEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<FolderEntity>());

        var result = await _sut.GetByWeekAsync("2024-01-15", CancellationToken.None);

        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].AreaColor, Is.EqualTo(area.Color));
    }

    // ── Color hierarchy ─────────────────────────────────────────────────────────

    [Test]
    public async Task GetByTaskIdAsync_uses_folder_color_when_set()
    {
        var folderId = Guid.NewGuid();
        var task = MakeTask(folderId: folderId);
        var schedule = MakeSchedule(task.Id);
        var area = MakeArea();
        var folder = new FolderEntity { Id = folderId, Title = "F", AreaId = AreaId, Color = "#folder", IsActive = true };

        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _scheduleRepo.Setup(r => r.GetByTaskIdAsync(task.Id, It.IsAny<CancellationToken>())).ReturnsAsync(new List<TaskScheduleEntity> { schedule });
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);

        var result = await _sut.GetByTaskIdAsync(task.Id, CancellationToken.None);

        Assert.That(result[0].FolderColor, Is.EqualTo("#folder"));
    }

    [Test]
    public async Task GetByTaskIdAsync_folder_color_is_null_when_folder_has_no_color()
    {
        var folderId = Guid.NewGuid();
        var task = MakeTask(folderId: folderId);
        var schedule = MakeSchedule(task.Id);
        var area = MakeArea();
        var folder = new FolderEntity { Id = folderId, Title = "F", AreaId = AreaId, Color = null, IsActive = true };

        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _scheduleRepo.Setup(r => r.GetByTaskIdAsync(task.Id, It.IsAny<CancellationToken>())).ReturnsAsync(new List<TaskScheduleEntity> { schedule });
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);

        var result = await _sut.GetByTaskIdAsync(task.Id, CancellationToken.None);

        Assert.That(result[0].FolderColor, Is.Null);
    }

    [Test]
    public async Task GetByWeekAsync_uses_folder_color_from_hierarchy()
    {
        var parentFolderId = Guid.NewGuid();
        var childFolderId = Guid.NewGuid();
        var task = MakeTask(folderId: childFolderId);
        var schedule = MakeSchedule(task.Id);
        schedule.Task = task;
        var area = MakeArea();

        var parentFolder = new FolderEntity { Id = parentFolderId, Title = "Parent", AreaId = AreaId, Color = "#parent-color", IsActive = true };
        var childFolder = new FolderEntity { Id = childFolderId, Title = "Child", AreaId = AreaId, ParentFolderId = parentFolderId, Color = null, IsActive = true };

        _scheduleRepo.Setup(r => r.GetByDateRangeAsync(
            It.IsAny<DateTimeOffset>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskScheduleEntity> { schedule });
        _areaRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<AreaEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<AreaEntity> { area });
        _folderRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<FolderEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<FolderEntity> { parentFolder, childFolder });

        var result = await _sut.GetByWeekAsync("2024-01-15", CancellationToken.None);

        Assert.That(result, Has.Count.EqualTo(1));
        // childFolder.Color == null, ParentFolderId == parentFolderId, parentFolder.Color == "#parent-color"
        Assert.That(result[0].FolderColor, Is.EqualTo("#parent-color"));
    }
}
