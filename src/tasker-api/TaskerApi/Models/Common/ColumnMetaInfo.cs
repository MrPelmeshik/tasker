using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace TaskerApi.Models.Common;

public class ColumnMetaInfo(PropertyInfo property)
{
    public readonly PropertyInfo Property = property;

    public string SrcName => Property.Name;

    public string DbName => GetCustomAttributeFromHierarchy<ColumnAttribute>()?.Name ?? Property.Name;

    public bool IsReadOnly =>
        GetCustomAttributeFromHierarchy<EditableAttribute>() != null ||
        GetCustomAttributeFromHierarchy<DatabaseGeneratedAttribute>() != null;

    public bool IsKey => GetCustomAttributeFromHierarchy<KeyAttribute>() != null;
    
    public bool IsIgnored => GetCustomAttributeFromHierarchy<NotMappedAttribute>() != null;

    /// <summary>
    /// Получает атрибут, учитывая интерфейсы, если он не найден на уровне класса.
    /// </summary>
    private TAttr? GetCustomAttributeFromHierarchy<TAttr>() where TAttr : Attribute
    {
        // 1. Пробуем получить с самого PropertyInfo (класс)
        var attr = Property.GetCustomAttribute<TAttr>(inherit: true);
        if (attr != null)
            return attr;

        // 2. Пробуем найти в интерфейсах
        var declaringType = Property.DeclaringType;
        if (declaringType == null)
            return null;

        foreach (var iface in declaringType.GetInterfaces())
        {
            // Ищем свойство с тем же именем
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