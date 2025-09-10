using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using UserBackend.Model;
using UserBackend.Model.Enums;

namespace UserBackend.DBHelper
{
    public class DbInitializer
    {
        public static void SeedAdmin(UserDbContext context)
        {
            context.Database.Migrate();

            if (!context.Users.Any(u => u.Role == UserAuthorizationRole.ADMIN))
            {
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@gmail.com",
                    PasswordHash = new PasswordHasher<User>().HashPassword(null!, "admin"),
                    Role = UserAuthorizationRole.ADMIN
                };

                context.Users.Add(adminUser);
                context.SaveChanges();
            }
        }
    }
}
