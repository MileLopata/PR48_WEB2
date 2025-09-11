using Microsoft.EntityFrameworkCore;
using UserBackend.Model;

namespace UserBackend.DBHelper
{
    public class QuizDbContext : DbContext
    {
        public QuizDbContext(DbContextOptions<QuizDbContext> options)
            : base(options) { }

        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizSubjectLink> QuizSubjectsLink { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionAnswerOption> QuestionAnswerOptions { get; set; }
        public DbSet<QuizSolvingTry> QuizSolvingTries { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new QuizMapping());
            modelBuilder.ApplyConfiguration(new QuizSubjectLinkMapping());
            modelBuilder.ApplyConfiguration(new UserAnswerMapping());
        }
    }
}
