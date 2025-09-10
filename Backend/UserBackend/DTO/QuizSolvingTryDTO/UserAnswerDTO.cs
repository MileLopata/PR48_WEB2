namespace UserBackend.DTO.QuizSolvingTryDTO
{
    public class UserAnswerDTO
    {
        public int QuestionId { get; set; }
        public int[]? SelectedOptionIds { get; set; } = Array.Empty<int>();
        public string? FillInTheBlankInput { get; set; }
    }
}
