using UserBackend.Model.Enums;

namespace UserBackend.Model
{
    public class Question
    {
        public int Id { get; set; }
        public required string Text { get; set; }
        public double Points { get; set; }
        public QuestionType Type { get; set; }
        public int QuizId { get; set; }
        public Quiz Quiz { get; set; }
        public ICollection<QuestionAnswerOption> AnswerOptions { get; set; } = new List<QuestionAnswerOption>();


    }
}
