using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using TaskerApi.Interfaces.Models.Entities;

namespace TaskerApi.Models.Common;

/// <summary>
/// Метаинформация о таблице базы данных.
/// </summary>
/// <typeparam name="T">Тип сущности базы данных</typeparam>
public class TableMetaInfo<T> where T : IDbEntity
{
    /// <summary>
    /// Инициализирует новый экземпляр класса TableMetaInfo.
    /// </summary>
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

    /// <summary>
    /// Имя таблицы в базе данных.
    /// </summary>
    public readonly string DbName;
    
    private readonly ReadOnlyDictionary<string, ColumnMetaInfo> _columns;
    
    /// <summary>
    /// Массив информации о всех колонках.
    /// </summary>
    public ColumnMetaInfo[] ColumnInfos { get; init; }
    
    /// <summary>
    /// Массив имен колонок в базе данных.
    /// </summary>
    public string[] DbColumnNames { get; init; }
    
    /// <summary>
    /// Массив имен свойств в исходном коде.
    /// </summary>
    public string[] SrcColumnNames { get; init; }
    
    /// <summary>
    /// Получает имя колонки в базе данных по имени свойства.
    /// </summary>
    /// <param name="columnName">Имя свойства</param>
    /// <returns>Имя колонки в базе данных</returns>
    public string DbColumnName(string columnName) => _columns[columnName].DbName;
    
    /// <summary>
    /// Получает имя свойства по имени колонки в базе данных.
    /// </summary>
    /// <param name="columnName">Имя колонки в базе данных</param>
    /// <returns>Имя свойства</returns>
    public string SrcColumnName(string columnName) => _columns[columnName].SrcName;
    
    /// <summary>
    /// Массив информации о колонках, доступных для записи.
    /// </summary>
    public ColumnMetaInfo[] NotReadOnlyColumns { get; init; }
    
    /// <summary>
    /// Массив имен колонок в базе данных, доступных для записи.
    /// </summary>
    public string[] NotReadOnlyDbColumnNames { get; init; }
    
    /// <summary>
    /// Массив имен свойств, доступных для записи.
    /// </summary>
    public string[] NotReadOnlySrcColumnNames { get; init; }
    
    /// <summary>
    /// Проверяет, существует ли колонка с указанным именем.
    /// </summary>
    /// <param name="columnName">Имя колонки</param>
    /// <returns>True, если колонка существует</returns>
    public bool HasColumn(string columnName) => _columns.ContainsKey(columnName);
    
    /// <summary>
    /// Получает информацию о колонке по имени.
    /// </summary>
    /// <param name="columnName">Имя колонки</param>
    /// <returns>Информация о колонке</returns>
    public ColumnMetaInfo this[string columnName] => _columns[columnName];
    
    /// <summary>
    /// Определяет, поддерживает ли сущность мягкое удаление.
    /// </summary>
    public bool HasSoftDelete { get; init; }
}