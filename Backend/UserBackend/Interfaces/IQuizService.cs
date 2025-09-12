using UserBackend.DTO.QuestionDTO;
using UserBackend.DTO.QuizDTO;
using UserBackend.Response;

namespace UserBackend.Interfaces
{
    public interface IQuizService
    {
        Task<ResponseData<QuizDTO>> CreateQuizAsync(CreateQuizRequestDTO request);
        Task<ResponseData<QuizDTO>> UpdateQuizAsync(int id, UpdateQuizRequestDTO request);
        Task<ResponseData<bool>> DeleteQuizAsync(int id);
        Task<List<QuizDTO>> GetAllQuizzesAsync();
        Task<ResponseData<QuizDTO>> GetQuizWithoutQuestions(int quizId);
        Task<List<QuestionDTO>?> GetQuizQuestions(int quizId);

        // Question CRUD operations
        Task<ResponseData<QuestionDTO>> GetQuestionAsync(int questionId);
        Task<ResponseData<QuestionDTO>> CreateQuestionAsync(CreateQuestionDTO request);
        Task<ResponseData<QuestionDTO>> UpdateQuestionAsync(int id, UpdateQuestionRequestDTO request);
        Task<ResponseData<bool>> DeleteQuestionAsync(int questionId);
    }
}
