namespace UserBackend.DTO.QuizSolvingTryDTO
{
    public class UserAnswerResponseDTO
    {
        public int QuestionId { get; set; }
        public double Score { get; set; }
        public int[]? SelectedOptionIds { get; set; } = Array.Empty<int>();
        public string? FillInTheBlankInput { get; set; }
    }
}
