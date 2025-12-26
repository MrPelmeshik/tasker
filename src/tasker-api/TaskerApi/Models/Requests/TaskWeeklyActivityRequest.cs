using System.ComponentModel.DataAnnotations;

namespace TaskerApi.Models.Requests;

/// <summary>
/// Запрос на получение недельной активности задач
/// </summary>
public class TaskWeeklyActivityRequest
{
    /// <summary>
    /// Год
    /// </summary>
    [Required(ErrorMessage = "Год обязателен")]
    [Range(2020, 2030, ErrorMessage = "Год должен быть в диапазоне от 2020 до 2030")]
    public int Year { get; set; }

    /// <summary>
    /// Номер недели в году (1-53)
    /// </summary>
    [Required(ErrorMessage = "Номер недели обязателен")]
    [Range(1, 53, ErrorMessage = "Номер недели должен быть в диапазоне от 1 до 53")]
    public int WeekNumber { get; set; }
}
