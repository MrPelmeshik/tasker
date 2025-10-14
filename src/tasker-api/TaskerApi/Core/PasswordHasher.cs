using System.Security.Cryptography;

namespace TaskerApi.Core;

/// <summary>
/// Статический класс для хеширования и проверки паролей с использованием PBKDF2
/// </summary>
public static class PasswordHasher
{
    /// <summary>
    /// Хеширует пароль с использованием PBKDF2 с случайной солью
    /// </summary>
    /// <param name="password">Пароль для хеширования</param>
    /// <param name="iterations">Количество итераций для PBKDF2 (по умолчанию 100,000)</param>
    /// <returns>Кортеж с хешем и солью в формате Base64</returns>
    public static (string hashBase64, string saltBase64) HashPassword(string password, int iterations = 100_000)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            32);
        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }

    /// <summary>
    /// Проверяет пароль против сохраненного хеша и соли
    /// </summary>
    /// <param name="password">Пароль для проверки</param>
    /// <param name="storedHashBase64">Сохраненный хеш в формате Base64</param>
    /// <param name="storedSaltBase64">Сохраненная соль в формате Base64</param>
    /// <param name="iterations">Количество итераций для PBKDF2 (по умолчанию 100,000)</param>
    /// <returns>True, если пароль совпадает, иначе false</returns>
    public static bool Verify(string password, string storedHashBase64, string storedSaltBase64, int iterations = 100_000)
    {
        if (string.IsNullOrWhiteSpace(storedHashBase64) || string.IsNullOrWhiteSpace(storedSaltBase64))
            return false;

        var salt = Convert.FromBase64String(storedSaltBase64);
        var expectedHash = Convert.FromBase64String(storedHashBase64);
        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            expectedHash.Length);
        return CryptographicOperations.FixedTimeEquals(expectedHash, actualHash);
    }
}
