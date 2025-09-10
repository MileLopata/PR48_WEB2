using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuizDTO
{
    public class QuizDTO    //QuizResponse
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public int NumberOfQuestions { get; init; }
        public QuizLevelOfDifficulty LevelOfDifficulty { get; init; }
        public required List<QuizSubject> Subjects { get; init; }
        public TimeSpan TimeLimit { get; init; }
    }
}
