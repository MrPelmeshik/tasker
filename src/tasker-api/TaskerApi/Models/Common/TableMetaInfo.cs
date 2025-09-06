using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using TaskerApi.Interfaces.Entities;

namespace TaskerApi.Models.Common;

public class TableMetaInfo<T> where T : class, IDbEntity
{
    public TableMetaInfo()
    {
        DbName = typeof(T).GetCustomAttribute<TableAttribute>()?.Name ?? typeof(T).Name;
        _columns = typeof(T)
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Select(p => new ColumnMetaInfo(p))
            .Where(c => !c.IsIgnored)
            .ToDictionary(c => c.SrcName, c => c)
            .AsReadOnly();
        
        ColumnInfos = _columns.Values.ToArray();
        DbColumnNames = _columns.Values.Select(c => c.DbName).ToArray();
        SrcColumnNames = _columns.Values.Select(c => c.SrcName).ToArray();
        
        NotReadOnlyColumns = _columns.Values.Where(c => !c.IsReadOnly).ToArray();
        NotReadOnlyDbColumnNames = _columns.Values.Where(c => !c.IsReadOnly).Select(c => c.DbName).ToArray();
        NotReadOnlySrcColumnNames = _columns.Values.Where(c => !c.IsReadOnly).Select(c => c.SrcName).ToArray();

        HasSoftDelete = typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(T));
    }

    public readonly string DbName;
    private readonly ReadOnlyDictionary<string, ColumnMetaInfo> _columns;
    
    public ColumnMetaInfo[] ColumnInfos { get; init; }
    
    public string[] DbColumnNames { get; init; }
    
    public string[] SrcColumnNames { get; init; }
    
    public string DbColumnName(string columnName) => _columns[columnName].DbName;
    
    public string SrcColumnName(string columnName) => _columns[columnName].SrcName;
    
    public ColumnMetaInfo[] NotReadOnlyColumns { get; init; }
    
    public string[] NotReadOnlyDbColumnNames { get; init; }
    
    public string[] NotReadOnlySrcColumnNames { get; init; }
    
    public bool HasColumn(string columnName) => _columns.ContainsKey(columnName);
    
    public ColumnMetaInfo this[string columnName] => _columns[columnName];
    
    public bool HasSoftDelete { get; init; }
}