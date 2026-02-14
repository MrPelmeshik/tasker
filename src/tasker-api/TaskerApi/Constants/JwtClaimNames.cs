namespace TaskerApi.Constants;

/// <summary>
/// Имена claim и типы токенов JWT.
/// </summary>
public static class JwtClaimNames
{
    public const string TokenType = "token_type";
}

/// <summary>
/// Типы JWT-токена (значение claim token_type).
/// </summary>
public static class TokenTypes
{
    public const string Access = "access";
    public const string Refresh = "refresh";
}
