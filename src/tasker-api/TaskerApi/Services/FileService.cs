using TaskerApi.Interfaces.Services;
using TaskerApi.Interfaces.Providers;
using TaskerApi.Interfaces.Infrastructure;
using TaskerApi.Models.Entities;
using Microsoft.Extensions.Logging;

namespace TaskerApi.Services;

public class FileService : BaseService<FileEntity, Guid>, IFileService
{
    private readonly IFileProvider _fileProvider;

    public FileService(ILogger logger, IUnitOfWorkFactory unitOfWorkFactory, IFileProvider fileProvider) 
        : base(logger, unitOfWorkFactory, fileProvider)
    {
        _fileProvider = fileProvider;
    }

    public async Task<IEnumerable<FileEntity>> GetByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<FileEntity>();
    }

    public async Task<IEnumerable<FileEntity>> GetByAreaAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<FileEntity>();
    }

    public async Task<IEnumerable<FileEntity>> GetByTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<FileEntity>();
    }

    public async Task<IEnumerable<FileEntity>> GetByActionAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<FileEntity>();
    }

    public async Task<FileEntity?> GetByStorageUrlAsync(string storageUrl, CancellationToken cancellationToken = default)
    {
        // Временно возвращаем null, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return null;
    }

    public async Task<IEnumerable<FileEntity>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        // Временно возвращаем пустой список, пока не переработаем провайдер
        // TODO: Переработать для использования UnitOfWork
        return new List<FileEntity>();
    }
}
