using Microsoft.EntityFrameworkCore;
using UserBackend.DBHelper;
using UserBackend.Interfaces;
using UserBackend.Model;

namespace UserBackend.Repository
{
    public class UserRepo : IUserRepo
    {
        private readonly UserDbContext _userDbContext;

        public UserRepo(UserDbContext userDbContext)
        {
            _userDbContext = userDbContext;
        }

        public async Task<User?> GetByIdAsync(int id) => await _userDbContext.Users.FindAsync(id);

        public async Task<IEnumerable<User>> GetAllAsync() => await _userDbContext.Users.ToListAsync();

        public async Task<User?> GetByEmailAsync(string email) =>
            await _userDbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> GetByUsernameAsync(string username) =>
            await _userDbContext.Users.FirstOrDefaultAsync(u => u.Username == username);

        public async Task<User?> GetByEmailOrUsernameAsync(string emailOrUsername) =>
            await _userDbContext.Users.FirstOrDefaultAsync(u => u.Email == emailOrUsername || u.Username == emailOrUsername);

        public async Task<bool> EmailExistsAsync(string email) =>
            await _userDbContext.Users.AnyAsync(u => u.Email == email);

        public async Task<bool> UsernameExistsAsync(string username) =>
            await _userDbContext.Users.AnyAsync(u => u.Username == username);

        public async Task<User> AddAsync(User user)
        {
            await _userDbContext.Users.AddAsync(user);
            await _userDbContext.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateAsync(User user)
        {
            _userDbContext.Users.Update(user);
            await _userDbContext.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await GetByIdAsync(id);
            if (user == null) return false;

            _userDbContext.Users.Remove(user);
            await _userDbContext.SaveChangesAsync();
            return true;
        }

        public async Task<int> SaveChangesAsync() => await _userDbContext.SaveChangesAsync();
    }
}
