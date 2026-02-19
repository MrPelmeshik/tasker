using System.Text.Json;
using TaskerApi.Helpers;
using TaskerApi.Models.Entities;

namespace TaskerApiTests.Helpers;

/// <summary>
/// Тесты вспомогательного класса EventMessageHelper.
/// </summary>
public class EventMessageHelperTests
{
    // ── ShallowClone ────────────────────────────────────────────────────────────

    [Test]
    public void ShallowClone_returns_different_reference_with_same_values()
    {
        var original = new AreaEntity { Id = Guid.NewGuid(), Title = "Area", Color = "#ff0000", IsActive = true };
        var clone = EventMessageHelper.ShallowClone(original);

        Assert.That(clone, Is.Not.SameAs(original));
        Assert.That(clone.Id, Is.EqualTo(original.Id));
        Assert.That(clone.Title, Is.EqualTo(original.Title));
        Assert.That(clone.Color, Is.EqualTo(original.Color));
    }

    [Test]
    public void ShallowClone_changes_to_original_do_not_affect_clone()
    {
        var original = new AreaEntity { Title = "Before" };
        var clone = EventMessageHelper.ShallowClone(original);
        original.Title = "After";
        Assert.That(clone.Title, Is.EqualTo("Before"));
    }

    [Test]
    public void ShallowClone_throws_for_null()
    {
        Assert.Throws<ArgumentNullException>(() => EventMessageHelper.ShallowClone<AreaEntity>(null!));
    }

    // ── BuildActivityMessageJson ────────────────────────────────────────────────

    [Test]
    public void BuildActivityMessageJson_both_null_returns_null()
    {
        Assert.That(EventMessageHelper.BuildActivityMessageJson(null, null), Is.Null);
    }

    [Test]
    public void BuildActivityMessageJson_both_empty_returns_null()
    {
        Assert.That(EventMessageHelper.BuildActivityMessageJson("", ""), Is.Null);
    }

    [Test]
    public void BuildActivityMessageJson_with_title_only()
    {
        var json = EventMessageHelper.BuildActivityMessageJson("My Title", null);
        Assert.That(json, Is.Not.Null);
        var doc = JsonDocument.Parse(json!);
        Assert.That(doc.RootElement.GetProperty("title").GetString(), Is.EqualTo("My Title"));
        Assert.That(doc.RootElement.TryGetProperty("description", out _), Is.False);
    }

    [Test]
    public void BuildActivityMessageJson_with_description_only()
    {
        var json = EventMessageHelper.BuildActivityMessageJson(null, "My Desc");
        Assert.That(json, Is.Not.Null);
        var doc = JsonDocument.Parse(json!);
        Assert.That(doc.RootElement.GetProperty("description").GetString(), Is.EqualTo("My Desc"));
        Assert.That(doc.RootElement.TryGetProperty("title", out _), Is.False);
    }

    [Test]
    public void BuildActivityMessageJson_with_both_fields()
    {
        var json = EventMessageHelper.BuildActivityMessageJson("T", "D");
        var doc = JsonDocument.Parse(json!);
        Assert.That(doc.RootElement.GetProperty("title").GetString(), Is.EqualTo("T"));
        Assert.That(doc.RootElement.GetProperty("description").GetString(), Is.EqualTo("D"));
    }

    // ── BuildUpdateMessageJson ──────────────────────────────────────────────────

    [Test]
    public void BuildUpdateMessageJson_returns_null_when_no_changes()
    {
        var e1 = new AreaEntity { Title = "Same", Color = "#aaa", Description = "desc" };
        var e2 = new AreaEntity { Title = "Same", Color = "#aaa", Description = "desc" };
        Assert.That(EventMessageHelper.BuildUpdateMessageJson(e1, e2), Is.Null);
    }

    [Test]
    public void BuildUpdateMessageJson_detects_title_change()
    {
        var e1 = new AreaEntity { Title = "Old" };
        var e2 = new AreaEntity { Title = "New" };
        var json = EventMessageHelper.BuildUpdateMessageJson(e1, e2);

        Assert.That(json, Is.Not.Null);
        var doc = JsonDocument.Parse(json!);
        var oldTitle = doc.RootElement.GetProperty("old").GetProperty("Title").GetString();
        var newTitle = doc.RootElement.GetProperty("new").GetProperty("Title").GetString();
        Assert.That(oldTitle, Is.EqualTo("Old"));
        Assert.That(newTitle, Is.EqualTo("New"));
    }

    [Test]
    public void BuildUpdateMessageJson_detects_color_change()
    {
        var e1 = new AreaEntity { Title = "T", Color = "#111" };
        var e2 = new AreaEntity { Title = "T", Color = "#222" };
        var json = EventMessageHelper.BuildUpdateMessageJson(e1, e2);

        Assert.That(json, Is.Not.Null);
        var doc = JsonDocument.Parse(json!);
        Assert.That(doc.RootElement.GetProperty("old").GetProperty("Color").GetString(), Is.EqualTo("#111"));
        Assert.That(doc.RootElement.GetProperty("new").GetProperty("Color").GetString(), Is.EqualTo("#222"));
    }

    [Test]
    public void BuildUpdateMessageJson_excludes_audit_fields()
    {
        var e1 = new AreaEntity { Title = "T", Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow };
        var e2 = new AreaEntity { Title = "T", Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow.AddDays(1) };

        // Id и CreatedAt отличаются, но не должны попасть в диff
        var json = EventMessageHelper.BuildUpdateMessageJson(e1, e2);
        Assert.That(json, Is.Null);
    }

    [Test]
    public void BuildUpdateMessageJson_returns_null_for_null_inputs()
    {
        Assert.That(EventMessageHelper.BuildUpdateMessageJson(null!, new AreaEntity()), Is.Null);
        Assert.That(EventMessageHelper.BuildUpdateMessageJson(new AreaEntity(), null!), Is.Null);
    }

    [Test]
    public void BuildUpdateMessageJson_returns_null_for_different_types()
    {
        var area = new AreaEntity { Title = "A" };
        var folder = new FolderEntity { Title = "A" };
        Assert.That(EventMessageHelper.BuildUpdateMessageJson(area, folder), Is.Null);
    }

    [Test]
    public void BuildUpdateMessageJson_for_folder_entity_detects_changes()
    {
        var f1 = new FolderEntity { Title = "Old Folder", Description = "desc", Color = null };
        var f2 = new FolderEntity { Title = "Old Folder", Description = "desc", Color = "#new" };
        var json = EventMessageHelper.BuildUpdateMessageJson(f1, f2);

        Assert.That(json, Is.Not.Null);
        var doc = JsonDocument.Parse(json!);
        Assert.That(doc.RootElement.GetProperty("new").GetProperty("Color").GetString(), Is.EqualTo("#new"));
    }
}
