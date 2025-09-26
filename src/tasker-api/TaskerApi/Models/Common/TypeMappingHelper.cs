namespace TaskerApi.Models.Common;

/// <summary>
/// Вспомогательный класс для автоматического маппинга типов C# в типы PostgreSQL
/// </summary>
public static class TypeMappingHelper
{
    /// <summary>
    /// Получает TypeName для PostgreSQL на основе типа C#
    /// </summary>
    /// <param name="type">Тип C#</param>
    /// <returns>TypeName для PostgreSQL или null, если маппинг не найден</returns>
    public static string? GetPostgresTypeName(Type type)
    {
        // Обрабатываем Nullable типы
        var underlyingType = Nullable.GetUnderlyingType(type) ?? type;
        
        return underlyingType switch
        {
            // UUID типы
            not null when underlyingType == typeof(Guid) => "uuid",
            
            // Временные типы
            not null when underlyingType == typeof(DateTime) => "timestamp",
            not null when underlyingType == typeof(DateTimeOffset) => "timestamptz",
            not null when underlyingType == typeof(DateOnly) => "date",
            not null when underlyingType == typeof(TimeOnly) => "time",
            not null when underlyingType == typeof(TimeSpan) => "interval",
            
            // Числовые типы
            not null when underlyingType == typeof(byte) => "smallint",
            not null when underlyingType == typeof(sbyte) => "smallint",
            not null when underlyingType == typeof(short) => "smallint",
            not null when underlyingType == typeof(ushort) => "integer",
            not null when underlyingType == typeof(int) => "integer",
            not null when underlyingType == typeof(uint) => "bigint",
            not null when underlyingType == typeof(long) => "bigint",
            not null when underlyingType == typeof(ulong) => "numeric",
            not null when underlyingType == typeof(float) => "real",
            not null when underlyingType == typeof(double) => "double precision",
            not null when underlyingType == typeof(decimal) => "numeric",
            
            // Булевы типы
            not null when underlyingType == typeof(bool) => "boolean",
            
            // Строковые типы
            not null when underlyingType == typeof(string) => "text",
            not null when underlyingType == typeof(char) => "char(1)",
            
            // Байтовые типы
            not null when underlyingType == typeof(byte[]) => "bytea",
            
            // Enum типы
            not null when underlyingType.IsEnum => "integer",
            
            // JSON типы (если нужно автоматически определять)
            not null when underlyingType == typeof(object) => "jsonb",
            
            // Геометрические типы (если используются)
            // not null when underlyingType.Name == "Point" => "point",
            // not null when underlyingType.Name == "Line" => "line",
            // not null when underlyingType.Name == "Lseg" => "lseg",
            // not null when underlyingType.Name == "Box" => "box",
            // not null when underlyingType.Name == "Path" => "path",
            // not null when underlyingType.Name == "Polygon" => "polygon",
            // not null when underlyingType.Name == "Circle" => "circle",
            
            _ => null
        };
    }
}
