using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace TaskerApi.Models.Common;

/// <summary>
/// Метаинформация о колонке базы данных, полученная из PropertyInfo.
/// </summary>
/// <param name="property">Информация о свойстве класса</param>
public class ColumnMetaInfo(PropertyInfo property)
{
    /// <summary>
    /// Информация о свойстве класса.
    /// </summary>
    public readonly PropertyInfo Property = property;

    /// <summary>
    /// Имя свойства в исходном коде.
    /// </summary>
    public string SrcName => Property.Name;

    /// <summary>
    /// Имя колонки в базе данных.
    /// </summary>
    public string DbName => GetCustomAttributeFromHierarchy<ColumnAttribute>()?.Name ?? Property.Name;

    /// <summary>
    /// Определяет, является ли колонка только для чтения.
    /// </summary>
    public bool IsReadOnly =>
        GetCustomAttributeFromHierarchy<EditableAttribute>() != null ||
        GetCustomAttributeFromHierarchy<DatabaseGeneratedAttribute>() != null;

    /// <summary>
    /// Определяет, является ли колонка ключевой.
    /// </summary>
    public bool IsKey => GetCustomAttributeFromHierarchy<KeyAttribute>() != null;
    
    /// <summary>
    /// Определяет, игнорируется ли колонка при маппинге.
    /// </summary>
    public bool IsIgnored => GetCustomAttributeFromHierarchy<NotMappedAttribute>() != null;

    /// <summary>
    /// Получает атрибут, учитывая интерфейсы, если он не найден на уровне класса.
    /// </summary>
    /// <typeparam name="TAttr">Тип атрибута для поиска</typeparam>
    /// <returns>Найденный атрибут или null</returns>
    private TAttr? GetCustomAttributeFromHierarchy<TAttr>() where TAttr : Attribute
    {
        var attr = Property.GetCustomAttribute<TAttr>(inherit: true);
        if (attr != null)
            return attr;

        var declaringType = Property.DeclaringType;
        if (declaringType == null)
            return null;

        foreach (var iface in declaringType.GetInterfaces())
        {
            var ifaceProp = iface.GetProperty(Property.Name);
            if (ifaceProp == null)
                continue;

            var ifaceAttr = ifaceProp.GetCustomAttribute<TAttr>(inherit: true);
            if (ifaceAttr != null)
                return ifaceAttr;
        }

        return null;
    }
}