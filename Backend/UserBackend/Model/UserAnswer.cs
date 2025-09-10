namespace UserBackend.Model
{
    public class UserAnswer
    {
        public int Id { get; set; }

        public int QuizAttemptId { get; set; }
        public QuizSolvingTry QuizSolvingTry { get; set; } = null!;

        public double Score { get; set; }
        public Question Question { get; set; } = null!;
        public int QuestionId { get; set; }


        public int[]? SelectedOptionIds { get; set; } = Array.Empty<int>(); // for multiple choice
        public string? FillInTheBlankInput { get; set; } 
    }
}
