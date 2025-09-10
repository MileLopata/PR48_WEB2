using UserBackend.Model.Enums;

namespace UserBackend.DTO.QuestionDTO
{
    public class QuestionDTO    //QuestionResponse
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty; // the question itself, its text
        public double Points { get; set; } // how many points the question yields/gives
        public QuestionType Type { get; set; }
        public int QuizId { get; set; }
        public ICollection<QuestionAnswerOptionDTO> AnswerOptions { get; set; } = new List<QuestionAnswerOptionDTO>();
    }
}
