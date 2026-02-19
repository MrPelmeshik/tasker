using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using TaskerApi.Constants;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApiTests.Services;

/// <summary>
/// Тесты TaskService (CRUD задач, доступ, валидация).
/// </summary>
public class TaskServiceTests
{
    private Mock<ILogger<TaskService>> _logger = null!;
    private Mock<ICurrentUserService> _currentUser = null!;
    private Mock<ITaskRepository> _taskRepo = null!;
    private Mock<IAreaRepository> _areaRepo = null!;
    private Mock<IFolderRepository> _folderRepo = null!;
    private Mock<IEventRepository> _eventRepo = null!;
    private Mock<IUserRepository> _userRepo = null!;
    private Mock<IEntityEventLogger> _eventLogger = null!;
    private Mock<IAreaRoleService> _areaRoleService = null!;
    private Mock<IRealtimeNotifier> _notifier = null!;
    private Mock<IOptions<TasksSettings>> _options = null!;
    private TaskService _sut = null!;

    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid AreaId = Guid.NewGuid();

    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger<TaskService>>();
        _currentUser = new Mock<ICurrentUserService>();
        _taskRepo = new Mock<ITaskRepository>();
        _areaRepo = new Mock<IAreaRepository>();
        _folderRepo = new Mock<IFolderRepository>();
        _eventRepo = new Mock<IEventRepository>();
        _userRepo = new Mock<IUserRepository>();
        _eventLogger = new Mock<IEntityEventLogger>();
        _areaRoleService = new Mock<IAreaRoleService>();
        _notifier = new Mock<IRealtimeNotifier>();
        _options = new Mock<IOptions<TasksSettings>>();

        _currentUser.Setup(x => x.UserId).Returns(UserId);
        _currentUser.Setup(x => x.HasAccessToArea(It.IsAny<Guid>())).Returns(true);
        _areaRoleService.Setup(x => x.CanEditTaskAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(true);

        _options.Setup(x => x.Value).Returns(new TasksSettings { MaxActivitiesPageSize = 100 });

        _eventLogger.Setup(x => x.LogAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<EventType>(),
            It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _notifier.Setup(x => x.NotifyEntityChangedAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid?>(),
            It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _sut = new TaskService(
            _logger.Object,
            _currentUser.Object,
            _taskRepo.Object,
            _areaRepo.Object,
            _folderRepo.Object,
            _eventRepo.Object,
            _userRepo.Object,
            _eventLogger.Object,
            _areaRoleService.Object,
            _notifier.Object,
            null!, // context — не используется в тестируемых методах
            _options.Object);
    }

    private static TaskEntity MakeTask(Guid? id = null, Guid? folderId = null, TaskStatus status = TaskStatus.New) => new()
    {
        Id = id ?? Guid.NewGuid(),
        Title = "Task",
        Description = "desc",
        AreaId = AreaId,
        FolderId = folderId,
        Status = status,
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    private static AreaEntity MakeArea() => new()
    {
        Id = AreaId,
        Title = "Area",
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    private static FolderEntity MakeFolder(Guid id) => new()
    {
        Id = id,
        Title = "Folder",
        AreaId = AreaId,
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    // ── GetAsync ────────────────────────────────────────────────────────────────

    [Test]
    public async Task GetAsync_returns_only_accessible_tasks()
    {
        var task = MakeTask();
        var otherAreaId = Guid.NewGuid();
        var otherTask = new TaskEntity { Id = Guid.NewGuid(), AreaId = otherAreaId, Title = "Other", IsActive = true };

        _taskRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<TaskEntity> { task, otherTask });
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(true);
        _currentUser.Setup(x => x.HasAccessToArea(otherAreaId)).Returns(false);

        var result = (await _sut.GetAsync(CancellationToken.None)).ToList();
        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].Id, Is.EqualTo(task.Id));
    }

    // ── GetByIdAsync ────────────────────────────────────────────────────────────

    [Test]
    public async Task GetByIdAsync_returns_task_with_owner_name()
    {
        var task = MakeTask();
        var user = new UserEntity { Id = UserId, Name = "alice", IsActive = true };

        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _userRepo.Setup(r => r.GetByIdAsync(UserId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(user);

        var result = await _sut.GetByIdAsync(task.Id, CancellationToken.None);

        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Id, Is.EqualTo(task.Id));
        Assert.That(result.OwnerUserName, Is.EqualTo("alice"));
    }

    [Test]
    public async Task GetByIdAsync_returns_null_when_task_not_found()
    {
        _taskRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskEntity?)null);
        var result = await _sut.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);
        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task GetByIdAsync_returns_null_when_no_access()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);

        var result = await _sut.GetByIdAsync(task.Id, CancellationToken.None);
        Assert.That(result, Is.Null);
    }

    // ── CreateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task CreateAsync_returns_created_task()
    {
        var request = new TaskCreateRequest { Title = "New Task", AreaId = AreaId, Status = TaskStatus.New };
        var created = MakeTask();

        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());
        _taskRepo.Setup(r => r.CreateAsync(It.IsAny<TaskEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(created);

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(created.Id));
    }

    [Test]
    public void CreateAsync_throws_when_area_not_found()
    {
        _areaRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((AreaEntity?)null);
        var request = new TaskCreateRequest { Title = "T", AreaId = Guid.NewGuid() };

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AreaNotFound));
    }

    [Test]
    public void CreateAsync_throws_when_no_access_to_area()
    {
        var area = MakeArea();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);
        var request = new TaskCreateRequest { Title = "T", AreaId = AreaId };

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AccessAreaDenied));
    }

    [Test]
    public void CreateAsync_throws_when_folder_not_found()
    {
        var folderId = Guid.NewGuid();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());
        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);
        var request = new TaskCreateRequest { Title = "T", AreaId = AreaId, FolderId = folderId };

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.ParentFolderNotFound));
    }

    [Test]
    public void CreateAsync_throws_when_folder_belongs_to_different_area()
    {
        var folderId = Guid.NewGuid();
        var folder = MakeFolder(folderId);
        folder.AreaId = Guid.NewGuid(); // different area
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());
        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        var request = new TaskCreateRequest { Title = "T", AreaId = AreaId, FolderId = folderId };

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.ParentFolderNotFound));
    }

    [Test]
    public void CreateAsync_throws_when_no_edit_permission()
    {
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());
        _areaRoleService.Setup(x => x.CanEditTaskAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var request = new TaskCreateRequest { Title = "T", AreaId = AreaId };

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.NoPermissionCreateTasksInArea));
    }

    [Test]
    public async Task CreateAsync_logs_event_and_notifies()
    {
        var created = MakeTask();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(MakeArea());
        _taskRepo.Setup(r => r.CreateAsync(It.IsAny<TaskEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(created);
        var request = new TaskCreateRequest { Title = "T", AreaId = AreaId };

        await _sut.CreateAsync(request, CancellationToken.None);

        _eventLogger.Verify(x => x.LogAsync(EntityType.TASK, created.Id, EventType.CREATE, created.Title, null, It.IsAny<CancellationToken>()), Times.Once);
        _notifier.Verify(x => x.NotifyEntityChangedAsync(EntityType.TASK, created.Id, AreaId, It.IsAny<Guid?>(), RealtimeEventType.Create, It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task UpdateAsync_updates_task_successfully()
    {
        var task = MakeTask();
        var request = new TaskUpdateRequest { Title = "Updated", AreaId = AreaId, Status = TaskStatus.Closed };

        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(task);

        var result = await _sut.UpdateAsync(task.Id, request, CancellationToken.None);

        _taskRepo.Verify(r => r.UpdateAsync(It.Is<TaskEntity>(e => e.Status == TaskStatus.Closed), It.IsAny<CancellationToken>(), true), Times.Once);
    }

    [Test]
    public void UpdateAsync_throws_when_task_not_found()
    {
        _taskRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskEntity?)null);
        var ex = Assert.ThrowsAsync<InvalidOperationException>(() =>
            _sut.UpdateAsync(Guid.NewGuid(), new TaskUpdateRequest { Title = "T", AreaId = AreaId, Status = TaskStatus.New }, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.TaskNotFound));
    }

    [Test]
    public void UpdateAsync_throws_when_no_access_to_task()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.UpdateAsync(task.Id, new TaskUpdateRequest { Title = "T", AreaId = AreaId, Status = TaskStatus.New }, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AccessTaskDenied));
    }

    [Test]
    public void UpdateAsync_throws_when_no_edit_permission()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _areaRoleService.Setup(x => x.CanEditTaskAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.UpdateAsync(task.Id, new TaskUpdateRequest { Title = "T", AreaId = AreaId, Status = TaskStatus.New }, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.NoPermissionEditTask));
    }

    // ── DeleteAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task DeleteAsync_deletes_task_successfully()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _taskRepo.Setup(r => r.DeleteAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(1);

        await _sut.DeleteAsync(task.Id, CancellationToken.None);

        _taskRepo.Verify(r => r.DeleteAsync(task.Id, It.IsAny<CancellationToken>(), false), Times.Once);
    }

    [Test]
    public void DeleteAsync_throws_when_task_not_found()
    {
        _taskRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((TaskEntity?)null);
        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.DeleteAsync(Guid.NewGuid(), CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.TaskNotFound));
    }

    [Test]
    public void DeleteAsync_throws_when_no_access()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteAsync(task.Id, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AccessTaskDenied));
    }

    [Test]
    public void DeleteAsync_throws_when_no_delete_permission()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteAsync(task.Id, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.OnlyOwnerCanDeleteTasks));
    }

    [Test]
    public async Task DeleteAsync_logs_delete_event()
    {
        var task = MakeTask();
        _taskRepo.Setup(r => r.GetByIdAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(task);
        _taskRepo.Setup(r => r.DeleteAsync(task.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(1);

        await _sut.DeleteAsync(task.Id, CancellationToken.None);

        _eventLogger.Verify(x => x.LogAsync(EntityType.TASK, task.Id, EventType.DELETE, task.Title, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── GetTaskSummaryByFolderAsync ─────────────────────────────────────────────

    [Test]
    public async Task GetTaskSummaryByFolderAsync_returns_tasks_in_folder()
    {
        var folderId = Guid.NewGuid();
        var folder = MakeFolder(folderId);
        var tasks = new List<TaskEntity> { MakeTask(folderId: folderId), MakeTask(folderId: folderId) };
        var user = new UserEntity { Id = UserId, Name = "alice", IsActive = true };

        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _taskRepo.Setup(r => r.GetByFolderIdAsync(folderId, It.IsAny<CancellationToken>(), It.IsAny<bool>())).ReturnsAsync(tasks);
        _userRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<UserEntity, bool>>>(), It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<UserEntity> { user });

        var result = (await _sut.GetTaskSummaryByFolderAsync(folderId, CancellationToken.None)).ToList();
        Assert.That(result, Has.Count.EqualTo(2));
    }

    [Test]
    public void GetTaskSummaryByFolderAsync_throws_when_folder_not_found()
    {
        _folderRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);
        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.GetTaskSummaryByFolderAsync(Guid.NewGuid(), CancellationToken.None));
    }

    [Test]
    public void GetTaskSummaryByFolderAsync_throws_when_no_access_to_area()
    {
        var folder = MakeFolder(Guid.NewGuid());
        _folderRepo.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.GetTaskSummaryByFolderAsync(folder.Id, CancellationToken.None));
    }
}
