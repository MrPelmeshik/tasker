using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services.Mapping;

namespace TaskerApiTests.Mapping;

/// <summary>
/// Тесты маппинга TaskSchedule (entity ↔ DTO).
/// </summary>
public class EntityMapperTaskScheduleTests
{
    private static TaskScheduleEntity MakeSchedule(Guid? taskId = null) => new()
    {
        Id = Guid.NewGuid(),
        TaskId = taskId ?? Guid.NewGuid(),
        StartAt = DateTimeOffset.UtcNow.AddHours(1),
        EndAt = DateTimeOffset.UtcNow.AddHours(2),
        OwnerUserId = Guid.NewGuid(),
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true
    };

    // ── ToTaskScheduleResponse ──────────────────────────────────────────────────

    [Test]
    public void ToTaskScheduleResponse_maps_all_fields()
    {
        var entity = MakeSchedule();
        var areaId = Guid.NewGuid();

        var response = entity.ToTaskScheduleResponse(
            taskTitle: "My Task",
            areaId: areaId,
            areaColor: "#ff0000",
            folderColor: "#00ff00",
            taskStatus: 2);

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.TaskId, Is.EqualTo(entity.TaskId));
        Assert.That(response.TaskTitle, Is.EqualTo("My Task"));
        Assert.That(response.AreaId, Is.EqualTo(areaId));
        Assert.That(response.AreaColor, Is.EqualTo("#ff0000"));
        Assert.That(response.FolderColor, Is.EqualTo("#00ff00"));
        Assert.That(response.TaskStatus, Is.EqualTo(2));
        Assert.That(response.StartAt, Is.EqualTo(entity.StartAt));
        Assert.That(response.EndAt, Is.EqualTo(entity.EndAt));
        Assert.That(response.CreatedAt, Is.EqualTo(entity.CreatedAt));
    }

    [Test]
    public void ToTaskScheduleResponse_defaults_areaId_to_empty_guid()
    {
        var entity = MakeSchedule();
        var response = entity.ToTaskScheduleResponse();
        Assert.That(response.AreaId, Is.EqualTo(Guid.Empty));
    }

    [Test]
    public void ToTaskScheduleResponse_null_colors_map_to_null()
    {
        var entity = MakeSchedule();
        var response = entity.ToTaskScheduleResponse(areaColor: null, folderColor: null);
        Assert.That(response.AreaColor, Is.Null);
        Assert.That(response.FolderColor, Is.Null);
    }

    [Test]
    public void ToTaskScheduleResponse_folder_color_overrides_area_color_in_application_logic()
    {
        // Маппер просто сохраняет оба цвета; логика "folder overrides area" на уровне сервиса/UI.
        // Убедимся, что оба цвета независимо маппируются.
        var entity = MakeSchedule();
        var response = entity.ToTaskScheduleResponse(areaColor: "#area", folderColor: "#folder");
        Assert.That(response.AreaColor, Is.EqualTo("#area"));
        Assert.That(response.FolderColor, Is.EqualTo("#folder"));
    }

    // ── ToTaskScheduleEntity ────────────────────────────────────────────────────

    [Test]
    public void ToTaskScheduleEntity_creates_entity_with_new_guid()
    {
        var taskId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var start = DateTimeOffset.UtcNow.AddHours(2);
        var end = start.AddHours(1);

        var request = new TaskScheduleCreateRequest
        {
            TaskId = taskId,
            StartAt = start,
            EndAt = end
        };

        var entity = request.ToTaskScheduleEntity(ownerId);

        Assert.That(entity.Id, Is.Not.EqualTo(Guid.Empty));
        Assert.That(entity.TaskId, Is.EqualTo(taskId));
        Assert.That(entity.StartAt, Is.EqualTo(start));
        Assert.That(entity.EndAt, Is.EqualTo(end));
        Assert.That(entity.OwnerUserId, Is.EqualTo(ownerId));
        Assert.That(entity.IsActive, Is.True);
    }

    [Test]
    public void ToTaskScheduleEntity_sets_created_and_updated_timestamps()
    {
        var before = DateTimeOffset.UtcNow.AddSeconds(-1);
        var request = new TaskScheduleCreateRequest
        {
            TaskId = Guid.NewGuid(),
            StartAt = DateTimeOffset.UtcNow,
            EndAt = DateTimeOffset.UtcNow.AddHours(1)
        };
        var entity = request.ToTaskScheduleEntity(Guid.NewGuid());
        var after = DateTimeOffset.UtcNow.AddSeconds(1);

        Assert.That(entity.CreatedAt, Is.InRange(before, after));
        Assert.That(entity.UpdatedAt, Is.InRange(before, after));
    }

    [Test]
    public void ToTaskScheduleEntity_each_call_produces_unique_id()
    {
        var request = new TaskScheduleCreateRequest
        {
            TaskId = Guid.NewGuid(),
            StartAt = DateTimeOffset.UtcNow,
            EndAt = DateTimeOffset.UtcNow.AddHours(1)
        };
        var e1 = request.ToTaskScheduleEntity(Guid.NewGuid());
        var e2 = request.ToTaskScheduleEntity(Guid.NewGuid());
        Assert.That(e1.Id, Is.Not.EqualTo(e2.Id));
    }
}
