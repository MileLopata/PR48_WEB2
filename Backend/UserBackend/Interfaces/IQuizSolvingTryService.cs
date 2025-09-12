using UserBackend.DTO.QuizSolvingTryDTO;
using UserBackend.Response;

namespace UserBackend.Interfaces
{
    public interface IQuizSolvingTryService
    {
        Task<ResponseData<CreateQuizSolvingTryResponseDTO>> CreateQuizSolvingTryAsync(int userId, CreateQuizSolvingTryRequestDTO request);
        Task<ResponseData<GetQuizSolvingTryResponseDTO>> GetQuizSolvingTryAsync(int id);
        Task<ResponseData<bool>> DeleteQuizSolvingTryAsync(int id);
        Task<ResponseData<List<GetQuizSolvingTryResponseDTO>>> GetSolvingTriesByQuiz(int quizId);
        Task<ResponseData<List<GetQuizSolvingTryResponseDTO>>> GetSolvingTriesByUser(int userId);
        Task<ResponseData<List<GetQuizLeaderboardDTO>>> GetLeaderboardByQuiz(int quizId);
    }
}
