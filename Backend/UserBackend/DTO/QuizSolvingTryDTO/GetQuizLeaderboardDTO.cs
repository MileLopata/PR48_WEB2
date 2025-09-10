namespace UserBackend.DTO.QuizSolvingTryDTO
{
    public class GetQuizLeaderboardDTO
    {
        public int QuizId { get; set; }
        public int UserRankingPosition { get; set; }
        public required string Username { get; set; }
        public double Score { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime AttemptedAt { get; set; }
    }
}
