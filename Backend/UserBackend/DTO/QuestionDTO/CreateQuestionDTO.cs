using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuestionDTO
{
    public class CreateQuestionDTO
    {
        public int QuizId { get; set; }
        public required string Text { get; init; }
        public required double Points { get; init; }
        public QuestionType Type { get; init; }
        public List<QuestionAnswerOptionDTO> AnswerOptions { get; init; } = new();
    }
}
