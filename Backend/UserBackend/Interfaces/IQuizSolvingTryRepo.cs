using UserBackend.Model;

namespace UserBackend.Interfaces
{
    public interface IQuizSolvingTryRepo : IRepo<QuizSolvingTry>
    {
        Task<IEnumerable<QuizSolvingTry>> GetSolvingTriesByUserIdAndQuizIdAsync(int userId, int quizId);
        Task<IEnumerable<QuizSolvingTry>> GetAllSolvingTriesByUserIdAsync(int userId);
        Task<IEnumerable<QuizSolvingTry>> GetAllSolvingTriesByQuizIdAsync(int quizId);
    }
}
