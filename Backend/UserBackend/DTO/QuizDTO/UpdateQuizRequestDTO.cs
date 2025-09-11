using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuizDTO
{
    public class UpdateQuizRequestDTO
    {
        public required string Title { get; init; }
        public string? Description { get; init; }
        public QuizLevelOfDifficulty LevelOfDifficulty { get; init; }
        public List<QuizSubject> Subjects { get; init; } = new List<QuizSubject>();
        public TimeSpan TimeLimit { get; init; }
    }
}
