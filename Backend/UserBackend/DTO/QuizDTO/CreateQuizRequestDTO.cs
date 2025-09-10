using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuizDTO;

public record CreateQuizRequestDTO(
    string Title,
    string? Description,
    QuizLevelOfDifficulty LevelOfDifficulty,
    List<QuizSubject> Subjects,
    TimeSpan TimeLimit
);
