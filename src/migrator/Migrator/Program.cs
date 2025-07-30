using System.Text.RegularExpressions;
using Npgsql;
using System.Security.Cryptography;
using System.Text;

namespace Migrator;

public static class Program
{
    public static void Main(string[] args)
    {
        var cfg = new Config(args);
        
        var dbs = Directory
            .GetDirectories(cfg.MigrationDirectory)
            .Select(Path.GetFileName)
            .Where(fileName => !string.IsNullOrEmpty(fileName))
            .Cast<string>()
            .ToArray();
        
        if (dbs.Length == 0)
            throw new Exception("Нет баз данных");

        foreach (var db in dbs)
        {
            var migrationDir = Path.Combine(cfg.MigrationDirectory, db);
            var migrationScripts = GetMigrationScripts(migrationDir);
            var migrationHistories = GetMigrationHistories(cfg, db);
            var lastAppliedMigrationOrder = migrationHistories.Max(x => x.Order);

            if (migrationScripts.Count(x => x.Order <= lastAppliedMigrationOrder) 
                != migrationHistories.Count()
                && 0 != (migrationScripts
                          .Where(x => x.Order <= lastAppliedMigrationOrder)
                          .Select(x => x.Order ^ x.Hash
                              .Select((c, i) => i * c)
                              .Aggregate(0, (acc, y) => acc ^ y))
                          .Aggregate(0, (acc, x) => acc ^ x)
                      ^ migrationHistories
                          .Select(x => x.Order ^ x.Hash
                              .Select((c, i) => i * c)
                              .Aggregate(0, (acc, y) => acc ^ y))
                          .Aggregate(0, (acc, x) => acc ^ x)))
            {
                throw new Exception($"Миграции в директории {migrationDir} не совпадают с миграцией в базе данных {db}");
            }

            using var conn = new NpgsqlConnection(GetConnectionString(cfg, db));
            conn.Open();
            using var trans = conn.BeginTransaction();
            try
            {
                foreach (var migrationScript in migrationScripts.Where(x => x.Order > lastAppliedMigrationOrder))
                {

                    using var cmd = new NpgsqlCommand(migrationScript.Sql);
                    cmd.ExecuteNonQuery();

                    using var cmd2 = new NpgsqlCommand("""
                                                       insert into migration_history (order, file_name, name, sql, hash)
                                                       values (@order, @fileName, @name, @sql, @hash)
                                                       """);
                    cmd2.Parameters.AddWithValue("order", migrationScript.Order);
                    cmd2.Parameters.AddWithValue("fileName", migrationScript.FileName);
                    cmd2.Parameters.AddWithValue("name", migrationScript.Name);
                    cmd2.Parameters.AddWithValue("sql", migrationScript.Sql);
                    cmd2.Parameters.AddWithValue("hash", migrationScript.Hash);
                    cmd2.ExecuteNonQuery();
                }
                
                trans.Commit();
            }
            catch
            {
                trans.Rollback();
                throw;
            }
        }
    }
    
    private static void Init(Config cfg, string dbName)
    {
        using var conn = new NpgsqlConnection(GetConnectionString(cfg, dbName));
        conn.Open();
        
    }

    private static IList<MigrationHistory> GetMigrationHistories(Config cfg, string dbName)
    {
        using var conn = new NpgsqlConnection(GetConnectionString(cfg, dbName));
        conn.Open();
        
        using var cmd = new NpgsqlCommand("""
                                          create table if not exists migration_history (
                                              id serial primary key,
                                              order int not null,
                                              file_name text not null,
                                              name text not null,
                                              sql text not null,
                                              hash text not null
                                          );
                                          """);
        cmd.ExecuteNonQuery();
        
        using var cmd2 = new NpgsqlCommand("""
                                          select  order
                                          ,       hash
                                          from    migration_history
                                          """);
        using var reader = cmd2.ExecuteReader();
        
        var migrationHistories = new List<MigrationHistory>();
        while (reader.Read())
        {
            migrationHistories.Add(new MigrationHistory(
                reader.GetInt32(0),
                reader.GetString(1)
            ));
        }

        return migrationHistories;
    }

    private static string GetConnectionString(Config cfg, string dbName)
    {
        if (string.IsNullOrEmpty(dbName))
            throw new ArgumentNullException(nameof(dbName));

        return $"Host={cfg.Host};Port={cfg.Port};Database={dbName};Username={cfg.User};Password={cfg.Password};";
    }

    private static IList<MigrationScript> GetMigrationScripts(string scriptsPath)
    {
        var migrationRegex = new Regex(@"^(?<order>\d{4})\.(?<desc>.+)\.sql$", RegexOptions.IgnoreCase);

        return Directory
            .GetFiles(scriptsPath, "*.sql")
            .Select(f => new
            {
                File = f,
                Match = migrationRegex.Match(Path.GetFileName(f))
            })
            .Where(x => x.Match.Success)
            .Select(x => new MigrationScript(
                int.Parse(x.Match.Groups["order"].Value),
                Path.GetFileName(x.File),
                x.Match.Groups["desc"].Value,
                File.ReadAllText(x.File)
            ))
            .OrderBy(x => x.Order)
            .ToArray();
    }

    private class MigrationHistory(int order, string hash)
    {
        public int Order { get; init; } = order;
        public string Hash { get; init; } = hash;
    }

    private class MigrationScript(int order, string fileName, string name, string sql)
    {
        public int Order { get; init; } = order > 0
            ? order
            : throw new Exception($"Неверный номер миграции: {order}. Должен быть больше нуля.");

        public string FileName { get; init; } = !string.IsNullOrEmpty(fileName)
            ? fileName
            : throw new Exception($"Неверное имя миграции: {fileName}. Должно быть не пустое.");

        public string Name { get; init; } = !string.IsNullOrEmpty(name)
            ? name
            : throw new Exception($"Неверное описание миграции: {name}. Должно быть не пустое.");

        public string Sql { get; init; } = string.IsNullOrEmpty(sql)
            ? sql
            : throw new Exception($"Неверный текст миграции: {sql}. Должен быть не пустой.");

        public string Hash { get; init; } = ComputeHash(sql);

        private static string ComputeHash(string sql) => Convert
            .ToHexString(SHA256
                .HashData(Encoding
                    .UTF8
                    .GetBytes(sql)));
    }

    private record Config
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
}