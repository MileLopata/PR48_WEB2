using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuestionDTO
{
    public class CreateQuestionRequestDTO
    {
        public required string Text { get; init; }
        public required double Points { get; init; }
        public QuestionType Type { get; init; }
        public List<QuestionAnswerOptionDTO> AnswerOptions { get; init; } = new();
    }
}
