using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UserBackend.Model;

namespace UserBackend.DBHelper
{
    internal class QuizMapping : IEntityTypeConfiguration<Quiz>
    {
        public void Configure(EntityTypeBuilder<Quiz> builder)
        {
            builder.Property(e => e.Difficulty)
                .HasConversion<string>();

            builder.HasMany(q => q.Subjects)
                .WithOne(l => l.Quiz)
                .HasForeignKey(l => l.QuizId);
        }
    }
}
