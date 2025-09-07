using System.Security.Cryptography;

namespace TaskerApi.Core;

public static class PasswordHasher
{
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


