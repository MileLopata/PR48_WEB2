using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UserBackend.Model;

namespace UserBackend.DBHelper
{
    public class QuizSubjectLinkMapping : IEntityTypeConfiguration<QuizSubjectLink>
    {
        public void Configure(EntityTypeBuilder<QuizSubjectLink> builder)
        {
            builder.HasKey(l => new { l.QuizId, l.Subject });

            builder.Property(l => l.Subject)
                .HasConversion<string>();
        }
    }
}
