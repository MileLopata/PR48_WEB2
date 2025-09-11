using UserBackend.Model;
using UserBackend.Model.Enums;

namespace UserBackend.Interfaces
{
    public interface IQuizRepo : IRepo<Quiz>
    {
        Task<IEnumerable<Quiz>> GetBySubjectAsync(QuizSubject quizSubject);
    }
}
