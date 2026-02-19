using TaskerApi.Models.Common;
using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services.Mapping;
using TaskStatus = TaskerApi.Models.Common.TaskStatus;

namespace TaskerApiTests.Mapping;

/// <summary>
/// Тесты маппинга Task (entity ↔ DTO).
/// </summary>
public class EntityMapperTaskTests
{
    private static TaskEntity MakeTask(TaskStatus status = TaskStatus.New, Guid? folderId = null) => new()
    {
        Id = Guid.NewGuid(),
        Title = "Test Task",
        Description = "task desc",
        AreaId = Guid.NewGuid(),
        FolderId = folderId,
        Status = status,
        OwnerUserId = Guid.NewGuid(),
        CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true,
        DeactivatedAt = null
    };

    // ── ToTaskResponse ──────────────────────────────────────────────────────────

    [Test]
    public void ToTaskResponse_maps_all_fields()
    {
        var entity = MakeTask(TaskStatus.InProgress);
        var response = entity.ToTaskResponse("charlie");

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.Title, Is.EqualTo(entity.Title));
        Assert.That(response.Description, Is.EqualTo(entity.Description));
        Assert.That(response.AreaId, Is.EqualTo(entity.AreaId));
        Assert.That(response.FolderId, Is.EqualTo(entity.FolderId));
        Assert.That(response.OwnerUserId, Is.EqualTo(entity.OwnerUserId));
        Assert.That(response.OwnerUserName, Is.EqualTo("charlie"));
        Assert.That(response.Status, Is.EqualTo((int)TaskStatus.InProgress));
        Assert.That(response.IsActive, Is.True);
    }

    [Test]
    public void ToTaskResponse_null_folderId_maps_to_null()
    {
        var entity = MakeTask(folderId: null);
        Assert.That(entity.ToTaskResponse().FolderId, Is.Null);
    }

    [Test]
    public void ToTaskResponse_with_folderId_maps_correctly()
    {
        var folderId = Guid.NewGuid();
        var entity = MakeTask(folderId: folderId);
        Assert.That(entity.ToTaskResponse().FolderId, Is.EqualTo(folderId));
    }

    // ── ToTaskSummaryResponse ───────────────────────────────────────────────────

    [Test]
    public void ToTaskSummaryResponse_maps_status_as_int()
    {
        var entity = MakeTask(TaskStatus.Closed);
        var response = entity.ToTaskSummaryResponse("user");
        Assert.That(response.Status, Is.EqualTo((int)TaskStatus.Closed));
    }

    [Test]
    public void ToTaskSummaryResponse_maps_all_fields()
    {
        var entity = MakeTask();
        var response = entity.ToTaskSummaryResponse("eve");

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.Title, Is.EqualTo(entity.Title));
        Assert.That(response.AreaId, Is.EqualTo(entity.AreaId));
        Assert.That(response.OwnerUserName, Is.EqualTo("eve"));
    }

    // ── ToTaskEntity ────────────────────────────────────────────────────────────

    [Test]
    public void ToTaskEntity_creates_entity_with_new_guid()
    {
        var areaId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var request = new TaskCreateRequest
        {
            Title = "New Task",
            Description = "d",
            AreaId = areaId,
            FolderId = null,
            Status = TaskStatus.New
        };

        var entity = request.ToTaskEntity(ownerId);

        Assert.That(entity.Id, Is.Not.EqualTo(Guid.Empty));
        Assert.That(entity.Title, Is.EqualTo("New Task"));
        Assert.That(entity.AreaId, Is.EqualTo(areaId));
        Assert.That(entity.OwnerUserId, Is.EqualTo(ownerId));
        Assert.That(entity.IsActive, Is.True);
        Assert.That(entity.FolderId, Is.Null);
    }

    [Test]
    public void ToTaskEntity_normalizes_invalid_status_to_New()
    {
        var request = new TaskCreateRequest
        {
            Title = "T",
            AreaId = Guid.NewGuid(),
            Status = (TaskStatus)999
        };
        var entity = request.ToTaskEntity(Guid.NewGuid());
        Assert.That(entity.Status, Is.EqualTo(TaskStatus.New));
    }

    [Test]
    public void ToTaskEntity_preserves_valid_status()
    {
        var request = new TaskCreateRequest
        {
            Title = "T",
            AreaId = Guid.NewGuid(),
            Status = TaskStatus.InProgress
        };
        var entity = request.ToTaskEntity(Guid.NewGuid());
        Assert.That(entity.Status, Is.EqualTo(TaskStatus.InProgress));
    }

    // ── UpdateTaskEntity ────────────────────────────────────────────────────────

    [Test]
    public void UpdateTaskEntity_updates_mutable_fields()
    {
        var entity = MakeTask();
        var originalId = entity.Id;
        var newAreaId = Guid.NewGuid();
        var newFolderId = Guid.NewGuid();

        var request = new TaskUpdateRequest
        {
            Title = "Updated Task",
            Description = "new desc",
            AreaId = newAreaId,
            FolderId = newFolderId,
            Status = TaskStatus.Closed
        };

        request.UpdateTaskEntity(entity);

        Assert.That(entity.Id, Is.EqualTo(originalId));
        Assert.That(entity.Title, Is.EqualTo("Updated Task"));
        Assert.That(entity.Description, Is.EqualTo("new desc"));
        Assert.That(entity.AreaId, Is.EqualTo(newAreaId));
        Assert.That(entity.FolderId, Is.EqualTo(newFolderId));
        Assert.That(entity.Status, Is.EqualTo(TaskStatus.Closed));
    }

    [Test]
    public void UpdateTaskEntity_updates_timestamp()
    {
        var entity = MakeTask();
        var oldUpdatedAt = entity.UpdatedAt;
        var request = new TaskUpdateRequest { Title = "X", AreaId = entity.AreaId, Status = entity.Status };
        request.UpdateTaskEntity(entity);
        Assert.That(entity.UpdatedAt, Is.GreaterThanOrEqualTo(oldUpdatedAt));
    }

    [Test]
    public void UpdateTaskEntity_clears_folderId_when_null()
    {
        var entity = MakeTask(folderId: Guid.NewGuid());
        var request = new TaskUpdateRequest { Title = "T", AreaId = entity.AreaId, FolderId = null, Status = entity.Status };
        request.UpdateTaskEntity(entity);
        Assert.That(entity.FolderId, Is.Null);
    }

    // ── status enum coverage ───────────────────────────────────────────────────

    [TestCase(TaskStatus.New)]
    [TestCase(TaskStatus.InProgress)]
    [TestCase(TaskStatus.Closed)]
    [TestCase(TaskStatus.Cancelled)]
    [TestCase(TaskStatus.Pending)]
    public void ToTaskResponse_maps_each_defined_status(TaskStatus status)
    {
        var entity = MakeTask(status);
        Assert.That(entity.ToTaskResponse().Status, Is.EqualTo((int)status));
    }
}
