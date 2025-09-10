namespace UserBackend.DTO.QuestionDTO
{
    public class QuestionAnswerOptionDTO
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool? IsCorrect { get; set; }         
        public string? FillInTheBlankCorrectAnswer { get; set; } 
    }
}
