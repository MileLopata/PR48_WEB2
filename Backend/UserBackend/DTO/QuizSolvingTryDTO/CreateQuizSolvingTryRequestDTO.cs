namespace UserBackend.DTO.QuizSolvingTryDTO
{
    public class CreateQuizSolvingTryRequestDTO
    {
        public int QuizId { get; set; }
        public TimeSpan Duration { get; set; }
        public List<UserAnswerDTO> Answers { get; set; } = new();
    }
}
