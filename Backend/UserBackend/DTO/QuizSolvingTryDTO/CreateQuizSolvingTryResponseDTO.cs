namespace UserBackend.DTO.QuizSolvingTryDTO
{
    public class CreateQuizSolvingTryResponseDTO
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public int UserId { get; set; }
        public double Score { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime AttemptedAt { get; set; }
        public List<UserAnswerResponseDTO> Results { get; set; } = new();
    }
}
