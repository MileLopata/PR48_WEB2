using UserBackend.Model;

namespace UserBackend.Interfaces
{
    public interface IQuestionRepo : IRepo<Question>
    {
        Task<IEnumerable<Question>> GetAllByQuizIdAsync(int quizId);
        Task<IEnumerable<QuestionAnswerOption>> GetAnswerOptionsForQuestionAsync(int questionId);
    }
}
