using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace TaskerApi.Models.Common;

public class ColumnMetaInfo(PropertyInfo property)
{
    public readonly PropertyInfo Property = property;
    
    public string SrcName => Property.Name;
    public string DbName => Property.GetCustomAttribute<ColumnAttribute>()?.Name ?? Property.Name;
    public bool IsReadOnly => Property.GetCustomAttribute<EditableAttribute>() != null || 
                              Property.GetCustomAttribute<DatabaseGeneratedAttribute>() != null;
    public bool IsKey => Property.GetCustomAttribute<KeyAttribute>() != null;
    
}