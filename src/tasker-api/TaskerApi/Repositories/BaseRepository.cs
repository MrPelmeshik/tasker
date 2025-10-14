using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TaskerApi.Core;
using TaskerApi.Interfaces.Models.Entities;
using TaskerApi.Interfaces.Repositories;

namespace TaskerApi.Repositories;

/// <summary>
/// Базовая реализация репозитория для работы с сущностями через Entity Framework
/// </summary>
/// <typeparam name="TEntity">Тип сущности</typeparam>
/// <typeparam name="TKey">Тип ключа</typeparam>
public class BaseRepository<TEntity, TKey>(TaskerDbContext context, ILogger<BaseRepository<TEntity, TKey>> logger)
    : IRepository<TEntity, TKey>
    where TEntity : class, IIdBaseEntity<TKey>
{
    protected readonly TaskerDbContext Context = context;
    protected readonly DbSet<TEntity> DbSet = context.Set<TEntity>();
    protected readonly ILogger<BaseRepository<TEntity, TKey>> Logger = logger;

    /// <summary>
    /// Получает все сущности из базы данных
    /// </summary>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные сущности (для мягкого удаления)</param>
    /// <returns>Список всех сущностей</returns>
    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var query = DbSet.AsQueryable();
        
        if (!includeDeleted && typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            query = query.Where(e => ((ISoftDeleteBaseEntity)e).IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Получает сущность по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор сущности</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные сущности (для мягкого удаления)</param>
    /// <returns>Найденная сущность или null</returns>
    public virtual async Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var query = DbSet.AsQueryable();
        
        if (!includeDeleted && typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            query = query.Where(e => ((ISoftDeleteBaseEntity)e).IsActive);
        }

        return await query.FirstOrDefaultAsync(e => e.Id!.Equals(id), cancellationToken);
    }

    /// <summary>
    /// Находит сущности по условию
    /// </summary>
    /// <param name="predicate">Условие поиска</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные сущности (для мягкого удаления)</param>
    /// <returns>Список найденных сущностей</returns>
    public virtual async Task<IReadOnlyList<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var query = DbSet.AsQueryable();
        
        if (!includeDeleted && typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            query = query.Where(e => ((ISoftDeleteBaseEntity)e).IsActive);
        }

        return await query.Where(predicate).ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Находит первую сущность по условию или возвращает null
    /// </summary>
    /// <param name="predicate">Условие поиска</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные сущности (для мягкого удаления)</param>
    /// <returns>Найденная сущность или null</returns>
    public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var query = DbSet.AsQueryable();
        
        if (!includeDeleted && typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            query = query.Where(e => ((ISoftDeleteBaseEntity)e).IsActive);
        }

        return await query.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    /// <summary>
    /// Создает новую сущность
    /// </summary>
    /// <param name="entity">Сущность для создания</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="setDefaultValues">Устанавливать ли значения по умолчанию</param>
    /// <returns>Созданная сущность</returns>
    public virtual async Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default, bool setDefaultValues = true)
    {
        if (setDefaultValues)
        {
            SetDefaultValues(entity);
        }

        DbSet.Add(entity);
        await Context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    /// <summary>
    /// Создает несколько новых сущностей
    /// </summary>
    /// <param name="entities">Список сущностей для создания</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="setDefaultValues">Устанавливать ли значения по умолчанию</param>
    /// <returns>Список созданных сущностей</returns>
    public virtual async Task<IList<TEntity>> CreateAsync(IList<TEntity> entities, CancellationToken cancellationToken = default, bool setDefaultValues = true)
    {
        if (setDefaultValues)
        {
            foreach (var entity in entities)
            {
                SetDefaultValues(entity);
            }
        }

        DbSet.AddRange(entities);
        await Context.SaveChangesAsync(cancellationToken);
        return entities;
    }

    /// <summary>
    /// Обновляет существующую сущность
    /// </summary>
    /// <param name="entity">Сущность для обновления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="setDefaultValues">Устанавливать ли значения по умолчанию</param>
    /// <returns>Обновленная сущность</returns>
    public virtual async Task<TEntity> UpdateAsync(TEntity entity, CancellationToken cancellationToken = default, bool setDefaultValues = true)
    {
        if (setDefaultValues)
        {
            SetDefaultValues(entity, isUpdate: true);
        }

        DbSet.Update(entity);
        await Context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    /// <summary>
    /// Удаляет сущность по идентификатору
    /// </summary>
    /// <param name="id">Идентификатор сущности</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="hardDelete">Выполнить жесткое удаление (true) или мягкое удаление (false)</param>
    /// <returns>Количество удаленных записей</returns>
    public virtual async Task<int> DeleteAsync(TKey id, CancellationToken cancellationToken = default, bool hardDelete = false)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            return 0;
        }

        return await DeleteAsync([entity], cancellationToken, hardDelete);
    }

    /// <summary>
    /// Удаляет несколько сущностей по списку идентификаторов
    /// </summary>
    /// <param name="ids">Список идентификаторов сущностей</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="hardDelete">Выполнить жесткое удаление (true) или мягкое удаление (false)</param>
    /// <returns>Количество удаленных записей</returns>
    public virtual async Task<int> DeleteAsync(IList<TKey> ids, CancellationToken cancellationToken = default, bool hardDelete = false)
    {
        var entities = new List<TEntity>();
        foreach (var id in ids)
        {
            var entity = await GetByIdAsync(id, cancellationToken);
            if (entity != null)
            {
                entities.Add(entity);
            }
        }

        return await DeleteAsync(entities, cancellationToken, hardDelete);
    }

    /// <summary>
    /// Внутренний метод для удаления списка сущностей
    /// </summary>
    /// <param name="entities">Список сущностей для удаления</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="hardDelete">Выполнить жесткое удаление (true) или мягкое удаление (false)</param>
    /// <returns>Количество удаленных записей</returns>
    protected virtual async Task<int> DeleteAsync(IList<TEntity> entities, CancellationToken cancellationToken = default, bool hardDelete = false)
    {
        if (hardDelete || !typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            DbSet.RemoveRange(entities);
        }
        else
        {
            foreach (var entity in entities)
            {
                if (entity is ISoftDeleteBaseEntity softDeleteEntity)
                {
                    softDeleteEntity.IsActive = false;
                    softDeleteEntity.DeactivatedAt = DateTimeOffset.Now;
                }
            }
            DbSet.UpdateRange(entities);
        }

        return await Context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Подсчитывает количество сущностей по условию
    /// </summary>
    /// <param name="predicate">Условие для подсчета (опционально)</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные сущности (для мягкого удаления)</param>
    /// <returns>Количество сущностей</returns>
    public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var query = DbSet.AsQueryable();
        
        if (!includeDeleted && typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            query = query.Where(e => ((ISoftDeleteBaseEntity)e).IsActive);
        }

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        return await query.CountAsync(cancellationToken);
    }

    /// <summary>
    /// Проверяет существование сущности по условию
    /// </summary>
    /// <param name="predicate">Условие для проверки</param>
    /// <param name="cancellationToken">Токен отмены операции</param>
    /// <param name="includeDeleted">Включать ли удаленные сущности (для мягкого удаления)</param>
    /// <returns>True, если сущность существует, иначе false</returns>
    public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default, bool includeDeleted = false)
    {
        var query = DbSet.AsQueryable();
        
        if (!includeDeleted && typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            query = query.Where(e => ((ISoftDeleteBaseEntity)e).IsActive);
        }

        return await query.AnyAsync(predicate, cancellationToken);
    }

    /// <summary>
    /// Устанавливает значения по умолчанию для сущности
    /// </summary>
    /// <param name="entity">Сущность для установки значений</param>
    /// <param name="isUpdate">Является ли операция обновлением</param>
    protected virtual void SetDefaultValues(TEntity entity, bool isUpdate = false)
    {
        var now = DateTimeOffset.Now;

        if (typeof(ICreatedDateBaseEntity).IsAssignableFrom(typeof(TEntity)) && !isUpdate)
        {
            if (entity is ICreatedDateBaseEntity createdEntity)
            {
                createdEntity.CreatedAt = now;
            }
        }

        if (typeof(IUpdatedDateBaseEntity).IsAssignableFrom(typeof(TEntity)))
        {
            if (entity is IUpdatedDateBaseEntity updatedEntity)
            {
                updatedEntity.UpdatedAt = now;
            }
        }

        if (typeof(ISoftDeleteBaseEntity).IsAssignableFrom(typeof(TEntity)) && !isUpdate)
        {
            if (entity is ISoftDeleteBaseEntity softDeleteEntity)
            {
                softDeleteEntity.IsActive = true;
            }
        }
    }
}
