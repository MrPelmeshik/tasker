using System.Data;
using Dapper;
using Microsoft.Extensions.Logging;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Models.Entities;
using TaskerApi.Infrastructure;

namespace TaskerApi.Providers;

/// <summary>
/// Реализация провайдера для пользователей на базе Dapper.
/// </summary>
public class UserProvider : BaseProvider<UserEntity, Guid>, IUserProvider
{
    private readonly IUnitOfWorkFactory _unitOfWorkFactory;

    public UserProvider(IUnitOfWorkFactory unitOfWorkFactory, ILogger<UserProvider> logger) 
        : base(logger)
    {
        _unitOfWorkFactory = unitOfWorkFactory;
    }

    public override async Task<UserEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = @"
            SELECT id, idp, sso_subject, realm, email, display_name, picture_url, 
                   is_active, deactivated, created, updated
            FROM users 
            WHERE id = @Id AND is_active = true";
        
        EnsureValidConnection(connection);
        return await connection.QueryFirstOrDefaultAsync<UserEntity>(sql, new { Id = id });
    }

    public override async Task<Guid> InsertAsync(UserEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = @"
            INSERT INTO users (id, idp, sso_subject, realm, email, display_name, picture_url, 
                              is_active, created, updated)
            VALUES (@Id, @Idp, @SsoSubject, @Realm, @Email, @DisplayName, @PictureUrl, 
                    @IsActive, @Created, @Updated)
            RETURNING id";
        
        entity.Id = entity.Id == Guid.Empty ? Guid.NewGuid() : entity.Id;
        EnsureValidConnection(connection);
        return await connection.ExecuteScalarAsync<Guid>(sql, entity);
    }

    public override async Task<int> UpdateAsync(UserEntity entity, CancellationToken cancellationToken, IDbConnection connection)
    {
        const string sql = @"
            UPDATE users SET 
                idp = @Idp, sso_subject = @SsoSubject, realm = @Realm, email = @Email, 
                display_name = @DisplayName, picture_url = @PictureUrl, is_active = @IsActive, 
                deactivated = @Deactivated, updated = @Updated
            WHERE id = @Id";
        
        EnsureValidConnection(connection);
        return await connection.ExecuteAsync(sql, entity);
    }

    public async Task<IEnumerable<UserEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT DISTINCT u.id, u.idp, u.sso_subject, u.realm, u.email, u.display_name, 
                           u.picture_url, u.is_active, u.deactivated, u.created, u.updated
            FROM users u
            INNER JOIN area_memberships am ON u.id = am.user_id AND am.is_active
            WHERE am.area_id = @AreaId AND u.is_active = true
            ORDER BY u.display_name";
        
        return await connection.QueryAsync<UserEntity>(sql, new { AreaId = areaId });
    }

    public async Task<IEnumerable<UserEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, idp, sso_subject, realm, email, display_name, picture_url, 
                   is_active, deactivated, created, updated
            FROM users 
            WHERE is_active = true
            ORDER BY display_name";
        
        return await connection.QueryAsync<UserEntity>(sql);
    }

    public async Task<UserEntity?> GetBySsoSubjectAsync(string idp, string ssoSubject, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, idp, sso_subject, realm, email, display_name, picture_url, 
                   is_active, deactivated, created, updated
            FROM users 
            WHERE idp = @Idp AND sso_subject = @SsoSubject AND is_active = true";
        
        return await connection.QueryFirstOrDefaultAsync<UserEntity>(sql, new { Idp = idp, SsoSubject = ssoSubject });
    }

    public async Task<UserEntity?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, idp, sso_subject, realm, email, display_name, picture_url, 
                   is_active, deactivated, created, updated
            FROM users 
            WHERE email = @Email AND is_active = true";
        
        return await connection.QueryFirstOrDefaultAsync<UserEntity>(sql, new { Email = email });
    }

    public async Task<IEnumerable<UserEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        using var unitOfWork = _unitOfWorkFactory.Create();
        var connection = await unitOfWork.GetConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT id, idp, sso_subject, realm, email, display_name, picture_url, 
                   is_active, deactivated, created, updated
            FROM users 
            WHERE is_active = true
            ORDER BY display_name";
        
        return await connection.QueryAsync<UserEntity>(sql);
    }
}
