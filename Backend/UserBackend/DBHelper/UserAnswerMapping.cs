using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UserBackend.Model;

namespace UserBackend.DBHelper
{
    internal class UserAnswerMapping : IEntityTypeConfiguration<UserAnswer>
    {
        public void Configure(EntityTypeBuilder<UserAnswer> builder)
        {
            ValueComparer intArrayComparer = new ValueComparer<int[]>(
                (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2), // equality check
                c => c != null ? c.Aggregate(0, (a, v) => HashCode.Combine(a, v)) : 0, // hash code
                c => c != null ? c.ToArray() : Array.Empty<int>() // snapshot (clone)
            );

            builder.HasKey(u => u.Id);

            builder.HasOne(u => u.QuizSolvingTry)
                   .WithMany(qa => qa.UserAnswers)
                   .HasForeignKey(u => u.QuizAttemptId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(u => u.Question)
                   .WithMany()
                   .HasForeignKey(u => u.QuestionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(u => u.SelectedOptionIds)
                .HasConversion(
                    v => v == null ? null : string.Join(',', v),
                    v => string.IsNullOrEmpty(v) ? null : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray()
                )
                .Metadata.SetValueComparer(intArrayComparer);

        }
    }
}
