using Microsoft.EntityFrameworkCore;
using UserBackend.DBHelper;
using UserBackend.Interfaces;
using UserBackend.Model;

namespace UserBackend.Repository
{
    public class QuestionRepo : Repo<Question>, IQuestionRepo
    {
        public QuestionRepo(QuizDbContext context) : base(context)
        {
        }
        public async Task<IEnumerable<Question>> GetAllByQuizIdAsync(int quizId)
        {
            return await _context.Questions
                .Where(q => q.QuizId == quizId)
                .Include(q => q.AnswerOptions)
                .ToListAsync();
        }

        public async Task<IEnumerable<QuestionAnswerOption>> GetAnswerOptionsForQuestionAsync(int questionId)
        {
            return await _context.QuestionAnswerOptions
                .Where(a => a.QuestionId == questionId)
                .ToListAsync();
        }
        public override async Task<Question?> GetByIdAsync(int id)
        {
            return await _context.Questions
                .Include(q => q.AnswerOptions)
                .FirstOrDefaultAsync(q => q.Id == id);
        }
    }
}
