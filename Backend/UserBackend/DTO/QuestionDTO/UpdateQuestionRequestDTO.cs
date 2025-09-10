using System.ComponentModel.DataAnnotations;
using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuestionDTO
{
    public class UpdateQuestionRequestDTO
    {
        [Required]
        [StringLength(500)]
        public string Text { get; init; } = string.Empty;

        [Required]
        public double Points { get; init; }

        [Required]
        public QuestionType Type { get; init; }

        public List<QuestionAnswerOptionDTO> AnswerOptions { get; init; } = new();
    }
}
