using TaskerApi.Models.Entities;
using TaskerApi.Models.Requests;
using TaskerApi.Services.Mapping;

namespace TaskerApiTests.Mapping;

/// <summary>
/// Тесты маппинга Area (entity ↔ DTO).
/// </summary>
public class EntityMapperAreaTests
{
    private static AreaEntity MakeArea() => new()
    {
        Id = Guid.NewGuid(),
        Title = "Test Area",
        Description = "desc",
        Color = "#ff0000",
        OwnerUserId = Guid.NewGuid(),
        CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        UpdatedAt = DateTimeOffset.UtcNow,
        IsActive = true,
        DeactivatedAt = null
    };

    // ── ToAreaResponse ──────────────────────────────────────────────────────────

    [Test]
    public void ToAreaResponse_maps_all_fields()
    {
        var entity = MakeArea();
        var response = entity.ToAreaResponse("owner-name");

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.Title, Is.EqualTo(entity.Title));
        Assert.That(response.Description, Is.EqualTo(entity.Description));
        Assert.That(response.CustomColor, Is.EqualTo(entity.Color));
        Assert.That(response.OwnerUserId, Is.EqualTo(entity.OwnerUserId));
        Assert.That(response.OwnerUserName, Is.EqualTo("owner-name"));
        Assert.That(response.CreatedAt, Is.EqualTo(entity.CreatedAt));
        Assert.That(response.UpdatedAt, Is.EqualTo(entity.UpdatedAt));
        Assert.That(response.IsActive, Is.True);
        Assert.That(response.DeactivatedAt, Is.Null);
    }

    [Test]
    public void ToAreaResponse_without_ownerName_uses_empty_string()
    {
        var entity = MakeArea();
        var response = entity.ToAreaResponse();
        Assert.That(response.OwnerUserName, Is.EqualTo(""));
    }

    [Test]
    public void ToAreaResponse_null_color_maps_to_null()
    {
        var entity = MakeArea();
        entity.Color = null;
        var response = entity.ToAreaResponse();
        Assert.That(response.CustomColor, Is.Null);
    }

    // ── ToAreaShortCardResponse ─────────────────────────────────────────────────

    [Test]
    public void ToAreaShortCardResponse_maps_counts_and_owner()
    {
        var entity = MakeArea();
        var response = entity.ToAreaShortCardResponse(3, 7, "alice");

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.FoldersCount, Is.EqualTo(3));
        Assert.That(response.RootTasksCount, Is.EqualTo(7));
        Assert.That(response.OwnerUserName, Is.EqualTo("alice"));
        Assert.That(response.CustomColor, Is.EqualTo(entity.Color));
    }

    [Test]
    public void ToAreaShortCardResponse_defaults_to_zero_counts()
    {
        var entity = MakeArea();
        var response = entity.ToAreaShortCardResponse();
        Assert.That(response.FoldersCount, Is.EqualTo(0));
        Assert.That(response.RootTasksCount, Is.EqualTo(0));
    }

    // ── ToAreaCreateResponse ────────────────────────────────────────────────────

    [Test]
    public void ToAreaCreateResponse_maps_required_fields()
    {
        var entity = MakeArea();
        var response = entity.ToAreaCreateResponse();

        Assert.That(response.Id, Is.EqualTo(entity.Id));
        Assert.That(response.Title, Is.EqualTo(entity.Title));
        Assert.That(response.OwnerUserId, Is.EqualTo(entity.OwnerUserId));
        Assert.That(response.IsActive, Is.True);
    }

    // ── ToAreaEntity ────────────────────────────────────────────────────────────

    [Test]
    public void ToAreaEntity_creates_entity_with_new_guid()
    {
        var request = new AreaCreateRequest { Title = "New Area", Color = "#aabbcc", Description = "test" };
        var ownerId = Guid.NewGuid();

        var entity = request.ToAreaEntity(ownerId);

        Assert.That(entity.Id, Is.Not.EqualTo(Guid.Empty));
        Assert.That(entity.Title, Is.EqualTo("New Area"));
        Assert.That(entity.Description, Is.EqualTo("test"));
        Assert.That(entity.Color, Is.EqualTo("#aabbcc"));
        Assert.That(entity.OwnerUserId, Is.EqualTo(ownerId));
        Assert.That(entity.IsActive, Is.True);
    }

    [Test]
    public void ToAreaEntity_sets_created_and_updated_timestamps()
    {
        var before = DateTimeOffset.UtcNow.AddSeconds(-1);
        var request = new AreaCreateRequest { Title = "T", Color = "#000000" };
        var entity = request.ToAreaEntity(Guid.NewGuid());
        var after = DateTimeOffset.UtcNow.AddSeconds(1);

        Assert.That(entity.CreatedAt, Is.InRange(before, after));
        Assert.That(entity.UpdatedAt, Is.InRange(before, after));
    }

    // ── UpdateAreaEntity ────────────────────────────────────────────────────────

    [Test]
    public void UpdateAreaEntity_updates_title_description_color()
    {
        var entity = MakeArea();
        var originalId = entity.Id;
        var request = new AreaUpdateRequest { Title = "Updated", Description = "new desc", Color = "#001122" };

        request.UpdateAreaEntity(entity);

        Assert.That(entity.Id, Is.EqualTo(originalId), "Id must not change");
        Assert.That(entity.Title, Is.EqualTo("Updated"));
        Assert.That(entity.Description, Is.EqualTo("new desc"));
        Assert.That(entity.Color, Is.EqualTo("#001122"));
    }

    [Test]
    public void UpdateAreaEntity_updates_timestamp()
    {
        var entity = MakeArea();
        var oldUpdatedAt = entity.UpdatedAt;
        var request = new AreaUpdateRequest { Title = "X", Color = "#ffffff" };

        request.UpdateAreaEntity(entity);

        Assert.That(entity.UpdatedAt, Is.GreaterThanOrEqualTo(oldUpdatedAt));
    }
}
