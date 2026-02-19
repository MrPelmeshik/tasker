using Microsoft.Extensions.Logging;
using Moq;
using TaskerApi.Constants;
using TaskerApi.Core;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services;

namespace TaskerApiTests.Services;

/// <summary>
/// Тесты AreaService.
/// </summary>
public class AreaServiceTests
{
    private Mock<ILogger<AreaService>> _logger = null!;
    private Mock<ICurrentUserService> _currentUser = null!;
    private Mock<IAreaRepository> _areaRepo = null!;
    private Mock<IFolderRepository> _folderRepo = null!;
    private Mock<ITaskRepository> _taskRepo = null!;
    private Mock<IUserAreaAccessRepository> _accessRepo = null!;
    private Mock<IUserRepository> _userRepo = null!;
    private Mock<IEntityEventLogger> _eventLogger = null!;
    private Mock<IAreaRoleService> _areaRoleService = null!;
    private Mock<IRealtimeNotifier> _notifier = null!;
    private AreaService _sut = null!;

    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid AreaId = Guid.NewGuid();

    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger<AreaService>>();
        _currentUser = new Mock<ICurrentUserService>();
        _areaRepo = new Mock<IAreaRepository>();
        _folderRepo = new Mock<IFolderRepository>();
        _taskRepo = new Mock<ITaskRepository>();
        _accessRepo = new Mock<IUserAreaAccessRepository>();
        _userRepo = new Mock<IUserRepository>();
        _eventLogger = new Mock<IEntityEventLogger>();
        _areaRoleService = new Mock<IAreaRoleService>();
        _notifier = new Mock<IRealtimeNotifier>();

        _currentUser.Setup(x => x.UserId).Returns(UserId);
        _currentUser.Setup(x => x.HasAccessToArea(It.IsAny<Guid>())).Returns(true);
        _currentUser.Setup(x => x.AccessibleAreas).Returns(new List<Guid> { AreaId });

        _eventLogger.Setup(x => x.LogAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<EventType>(),
            It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _notifier.Setup(x => x.NotifyEntityChangedAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid?>(),
            It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _sut = new AreaService(
            _logger.Object,
            _currentUser.Object,
            _areaRepo.Object,
            _folderRepo.Object,
            _taskRepo.Object,
            _accessRepo.Object,
            _userRepo.Object,
            _eventLogger.Object,
            _areaRoleService.Object,
            _notifier.Object,
            null!);
    }

    private static AreaEntity MakeArea(Guid? id = null, string title = "Area") => new()
    {
        Id = id ?? AreaId,
        Title = title,
        Description = "desc",
        Color = "#ff0000",
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    // ── GetAllAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task GetAllAsync_returns_only_accessible_areas()
    {
        var accessibleArea = MakeArea(AreaId);
        var otherAreaId = Guid.NewGuid();
        var otherArea = MakeArea(otherAreaId, "Other Area");

        _areaRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<AreaEntity> { accessibleArea, otherArea });
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(true);
        _currentUser.Setup(x => x.HasAccessToArea(otherAreaId)).Returns(false);

        var result = (await _sut.GetAllAsync(CancellationToken.None)).ToList();

        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].Id, Is.EqualTo(AreaId));
    }

    [Test]
    public async Task GetAllAsync_returns_empty_when_no_accessible_areas()
    {
        _areaRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<AreaEntity>());

        var result = await _sut.GetAllAsync(CancellationToken.None);
        Assert.That(result, Is.Empty);
    }

    // ── GetByIdAsync ────────────────────────────────────────────────────────────

    [Test]
    public async Task GetByIdAsync_returns_area_with_owner_name()
    {
        var area = MakeArea();
        var user = new UserEntity { Id = UserId, Name = "alice", IsActive = true };

        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _userRepo.Setup(r => r.GetByIdAsync(UserId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(user);

        var result = await _sut.GetByIdAsync(AreaId, CancellationToken.None);

        Assert.That(result, Is.Not.Null);
        Assert.That(result!.Id, Is.EqualTo(AreaId));
        Assert.That(result.OwnerUserName, Is.EqualTo("alice"));
    }

    [Test]
    public async Task GetByIdAsync_returns_null_when_area_not_found()
    {
        _areaRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((AreaEntity?)null);
        var result = await _sut.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);
        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task GetByIdAsync_returns_null_when_no_access()
    {
        var area = MakeArea();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);

        var result = await _sut.GetByIdAsync(AreaId, CancellationToken.None);
        Assert.That(result, Is.Null);
    }

    // ── CreateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task CreateAsync_returns_created_area_response()
    {
        var request = new AreaCreateRequest { Title = "New Area", Color = "#abcdef" };
        var created = MakeArea();

        _areaRepo.Setup(r => r.GetByNameAsync(request.Title, It.IsAny<CancellationToken>(), It.IsAny<bool>())).ReturnsAsync((AreaEntity?)null);
        _areaRepo.Setup(r => r.CreateAsync(It.IsAny<AreaEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(created);
        _accessRepo.Setup(r => r.CreateAsync(It.IsAny<UserAreaAccessEntity>(), It.IsAny<CancellationToken>(), true))
            .ReturnsAsync(new UserAreaAccessEntity());

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(created.Id));
    }

    [Test]
    public void CreateAsync_throws_when_area_with_same_name_exists()
    {
        var request = new AreaCreateRequest { Title = "Existing", Color = "#aaa" };
        _areaRepo.Setup(r => r.GetByNameAsync("Existing", It.IsAny<CancellationToken>(), It.IsAny<bool>())).ReturnsAsync(MakeArea());

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AreaWithSameNameExists));
    }

    [Test]
    public async Task CreateAsync_logs_event_and_notifies()
    {
        var request = new AreaCreateRequest { Title = "New", Color = "#aaa" };
        var created = MakeArea();

        _areaRepo.Setup(r => r.GetByNameAsync(request.Title, It.IsAny<CancellationToken>(), It.IsAny<bool>())).ReturnsAsync((AreaEntity?)null);
        _areaRepo.Setup(r => r.CreateAsync(It.IsAny<AreaEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(created);
        _accessRepo.Setup(r => r.CreateAsync(It.IsAny<UserAreaAccessEntity>(), It.IsAny<CancellationToken>(), true))
            .ReturnsAsync(new UserAreaAccessEntity());

        await _sut.CreateAsync(request, CancellationToken.None);

        _eventLogger.Verify(x => x.LogAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<EventType>(),
            It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()), Times.Once);
        _notifier.Verify(x => x.NotifyEntityChangedAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<Guid>(),
            It.IsAny<Guid?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task UpdateAsync_updates_area_successfully()
    {
        var area = MakeArea();
        var request = new AreaUpdateRequest { Title = "Updated", Color = "#newcolor", Description = "new desc" };

        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanEditAreaAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _areaRepo.Setup(r => r.UpdateAsync(It.IsAny<AreaEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(area);

        await _sut.UpdateAsync(AreaId, request, CancellationToken.None);

        _areaRepo.Verify(r => r.UpdateAsync(It.Is<AreaEntity>(e => e.Title == "Updated"), It.IsAny<CancellationToken>(), true), Times.Once);
    }

    [Test]
    public void UpdateAsync_throws_when_area_not_found()
    {
        _areaRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((AreaEntity?)null);

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() =>
            _sut.UpdateAsync(Guid.NewGuid(), new AreaUpdateRequest { Title = "T", Color = "#aaa" }, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AreaNotFound));
    }

    [Test]
    public void UpdateAsync_throws_when_no_permission()
    {
        var area = MakeArea();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanEditAreaAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.UpdateAsync(AreaId, new AreaUpdateRequest { Title = "T", Color = "#aaa" }, CancellationToken.None));
    }

    // ── DeleteAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task DeleteAsync_deletes_area_and_cascades()
    {
        var area = MakeArea();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _taskRepo.Setup(r => r.BatchSoftDeleteByAreaIdAsync(AreaId, It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _folderRepo.Setup(r => r.BatchSoftDeleteByAreaIdAsync(AreaId, It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _areaRepo.Setup(r => r.DeleteAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(1);

        await _sut.DeleteAsync(AreaId, CancellationToken.None);

        _taskRepo.Verify(r => r.BatchSoftDeleteByAreaIdAsync(AreaId, It.IsAny<CancellationToken>()), Times.Once);
        _folderRepo.Verify(r => r.BatchSoftDeleteByAreaIdAsync(AreaId, It.IsAny<CancellationToken>()), Times.Once);
        _areaRepo.Verify(r => r.DeleteAsync(AreaId, It.IsAny<CancellationToken>(), false), Times.Once);
    }

    [Test]
    public void DeleteAsync_throws_when_area_not_found()
    {
        _areaRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((AreaEntity?)null);
        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.DeleteAsync(Guid.NewGuid(), CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AreaNotFound));
    }

    [Test]
    public void DeleteAsync_throws_when_no_permission()
    {
        var area = MakeArea();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteAsync(AreaId, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.OnlyOwnerCanDeleteArea));
    }
}
