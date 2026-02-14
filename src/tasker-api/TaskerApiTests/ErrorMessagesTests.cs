using TaskerApi.Constants;

namespace TaskerApiTests;

/// <summary>
/// Тесты констант сообщений об ошибках и маппинга в 404.
/// </summary>
public class ErrorMessagesTests
{
    [Test]
    public void IsNotFound_returns_true_for_known_not_found_messages()
    {
        Assert.That(ErrorMessages.IsNotFound(ErrorMessages.AreaNotFound), Is.True);
        Assert.That(ErrorMessages.IsNotFound(ErrorMessages.TaskNotFound), Is.True);
        Assert.That(ErrorMessages.IsNotFound(ErrorMessages.UserNotFound), Is.True);
    }

    [Test]
    public void IsNotFound_returns_false_for_access_denied_and_null()
    {
        Assert.That(ErrorMessages.IsNotFound(ErrorMessages.AccessAreaDenied), Is.False);
        Assert.That(ErrorMessages.IsNotFound(null), Is.False);
        Assert.That(ErrorMessages.IsNotFound(""), Is.False);
    }
}
