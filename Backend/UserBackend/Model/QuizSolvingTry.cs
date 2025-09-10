namespace UserBackend.Model
{
    public class QuizSolvingTry
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public Quiz Quiz { get; set; } = null!;
        public int QuizId { get; set; }
        public DateTime AttemptedAt { get; set; }
        public TimeSpan Duration { get; set; }
        public double Score { get; set; }
        public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
    }
}
