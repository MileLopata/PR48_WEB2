using Microsoft.EntityFrameworkCore;
using UserBackend.DBHelper;
using UserBackend.Interfaces;
using UserBackend.Model;
using UserBackend.Model.Enums;

namespace UserBackend.Repository
{
    public class QuizRepo : Repo<Quiz>, IQuizRepo
    {
        public QuizRepo(QuizDbContext context) : base(context)
        {
        }
        public override async Task<Quiz?> GetByIdAsync(int id)
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.AnswerOptions)
                .FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<IEnumerable<Quiz>> GetBySubjectAsync(QuizSubject quizSubject)
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.AnswerOptions)
                .Include(q => q.Subjects)
                .Where(q => q.Subjects.Any(link => link.Subject == quizSubject))
                .ToListAsync();
        }
        public override async Task<IEnumerable<Quiz>> GetAllAsync()
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.AnswerOptions)
                .Include(q => q.Subjects)
                .ToListAsync();
        }
    }
}
