using Microsoft.EntityFrameworkCore;
using UserBackend.DBHelper;
using UserBackend.Interfaces;
using UserBackend.Model;

namespace UserBackend.Repository
{
    public class QuizSolvingTryRepo : Repo<QuizSolvingTry>, IQuizSolvingTryRepo
    {
        public QuizSolvingTryRepo(QuizDbContext context) : base(context)
        {
        }
        public override async Task<QuizSolvingTry?> GetByIdAsync(int id)
        {
            return await _context.QuizSolvingTries
                .Include(a => a.UserAnswers)
                .FirstOrDefaultAsync(a => a.Id == id);
        }
        public async Task<IEnumerable<QuizSolvingTry>> GetAllSolvingTriesByQuizIdAsync(int quizId)
        {
            return await _context.QuizSolvingTries
                .Where(a => a.QuizId == quizId)
                .Include(a => a.UserAnswers)
                .ToListAsync();
        }

        public async Task<IEnumerable<QuizSolvingTry>> GetAllSolvingTriesByUserIdAsync(int userId)
        {
            return await _context.QuizSolvingTries
                .Where(a => a.UserId == userId)
                .Include(a => a.UserAnswers)
                .ToListAsync();
        }

        public async Task<IEnumerable<QuizSolvingTry>> GetSolvingTriesByUserIdAndQuizIdAsync(int userId, int quizId)
        {
            return await _context.QuizSolvingTries
                .Where(a => a.UserId == userId && a.QuizId == quizId)
                .Include(a => a.UserAnswers)
                .ToListAsync();
        }
    }
}
