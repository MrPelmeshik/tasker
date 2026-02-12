using System.Collections.Generic;
using System.Reflection;
using System.Text.Json;

namespace TaskerApi.Services;

/// <summary>
/// Вспомогательный класс для формирования JSON-сообщений событий.
/// </summary>
public static class EventMessageHelper
{
    /// <summary>
    /// Имена свойств, исключаемых из диффа (служебные поля).
    /// </summary>
    private static readonly HashSet<string> ExcludedPropertyNames =
        ["Id", "CreatedAt", "UpdatedAt", "OwnerUserId", "DeactivatedAt", "IsActive"];

    /// <summary>
    /// Создаёт поверхностную копию объекта через MemberwiseClone.
    /// </summary>
    public static T ShallowClone<T>(T source) where T : class
    {
        if (source == null)
            throw new ArgumentNullException(nameof(source));

        var method = typeof(object).GetMethod("MemberwiseClone", BindingFlags.NonPublic | BindingFlags.Instance)
            ?? throw new InvalidOperationException("MemberwiseClone не найден");
        return (T)method.Invoke(source, null)!;
    }

    /// <summary>
    /// Формирует JSON для ручной активности (NOTE/ACTIVITY) из заголовка и описания.
    /// </summary>
    public static string? BuildActivityMessageJson(string? title, string? description)
    {
        if (string.IsNullOrEmpty(title) && string.IsNullOrEmpty(description))
            return null;

        var dict = new Dictionary<string, string?>();
        if (!string.IsNullOrEmpty(title))
            dict["title"] = title;
        if (!string.IsNullOrEmpty(description))
            dict["description"] = description;

        return dict.Count > 0 ? JsonSerializer.Serialize(dict) : null;
    }

    /// <summary>
    /// Формирует JSON для UPDATE-события с диффом old/new на основе сравнения двух объектов.
    /// Сравнивает свойства через рефлексию, исключая служебные поля. Возвращает null, если изменений нет.
    /// </summary>
    public static string? BuildUpdateMessageJson(object oldEntity, object newEntity)
    {
        if (oldEntity == null || newEntity == null)
            return null;

        var type = oldEntity.GetType();
        if (type != newEntity.GetType())
            return null;

        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && !ExcludedPropertyNames.Contains(p.Name))
            .ToList();

        var oldValues = new Dictionary<string, object?>();
        var newValues = new Dictionary<string, object?>();

        foreach (var prop in properties)
        {
            object? oldVal;
            object? newVal;
            try
            {
                oldVal = prop.GetValue(oldEntity);
                newVal = prop.GetValue(newEntity);
            }
            catch
            {
                continue;
            }

            if (!AreEqual(oldVal, newVal))
            {
                oldValues[prop.Name] = ConvertForJson(oldVal);
                newValues[prop.Name] = ConvertForJson(newVal);
            }
        }

        if (oldValues.Count == 0)
            return null;

        var obj = new Dictionary<string, object>
        {
            ["old"] = oldValues,
            ["new"] = newValues
        };
        return JsonSerializer.Serialize(obj);
    }

    private static bool AreEqual(object? a, object? b)
    {
        if (a == null && b == null)
            return true;
        if (a == null || b == null)
            return false;
        if (a is Enum ea && b is Enum eb)
            return Equals(Convert.ChangeType(ea, Enum.GetUnderlyingType(ea.GetType())),
                Convert.ChangeType(eb, Enum.GetUnderlyingType(eb.GetType())));
        return Equals(a, b);
    }

    private static object? ConvertForJson(object? value)
    {
        if (value == null)
            return null;
        if (value is Enum)
            return Convert.ToInt32(value);
        return value;
    }
}
