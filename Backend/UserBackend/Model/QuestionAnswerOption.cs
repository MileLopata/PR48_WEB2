namespace UserBackend.Model
{
    public class QuestionAnswerOption
    {
        public int Id { get; set; }
        public required string Text { get; set; } 
        public Question Question { get; set; } = null!;
        public int QuestionId { get; set; }
        public bool? IsCorrect { get; set; }          
        public string? FillInTheBlankCorrectAnswer { get; set; } 
    }
}
