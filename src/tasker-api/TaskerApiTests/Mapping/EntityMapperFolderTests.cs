using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services.Mapping;

namespace TaskerApiTests.Mapping;

/// <summary>
/// Тесты маппинга Folder (entity ↔ DTO).
/// </summary>
public class EntityMapperFolderTests
{
    private static FolderEntity MakeFolder(Guid? areaId = null, Guid? parentId = null, string? color = null) => new()
    {
        Id = Guid.NewGuid(),
        Title = "Test Folder",
        Description = "folder desc",
        AreaId = areaId ?? Guid.NewGuid(),
        ParentFolderId = parentId,
        Color = color,
        OwnerUserId = Guid.NewGuid(),
        CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true,
        DeactivatedAt = null
    };

    // ── ToFolderResponse ────────────────────────────────────────────────────────

    [Test]
    public void ToFolderResponse_maps_all_fields()
    {
        var entity = MakeFolder(color: "#123456");
        var response = entity.ToFolderResponse("bob");

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.Title, Is.EqualTo(entity.Title));
        Assert.That(response.Description, Is.EqualTo(entity.Description));
        Assert.That(response.AreaId, Is.EqualTo(entity.AreaId));
        Assert.That(response.ParentFolderId, Is.EqualTo(entity.ParentFolderId));
        Assert.That(response.OwnerUserId, Is.EqualTo(entity.OwnerUserId));
        Assert.That(response.OwnerUserName, Is.EqualTo("bob"));
        Assert.That(response.CustomColor, Is.EqualTo("#123456"));
        Assert.That(response.IsActive, Is.True);
    }

    [Test]
    public void ToFolderResponse_null_color_maps_to_null()
    {
        var entity = MakeFolder(color: null);
        Assert.That(entity.ToFolderResponse().CustomColor, Is.Null);
    }

    [Test]
    public void ToFolderResponse_with_parent_folder()
    {
        var parentId = Guid.NewGuid();
        var entity = MakeFolder(parentId: parentId);
        Assert.That(entity.ToFolderResponse().ParentFolderId, Is.EqualTo(parentId));
    }

    // ── ToFolderSummaryResponse ─────────────────────────────────────────────────

    [Test]
    public void ToFolderSummaryResponse_maps_counts()
    {
        var entity = MakeFolder(color: "#aabbcc");
        var response = entity.ToFolderSummaryResponse(5, 3, "alice");

        Assert.That(response.TasksCount, Is.EqualTo(5));
        Assert.That(response.SubfoldersCount, Is.EqualTo(3));
        Assert.That(response.OwnerUserName, Is.EqualTo("alice"));
        Assert.That(response.CustomColor, Is.EqualTo("#aabbcc"));
    }

    [Test]
    public void ToFolderSummaryResponse_defaults_to_zero_counts()
    {
        var entity = MakeFolder();
        var response = entity.ToFolderSummaryResponse();
        Assert.That(response.TasksCount, Is.EqualTo(0));
        Assert.That(response.SubfoldersCount, Is.EqualTo(0));
    }

    // ── ToFolderEntity ──────────────────────────────────────────────────────────

    [Test]
    public void ToFolderEntity_creates_entity_with_new_guid()
    {
        var areaId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var request = new FolderCreateRequest
        {
            Title = "New Folder",
            Description = "desc",
            AreaId = areaId,
            ParentFolderId = parentId,
            Color = "#ffffff"
        };

        var entity = request.ToFolderEntity(ownerId);

        Assert.That(entity.Id, Is.Not.EqualTo(Guid.Empty));
        Assert.That(entity.Title, Is.EqualTo("New Folder"));
        Assert.That(entity.Description, Is.EqualTo("desc"));
        Assert.That(entity.AreaId, Is.EqualTo(areaId));
        Assert.That(entity.ParentFolderId, Is.EqualTo(parentId));
        Assert.That(entity.Color, Is.EqualTo("#ffffff"));
        Assert.That(entity.OwnerUserId, Is.EqualTo(ownerId));
        Assert.That(entity.IsActive, Is.True);
    }

    [Test]
    public void ToFolderEntity_without_color_creates_null_color()
    {
        var request = new FolderCreateRequest { Title = "F", AreaId = Guid.NewGuid(), Color = null };
        var entity = request.ToFolderEntity(Guid.NewGuid());
        Assert.That(entity.Color, Is.Null);
    }

    [Test]
    public void ToFolderEntity_without_parent_creates_null_parent()
    {
        var request = new FolderCreateRequest { Title = "F", AreaId = Guid.NewGuid(), ParentFolderId = null };
        var entity = request.ToFolderEntity(Guid.NewGuid());
        Assert.That(entity.ParentFolderId, Is.Null);
    }

    // ── UpdateFolderEntity ──────────────────────────────────────────────────────

    [Test]
    public void UpdateFolderEntity_updates_all_mutable_fields()
    {
        var entity = MakeFolder(color: "#old");
        var originalId = entity.Id;
        var newAreaId = Guid.NewGuid();
        var request = new FolderUpdateRequest
        {
            Title = "Updated",
            Description = "new desc",
            AreaId = newAreaId,
            ParentFolderId = null,
            Color = "#new"
        };

        request.UpdateFolderEntity(entity);

        Assert.That(entity.Id, Is.EqualTo(originalId));
        Assert.That(entity.Title, Is.EqualTo("Updated"));
        Assert.That(entity.Description, Is.EqualTo("new desc"));
        Assert.That(entity.AreaId, Is.EqualTo(newAreaId));
        Assert.That(entity.ParentFolderId, Is.Null);
        Assert.That(entity.Color, Is.EqualTo("#new"));
    }

    [Test]
    public void UpdateFolderEntity_clears_color_when_null()
    {
        var entity = MakeFolder(color: "#123456");
        var request = new FolderUpdateRequest
        {
            Title = "T",
            AreaId = entity.AreaId,
            Color = null
        };
        request.UpdateFolderEntity(entity);
        Assert.That(entity.Color, Is.Null);
    }
}
