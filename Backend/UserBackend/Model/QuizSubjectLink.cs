using UserBackend.Model.Enums;

namespace UserBackend.Model
{
    public class QuizSubjectLink
    {
        public int QuizId { get; set; }
        public Quiz Quiz { get; set; } = null!;

        public QuizSubject Subject { get; set; }
    }
}
