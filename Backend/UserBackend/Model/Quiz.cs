using UserBackend.Model.Enums;

namespace UserBackend.Model
{
    public class Quiz
    {
        public int Id { get; set; }
        public int NumberOfQuestions { get; set; }
        public required string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public TimeSpan TimeLimit { get; set; }
        public QuizLevelOfDifficulty LevelOfDifficulty { get; set; }
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public List<QuizSubjectLink> Subjects { get; set; } = new List<QuizSubjectLink>();
    }
}
