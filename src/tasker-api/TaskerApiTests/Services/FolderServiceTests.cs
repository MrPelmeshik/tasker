using Microsoft.Extensions.Logging;
using Moq;
using TaskerApi.Constants;
using TaskerApi.Interfaces.Repositories;
using TaskerApi.Interfaces.Services;
using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services;

namespace TaskerApiTests.Services;

/// <summary>
/// Тесты FolderService.
/// </summary>
public class FolderServiceTests
{
    private Mock<ILogger<FolderService>> _logger = null!;
    private Mock<ICurrentUserService> _currentUser = null!;
    private Mock<IFolderRepository> _folderRepo = null!;
    private Mock<IAreaRepository> _areaRepo = null!;
    private Mock<ITaskRepository> _taskRepo = null!;
    private Mock<IUserRepository> _userRepo = null!;
    private Mock<IEntityEventLogger> _eventLogger = null!;
    private Mock<IAreaRoleService> _areaRoleService = null!;
    private Mock<IRealtimeNotifier> _notifier = null!;
    private FolderService _sut = null!;

    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid AreaId = Guid.NewGuid();

    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger<FolderService>>();
        _currentUser = new Mock<ICurrentUserService>();
        _folderRepo = new Mock<IFolderRepository>();
        _areaRepo = new Mock<IAreaRepository>();
        _taskRepo = new Mock<ITaskRepository>();
        _userRepo = new Mock<IUserRepository>();
        _eventLogger = new Mock<IEntityEventLogger>();
        _areaRoleService = new Mock<IAreaRoleService>();
        _notifier = new Mock<IRealtimeNotifier>();

        _currentUser.Setup(x => x.UserId).Returns(UserId);
        _currentUser.Setup(x => x.HasAccessToArea(It.IsAny<Guid>())).Returns(true);

        _eventLogger.Setup(x => x.LogAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<EventType>(),
            It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _notifier.Setup(x => x.NotifyEntityChangedAsync(
            It.IsAny<EntityType>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid?>(),
            It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _sut = new FolderService(
            _logger.Object,
            _currentUser.Object,
            _folderRepo.Object,
            _areaRepo.Object,
            _taskRepo.Object,
            _userRepo.Object,
            _eventLogger.Object,
            _areaRoleService.Object,
            _notifier.Object);
    }

    private static AreaEntity MakeArea() => new()
    {
        Id = AreaId,
        Title = "Area",
        Color = "#ff0000",
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    private static FolderEntity MakeFolder(Guid? id = null, Guid? parentId = null, string? color = null) => new()
    {
        Id = id ?? Guid.NewGuid(),
        Title = "Folder",
        Description = "desc",
        AreaId = AreaId,
        ParentFolderId = parentId,
        Color = color,
        OwnerUserId = UserId,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    // ── GetAsync ────────────────────────────────────────────────────────────────

    [Test]
    public async Task GetAsync_returns_accessible_folders()
    {
        var folder = MakeFolder();
        var otherAreaId = Guid.NewGuid();
        var inaccessibleFolder = new FolderEntity { Id = Guid.NewGuid(), AreaId = otherAreaId, Title = "Other", IsActive = true };

        _folderRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>(), false))
            .ReturnsAsync(new List<FolderEntity> { folder, inaccessibleFolder });
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(true);
        _currentUser.Setup(x => x.HasAccessToArea(otherAreaId)).Returns(false);

        var result = (await _sut.GetAsync(CancellationToken.None)).ToList();
        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].Id, Is.EqualTo(folder.Id));
    }

    // ── GetByIdAsync ────────────────────────────────────────────────────────────

    [Test]
    public async Task GetByIdAsync_returns_folder_with_owner_name()
    {
        var folder = MakeFolder();
        var user = new UserEntity { Id = UserId, Name = "bob", IsActive = true };
        _folderRepo.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _userRepo.Setup(r => r.GetByIdAsync(UserId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(user);

        var result = await _sut.GetByIdAsync(folder.Id, CancellationToken.None);

        Assert.That(result, Is.Not.Null);
        Assert.That(result!.OwnerUserName, Is.EqualTo("bob"));
    }

    [Test]
    public async Task GetByIdAsync_returns_null_when_not_found()
    {
        _folderRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);
        var result = await _sut.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);
        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task GetByIdAsync_returns_null_when_no_access()
    {
        var folder = MakeFolder();
        _folderRepo.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _currentUser.Setup(x => x.HasAccessToArea(AreaId)).Returns(false);

        var result = await _sut.GetByIdAsync(folder.Id, CancellationToken.None);
        Assert.That(result, Is.Null);
    }

    // ── CreateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task CreateAsync_creates_folder_successfully()
    {
        var area = MakeArea();
        var folder = MakeFolder(color: "#aabbcc");
        var request = new FolderCreateRequest { Title = "New", AreaId = AreaId, Color = "#aabbcc" };

        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _folderRepo.Setup(r => r.CreateAsync(It.IsAny<FolderEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(folder);

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.CustomColor, Is.EqualTo("#aabbcc"));
    }

    [Test]
    public void CreateAsync_throws_when_area_not_found()
    {
        _areaRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((AreaEntity?)null);
        var request = new FolderCreateRequest { Title = "F", AreaId = Guid.NewGuid() };

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.AreaNotFound));
    }

    [Test]
    public void CreateAsync_throws_when_no_permission()
    {
        var area = MakeArea();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var request = new FolderCreateRequest { Title = "F", AreaId = AreaId };

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.OnlyOwnerCanCreateFolders));
    }

    [Test]
    public void CreateAsync_throws_when_parent_folder_not_found()
    {
        var area = MakeArea();
        var parentId = Guid.NewGuid();
        _areaRepo.Setup(r => r.GetByIdAsync(AreaId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(area);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _folderRepo.Setup(r => r.GetByIdAsync(parentId, It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);
        // GetParentFolderIdAsync для ValidateNoCycleAsync
        _folderRepo.Setup(r => r.GetParentFolderIdAsync(parentId, It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var request = new FolderCreateRequest { Title = "F", AreaId = AreaId, ParentFolderId = parentId };

        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.ParentFolderNotFound));
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task UpdateAsync_updates_folder_color()
    {
        var folder = MakeFolder(color: "#old");
        var request = new FolderUpdateRequest
        {
            Title = "Updated",
            AreaId = AreaId,
            Color = "#new"
        };

        _folderRepo.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _areaRoleService.Setup(x => x.CanEditFolderAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _folderRepo.Setup(r => r.UpdateAsync(It.IsAny<FolderEntity>(), It.IsAny<CancellationToken>(), true)).ReturnsAsync(folder);

        var result = await _sut.UpdateAsync(folder.Id, request, CancellationToken.None);

        _folderRepo.Verify(r => r.UpdateAsync(It.Is<FolderEntity>(e => e.Color == "#new"), It.IsAny<CancellationToken>(), true), Times.Once);
    }

    [Test]
    public void UpdateAsync_throws_when_folder_not_found()
    {
        _folderRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);
        var ex = Assert.ThrowsAsync<InvalidOperationException>(() =>
            _sut.UpdateAsync(Guid.NewGuid(), new FolderUpdateRequest { Title = "T", AreaId = AreaId }, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.FolderNotFound));
    }

    [Test]
    public void UpdateAsync_throws_when_no_permission()
    {
        var folder = MakeFolder();
        _folderRepo.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _areaRoleService.Setup(x => x.CanEditFolderAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.UpdateAsync(folder.Id, new FolderUpdateRequest { Title = "T", AreaId = AreaId }, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.NoPermissionEditFolder));
    }

    [Test]
    public void UpdateAsync_throws_when_folder_is_its_own_parent()
    {
        var folderId = Guid.NewGuid();
        var folder = MakeFolder(id: folderId);
        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _areaRoleService.Setup(x => x.CanEditFolderAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        // GetParentFolderIdAsync for cycle check - no parent
        _folderRepo.Setup(r => r.GetParentFolderIdAsync(folderId, It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var request = new FolderUpdateRequest { Title = "T", AreaId = AreaId, ParentFolderId = folderId };

        // ValidateNoCycleAsync выполняется первой и бросает FolderCycle до проверки самоссылки
        var ex = Assert.ThrowsAsync<InvalidOperationException>(() =>
            _sut.UpdateAsync(folderId, request, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.FolderCycle));
    }

    // ── DeleteAsync ─────────────────────────────────────────────────────────────

    [Test]
    public async Task DeleteAsync_deletes_folder_and_subfolder_tasks()
    {
        var folderId = Guid.NewGuid();
        var folder = MakeFolder(id: folderId);
        var subFolderIds = new List<Guid> { Guid.NewGuid() };

        _folderRepo.Setup(r => r.GetByIdAsync(folderId, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _folderRepo.Setup(r => r.GetSubfolderIdsRecursiveAsync(folderId, It.IsAny<CancellationToken>())).ReturnsAsync(subFolderIds);
        _taskRepo.Setup(r => r.BatchSoftDeleteByFolderIdsAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _folderRepo.Setup(r => r.BatchSoftDeleteAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(folderId, CancellationToken.None);

        _taskRepo.Verify(r => r.BatchSoftDeleteByFolderIdsAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>()), Times.Once);
        _folderRepo.Verify(r => r.BatchSoftDeleteAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public void DeleteAsync_throws_when_folder_not_found()
    {
        _folderRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>(), false)).ReturnsAsync((FolderEntity?)null);
        var ex = Assert.ThrowsAsync<InvalidOperationException>(() => _sut.DeleteAsync(Guid.NewGuid(), CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.FolderNotFound));
    }

    [Test]
    public void DeleteAsync_throws_when_no_permission()
    {
        var folder = MakeFolder();
        _folderRepo.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>(), false)).ReturnsAsync(folder);
        _areaRoleService.Setup(x => x.CanCreateOrDeleteStructureAsync(AreaId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteAsync(folder.Id, CancellationToken.None));
        Assert.That(ex!.Message, Is.EqualTo(ErrorMessages.OnlyOwnerCanDeleteFolders));
    }
}
