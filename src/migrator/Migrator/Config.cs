namespace Migrator;

public record Config
{
    public string Host { get; init; }
    public int Port { get; init; }
    public string User { get; init; }
    public string Password { get; init; }
    public string MigrationDirectory { get; init; }

    public Config(string[] args)
    {
        Host = string.IsNullOrEmpty(args[0])
            ? args[0]
            : throw new Exception($"Неверный хост: {args[0]}");
        Port = int.TryParse(args[1], out var port)
            ? port
            : throw new Exception($"Неверный порт: {args[1]}");
        User = string.IsNullOrEmpty(args[2])
            ? args[2]
            : throw new Exception($"Неверное имя пользователя: {args[2]}");
        Password = string.IsNullOrEmpty(args[3])
            ? Environment.GetEnvironmentVariable(args[3])
              ?? throw new Exception($"Не удалось получить пароль из переменной окружения {args[3]}")
            : throw new Exception($"Неверный пароль: {args[3]}");
        MigrationDirectory = string.IsNullOrEmpty(args[4])
            ? args[4]
            : throw new Exception($"Неверный путь к скриптам: {args[4]}");
    }
}