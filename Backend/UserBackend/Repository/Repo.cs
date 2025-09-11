using Microsoft.EntityFrameworkCore;
using UserBackend.DBHelper;
using UserBackend.Interfaces;
using System.Linq.Expressions;

namespace UserBackend.Repository
{
    public class Repo<T> : IRepo<T> where T : class
    {
        protected readonly QuizDbContext _context;
        protected readonly DbSet<T> _dbSet;
        public Repo(QuizDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return false;

            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
            => await _dbSet.Where(predicate).ToListAsync();

        public virtual async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

        public virtual async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);

        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
    }
}
