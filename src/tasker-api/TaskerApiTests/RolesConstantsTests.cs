using TaskerApi.Constants;

namespace TaskerApiTests;

/// <summary>
/// Тесты констант ролей.
/// </summary>
public class RolesConstantsTests
{
    [Test]
    public void Roles_have_expected_values()
    {
        Assert.That(Roles.Admin, Is.EqualTo("admin"));
        Assert.That(Roles.User, Is.EqualTo("user"));
    }
}
